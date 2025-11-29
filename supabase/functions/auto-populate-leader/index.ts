import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeaderData {
  name: string;
  designation: string;
  party: string;
  bio: string;
  education: string;
  attendance: number;
  funds_utilized: number;
  questions_raised: number;
  bills_passed: number;
  criminal_cases: number;
  assets: number;
  total_funds_allocated: number;
  office_email: string;
  office_phone: string;
  office_address: string;
  current_work: string;
  social_media: {
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  professional_history: Array<{
    position: string;
    organization: string;
    period: string;
    description: string;
  }>;
  election_history: Array<{
    year: number;
    constituency: string;
    result: string;
    votes: number;
    margin: number;
  }>;
  ongoing_projects: Array<{
    name: string;
    budget: number;
    progress: number;
    description: string;
  }>;
  completed_projects: Array<{
    name: string;
    budget: number;
    completedDate: string;
    description: string;
  }>;
}

// Map position types to valid constituency types in DB
const POSITION_TO_CONSTITUENCY_TYPE: Record<string, string> = {
  'prime_minister': 'parliamentary',
  'governor': 'governor',
  'chief_minister': 'state',
  'mp': 'parliamentary',
  'mla': 'assembly',
  'ward_councillor': 'assembly' // Use assembly for ward since "ward" is not a valid type
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { position_type, constituency_name, state, hierarchy_level, constituency_id } = await req.json();

    console.log(`Auto-populating leader for: ${position_type} - ${constituency_name}, ${state}`);

    // Generate leader data using Lovable AI
    const aiPrompt = generatePrompt(position_type, constituency_name, state);
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert on Indian politics with deep knowledge of elected representatives at all levels - from Prime Minister to Ward Councillors. 
            
Provide accurate, factual information about political leaders. If you don't have specific information about a leader, provide realistic placeholder data that matches typical patterns for that position.

IMPORTANT: 
- Always return valid JSON matching the exact schema requested
- All numeric values must be WHOLE NUMBERS (integers), not decimals
- Attendance and funds_utilized should be integers between 0 and 100
- Do not include any markdown formatting or code blocks`
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_leader_data',
              description: 'Provide comprehensive data about a political leader',
              parameters: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Full name of the leader' },
                  designation: { type: 'string', description: 'Official designation/title' },
                  party: { type: 'string', description: 'Political party name' },
                  bio: { type: 'string', description: 'Brief biography (100-150 words)' },
                  education: { type: 'string', description: 'Educational qualifications' },
                  attendance: { type: 'integer', description: 'Attendance percentage as whole number (0-100)' },
                  funds_utilized: { type: 'integer', description: 'Funds utilization percentage as whole number (0-100)' },
                  questions_raised: { type: 'integer', description: 'Number of questions raised in sessions' },
                  bills_passed: { type: 'integer', description: 'Number of bills passed/supported' },
                  criminal_cases: { type: 'integer', description: 'Number of pending criminal cases' },
                  assets: { type: 'integer', description: 'Declared assets in rupees' },
                  total_funds_allocated: { type: 'integer', description: 'Total funds allocated in rupees' },
                  office_email: { type: 'string', description: 'Official email address' },
                  office_phone: { type: 'string', description: 'Official phone number' },
                  office_address: { type: 'string', description: 'Office address' },
                  current_work: { type: 'string', description: 'Current focus areas and initiatives' },
                  social_media: {
                    type: 'object',
                    properties: {
                      twitter: { type: 'string' },
                      facebook: { type: 'string' },
                      website: { type: 'string' }
                    }
                  },
                  professional_history: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        position: { type: 'string' },
                        organization: { type: 'string' },
                        period: { type: 'string' },
                        description: { type: 'string' }
                      },
                      required: ['position', 'organization', 'period', 'description']
                    }
                  },
                  election_history: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        year: { type: 'integer' },
                        constituency: { type: 'string' },
                        result: { type: 'string' },
                        votes: { type: 'integer' },
                        margin: { type: 'integer' }
                      },
                      required: ['year', 'constituency', 'result', 'votes', 'margin']
                    }
                  },
                  ongoing_projects: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        budget: { type: 'integer' },
                        progress: { type: 'integer' },
                        description: { type: 'string' }
                      },
                      required: ['name', 'budget', 'progress', 'description']
                    }
                  },
                  completed_projects: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        budget: { type: 'integer' },
                        completedDate: { type: 'string' },
                        description: { type: 'string' }
                      },
                      required: ['name', 'budget', 'completedDate', 'description']
                    }
                  }
                },
                required: ['name', 'designation', 'party', 'bio', 'education', 'attendance', 'funds_utilized', 'questions_raised', 'bills_passed', 'criminal_cases', 'assets', 'total_funds_allocated', 'office_email', 'office_phone', 'office_address', 'current_work', 'social_media', 'professional_history', 'election_history', 'ongoing_projects', 'completed_projects'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_leader_data' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI Response received');

    // Extract the tool call response
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error('No tool call in response:', JSON.stringify(aiData));
      throw new Error('Invalid AI response format');
    }

    const leaderData: LeaderData = JSON.parse(toolCall.function.arguments);
    console.log('Parsed leader data:', leaderData.name);

    // IMPORTANT: Convert all numeric values to integers to avoid DB errors
    const sanitizedLeaderData = {
      ...leaderData,
      attendance: Math.round(Number(leaderData.attendance) || 0),
      funds_utilized: Math.round(Number(leaderData.funds_utilized) || 0),
      questions_raised: Math.round(Number(leaderData.questions_raised) || 0),
      bills_passed: Math.round(Number(leaderData.bills_passed) || 0),
      criminal_cases: Math.round(Number(leaderData.criminal_cases) || 0),
      assets: Math.round(Number(leaderData.assets) || 0),
      total_funds_allocated: Math.round(Number(leaderData.total_funds_allocated) || 0),
    };

    // Try to fetch image from Wikipedia
    let imageUrl = null;
    try {
      imageUrl = await fetchWikipediaImage(leaderData.name);
      console.log('Wikipedia image:', imageUrl ? 'Found' : 'Not found');
    } catch (imgError) {
      console.log('Could not fetch Wikipedia image:', imgError);
    }

    // Get the correct constituency type for this position
    const constituencyType = POSITION_TO_CONSTITUENCY_TYPE[position_type] || 'assembly';

    // Create or get constituency
    let finalConstituencyId = constituency_id;
    if (!finalConstituencyId) {
      const { data: existingConstituency } = await supabase
        .from('constituencies')
        .select('id')
        .eq('name', constituency_name)
        .eq('state', state)
        .single();

      if (existingConstituency) {
        finalConstituencyId = existingConstituency.id;
      } else {
        const { data: newConstituency, error: constituencyError } = await supabase
          .from('constituencies')
          .insert({
            name: constituency_name,
            type: constituencyType,
            state: state
          })
          .select('id')
          .single();

        if (constituencyError) {
          console.error('Error creating constituency:', constituencyError);
          // Continue without constituency_id - it's not critical
        } else {
          finalConstituencyId = newConstituency?.id;
        }
      }
    }

    // Insert leader into database
    const { data: insertedLeader, error: insertError } = await supabase
      .from('leaders')
      .insert({
        name: sanitizedLeaderData.name,
        designation: sanitizedLeaderData.designation,
        party: sanitizedLeaderData.party,
        bio: sanitizedLeaderData.bio,
        education: sanitizedLeaderData.education,
        attendance: sanitizedLeaderData.attendance,
        funds_utilized: sanitizedLeaderData.funds_utilized,
        questions_raised: sanitizedLeaderData.questions_raised,
        bills_passed: sanitizedLeaderData.bills_passed,
        criminal_cases: sanitizedLeaderData.criminal_cases,
        assets: sanitizedLeaderData.assets,
        total_funds_allocated: sanitizedLeaderData.total_funds_allocated,
        office_email: leaderData.office_email,
        office_phone: leaderData.office_phone,
        office_address: leaderData.office_address,
        current_work: leaderData.current_work,
        social_media: leaderData.social_media,
        professional_history: leaderData.professional_history,
        election_history: leaderData.election_history,
        ongoing_projects: leaderData.ongoing_projects,
        completed_projects: leaderData.completed_projects,
        image_url: imageUrl,
        hierarchy_level: hierarchy_level,
        constituency_id: finalConstituencyId,
        constituency: constituency_name,
        state: state
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting leader:', insertError);
      throw insertError;
    }

    console.log('Leader inserted successfully:', insertedLeader?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        leader: insertedLeader 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-populate-leader:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generatePrompt(positionType: string, constituencyName: string, state: string): string {
  const positionDescriptions: Record<string, string> = {
    'prime_minister': `the Prime Minister of India (current as of 2024)`,
    'governor': `the Governor of ${state} state (current as of 2024)`,
    'chief_minister': `the Chief Minister of ${state} state (current as of 2024)`,
    'mp': `the Member of Parliament (Lok Sabha) representing ${constituencyName} constituency in ${state} (current as of 2024)`,
    'mla': `the Member of Legislative Assembly (MLA) representing ${constituencyName} constituency in ${state} (current as of 2024)`,
    'ward_councillor': `the Ward Councillor/Corporator of ${constituencyName} in ${state} (current as of 2024). If you don't have specific information, provide realistic data for a typical ward councillor in this area.`
  };

  return `Provide complete and accurate details about ${positionDescriptions[positionType] || `the political representative for ${constituencyName}, ${state}`}.

IMPORTANT: All numeric values MUST be whole numbers (integers), not decimals!
- attendance: integer between 0 and 100
- funds_utilized: integer between 0 and 100
- questions_raised: integer
- bills_passed: integer
- criminal_cases: integer
- assets: integer (in rupees)
- total_funds_allocated: integer (in rupees)

Include:
- Full name and official designation
- Political party affiliation
- A brief biography (100-150 words)
- Educational qualifications
- Performance metrics: attendance percentage, funds utilization percentage, questions raised
- Number of bills passed/supported
- Criminal cases (if any, from public records)
- Declared assets (approximate in INR)
- Total funds allocated for their constituency
- Official contact: email, phone, office address
- Current work and focus areas
- Social media handles (Twitter, Facebook, official website)
- Professional history (previous positions held)
- Election history (past elections contested with results)
- 2-3 ongoing development projects with budgets and progress
- 2-3 completed projects

Use real, verified information where available. For positions where specific data isn't widely known (like ward councillors), provide realistic placeholder data that matches typical patterns for that position in ${state}.`;
}

async function fetchWikipediaImage(name: string): Promise<string | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=400&origin=*`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    const pages = data.query?.pages;
    
    if (!pages) return null;
    
    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;
    
    return pages[pageId]?.thumbnail?.source || null;
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return null;
  }
}
