import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pincode } = await req.json();
    
    if (!pincode) {
      throw new Error('Pincode is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating leader activities for pincode: ${pincode}`);

    // Check for cached activities (less than 24 hours old)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: cachedActivities, error: cacheError } = await supabase
      .from('leader_activities')
      .select(`
        *,
        leaders!inner(pincode)
      `)
      .gte('activity_date', yesterday.toISOString().split('T')[0])
      .limit(1);

    if (cachedActivities && cachedActivities.length > 0) {
      console.log('Found cached activities from today');
      
      // Fetch all activities for leaders in this pincode
      const { data: allActivities } = await supabase
        .from('leader_activities')
        .select(`
          *,
          leaders!inner(*)
        `)
        .eq('leaders.pincode', pincode)
        .gte('activity_date', yesterday.toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      return new Response(
        JSON.stringify({ activities: allActivities || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch leaders for this pincode
    const { data: leaders, error: leadersError } = await supabase
      .from('leaders')
      .select('*')
      .eq('pincode', pincode);

    if (leadersError) {
      console.error('Error fetching leaders:', leadersError);
      throw leadersError;
    }

    if (!leaders || leaders.length === 0) {
      return new Response(
        JSON.stringify({ activities: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating activities for ${leaders.length} leaders...`);

    // Generate activities for each leader using AI
    const activitiesPromises = leaders.map(async (leader) => {
      const prompt = `Generate realistic daily political activities for ${leader.name} (${leader.designation}, ${leader.party || 'Independent'}).

Today's date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

Based on their position as ${leader.designation}, generate 1-3 realistic activities they might have done today. Use these activity types:
- parliament_attended (if MP/PM)
- assembly_attended (if MLA/CM/Governor)
- question_asked
- tweet
- speech
- fund_released
- event_attended
- absent (if no activity)
- no_activity (if weekend or holiday)

Return ONLY a valid JSON array of activities in this exact format:
[
  {
    "activity_type": "parliament_attended",
    "activity_description": "Attended Lok Sabha session on infrastructure bill",
    "is_positive": true,
    "source_url": null
  }
]

Make it realistic - not everyone is super active every day. Some leaders might have no_activity or be absent.`;

      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a political data analyst. Return only valid JSON arrays, no markdown or extra text.' },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for ${leader.name}:`, aiResponse.status);
          return [];
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content || '[]';
        
        // Clean the response - remove markdown code blocks if present
        const cleanedContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        let activities;
        try {
          activities = JSON.parse(cleanedContent);
        } catch (parseError) {
          console.error(`JSON parse error for ${leader.name}:`, cleanedContent);
          return [];
        }

        if (!Array.isArray(activities)) {
          console.error(`Invalid activities format for ${leader.name}`);
          return [];
        }

        // Insert activities into database
        const activitiesToInsert = activities.map((activity: any) => ({
          leader_id: leader.id,
          activity_type: activity.activity_type || 'no_activity',
          activity_description: activity.activity_description || 'No recorded activity',
          activity_date: new Date().toISOString().split('T')[0],
          is_positive: activity.is_positive !== false,
          source_url: activity.source_url || null,
        }));

        if (activitiesToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('leader_activities')
            .insert(activitiesToInsert);

          if (insertError) {
            console.error(`Error inserting activities for ${leader.name}:`, insertError);
            return [];
          }
        }

        return activitiesToInsert.map((act: any) => ({ ...act, leaders: leader }));
      } catch (error) {
        console.error(`Error generating activities for ${leader.name}:`, error);
        return [];
      }
    });

    const allActivities = (await Promise.all(activitiesPromises)).flat();

    console.log(`Generated ${allActivities.length} activities`);

    return new Response(
      JSON.stringify({ activities: allActivities }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in populate-leader-activities:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});