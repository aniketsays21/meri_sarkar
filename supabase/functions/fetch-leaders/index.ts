import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { pincode } = await req.json();

    if (!pincode) {
      return new Response(
        JSON.stringify({ error: 'Pincode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching leaders for pincode:', pincode);

    // Step 1: Get constituency mapping for the pincode
    const { data: pincodeData, error: pincodeError } = await supabase
      .from('pincode_constituency')
      .select('*')
      .eq('pincode', pincode)
      .single();

    if (pincodeError || !pincodeData) {
      console.log('Pincode not found in mapping, returning empty array');
      return new Response(
        JSON.stringify({ 
          leaders: [], 
          message: 'No constituency mapping found for this pincode. Data coming soon!' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found pincode mapping:', pincodeData);

    // Step 2: Get constituency IDs
    const constituencyNames = [
      pincodeData.assembly_constituency,
      pincodeData.parliamentary_constituency,
      pincodeData.state,
      `${pincodeData.state} Governor`
    ].filter(Boolean);

    const { data: constituencies, error: constituenciesError } = await supabase
      .from('constituencies')
      .select('id, name, type')
      .in('name', constituencyNames);

    if (constituenciesError) {
      console.error('Error fetching constituencies:', constituenciesError);
      throw constituenciesError;
    }

    console.log('Found constituencies:', constituencies);

    // Step 3: Get leaders for these constituencies
    const constituencyIds = constituencies?.map(c => c.id) || [];
    
    const { data: leaders, error: leadersError } = await supabase
      .from('leaders')
      .select('*')
      .in('constituency_id', constituencyIds)
      .order('hierarchy_level', { ascending: false });

    if (leadersError) {
      console.error('Error fetching leaders:', leadersError);
      throw leadersError;
    }

    console.log('Found leaders:', leaders?.length);

    // Step 4: Format and return the data
    const formattedLeaders = leaders?.map(leader => ({
      id: leader.id,
      name: leader.name,
      designation: leader.designation,
      party: leader.party,
      constituency: leader.constituency,
      state: leader.state,
      image_url: leader.image_url,
      hierarchy_level: leader.hierarchy_level,
      attendance: leader.attendance,
      funds_utilized: leader.funds_utilized,
      questions_raised: leader.questions_raised,
      bio: leader.bio,
      education: leader.education,
      assets: leader.assets,
      criminal_cases: leader.criminal_cases,
    })) || [];

    return new Response(
      JSON.stringify({ 
        leaders: formattedLeaders,
        pincode_info: {
          ward: pincodeData.ward,
          assembly_constituency: pincodeData.assembly_constituency,
          parliamentary_constituency: pincodeData.parliamentary_constituency,
          district: pincodeData.district,
          state: pincodeData.state,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-leaders function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
