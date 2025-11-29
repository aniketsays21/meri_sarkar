import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PositionConfig {
  level: number;
  type: string;
  designation: string;
  getName: (pincodeData: PincodeData) => string;
  getState: (pincodeData: PincodeData) => string;
}

interface PincodeData {
  ward: string | null;
  assembly_constituency: string | null;
  parliamentary_constituency: string | null;
  district: string | null;
  state: string;
}

// Define the complete political hierarchy
const HIERARCHY_CONFIG: PositionConfig[] = [
  {
    level: 6,
    type: 'prime_minister',
    designation: 'Prime Minister of India',
    getName: () => 'India',
    getState: () => 'India'
  },
  {
    level: 5,
    type: 'governor',
    designation: 'Governor',
    getName: (data) => `${data.state} Governor`,
    getState: (data) => data.state
  },
  {
    level: 4,
    type: 'chief_minister',
    designation: 'Chief Minister',
    getName: (data) => data.state,
    getState: (data) => data.state
  },
  {
    level: 3,
    type: 'mp',
    designation: 'Member of Parliament',
    getName: (data) => data.parliamentary_constituency || '',
    getState: (data) => data.state
  },
  {
    level: 2,
    type: 'mla',
    designation: 'Member of Legislative Assembly',
    getName: (data) => data.assembly_constituency || '',
    getState: (data) => data.state
  },
  {
    level: 1,
    type: 'ward_councillor',
    designation: 'Ward Councillor',
    getName: (data) => data.ward || data.assembly_constituency || '',
    getState: (data) => data.state
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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

    const leaders: any[] = [];
    const missingPositions: PositionConfig[] = [];

    // Step 2: Check each hierarchy level for existing leaders with IMPROVED MATCHING
    for (const position of HIERARCHY_CONFIG) {
      const constituencyName = position.getName(pincodeData);
      const state = position.getState(pincodeData);
      
      if (!constituencyName) {
        console.log(`Skipping ${position.type} - no constituency name available`);
        continue;
      }

      let existingLeader = null;
      let leaderError = null;

      // ============================================
      // IMPROVED MATCHING LOGIC
      // ============================================
      if (position.type === 'prime_minister') {
        // For PM: Search by hierarchy level OR designation pattern OR name pattern
        const { data, error } = await supabase
          .from('leaders')
          .select('*')
          .or('hierarchy_level.eq.6,designation.ilike.%Prime Minister%,name.ilike.%Modi%')
          .limit(1)
          .maybeSingle();
        existingLeader = data;
        leaderError = error;
      } 
      else if (position.type === 'governor') {
        // For Governor: Match by state AND (hierarchy level OR designation)
        const { data, error } = await supabase
          .from('leaders')
          .select('*')
          .eq('state', state)
          .or('hierarchy_level.eq.5,designation.ilike.%Governor%')
          .limit(1)
          .maybeSingle();
        existingLeader = data;
        leaderError = error;
      } 
      else if (position.type === 'chief_minister') {
        // For CM: Match by state AND (hierarchy level OR designation)
        const { data, error } = await supabase
          .from('leaders')
          .select('*')
          .eq('state', state)
          .or('hierarchy_level.eq.4,designation.ilike.%Chief Minister%')
          .limit(1)
          .maybeSingle();
        existingLeader = data;
        leaderError = error;
      } 
      else if (position.type === 'mp') {
        // For MP: Match by constituency name pattern AND (hierarchy level OR designation)
        const { data, error } = await supabase
          .from('leaders')
          .select('*')
          .eq('state', state)
          .or(`hierarchy_level.eq.3,designation.ilike.%Member of Parliament%,designation.ilike.%MP%`)
          .or(`constituency.ilike.%${constituencyName}%,constituency.eq.${constituencyName}`)
          .limit(1)
          .maybeSingle();
        existingLeader = data;
        leaderError = error;
      } 
      else if (position.type === 'mla') {
        // For MLA: Match by constituency and state
        const { data, error } = await supabase
          .from('leaders')
          .select('*')
          .eq('state', state)
          .or(`constituency.ilike.%${constituencyName}%,constituency.eq.${constituencyName}`)
          .or('hierarchy_level.eq.2,designation.ilike.%MLA%,designation.ilike.%Member of Legislative Assembly%')
          .limit(1)
          .maybeSingle();
        existingLeader = data;
        leaderError = error;
      } 
      else if (position.type === 'ward_councillor') {
        // For Ward Councillor: Match by ward/constituency name
        const { data, error } = await supabase
          .from('leaders')
          .select('*')
          .eq('state', state)
          .or(`constituency.ilike.%${constituencyName}%,constituency.eq.${constituencyName}`)
          .or('hierarchy_level.eq.1,designation.ilike.%Ward%,designation.ilike.%Councillor%,designation.ilike.%Corporator%')
          .limit(1)
          .maybeSingle();
        existingLeader = data;
        leaderError = error;
      }

      if (leaderError) {
        console.error(`Error checking ${position.type}:`, leaderError);
      }

      if (existingLeader) {
        console.log(`Found existing ${position.type}:`, existingLeader.name);
        leaders.push(existingLeader);
      } else {
        console.log(`Missing ${position.type} for ${constituencyName}, ${state}`);
        missingPositions.push(position);
      }
    }

    // Step 3: Auto-populate missing leaders (limit to 2 at a time to avoid timeout)
    const positionsToPopulate = missingPositions.slice(0, 2);
    
    for (const position of positionsToPopulate) {
      const constituencyName = position.getName(pincodeData);
      const state = position.getState(pincodeData);

      if (!constituencyName) continue;

      console.log(`Auto-populating ${position.type}: ${constituencyName}, ${state}`);

      try {
        const populateResponse = await fetch(`${supabaseUrl}/functions/v1/auto-populate-leader`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            position_type: position.type,
            constituency_name: constituencyName,
            state: state,
            hierarchy_level: position.level
          })
        });

        if (populateResponse.ok) {
          const result = await populateResponse.json();
          if (result.leader) {
            console.log(`Successfully populated ${position.type}:`, result.leader.name, result.cached ? '(cached)' : '(new)');
            leaders.push(result.leader);
          }
        } else {
          const errorText = await populateResponse.text();
          console.error(`Failed to populate ${position.type}:`, errorText);
        }
      } catch (populateError) {
        console.error(`Error populating ${position.type}:`, populateError);
      }
    }

    // Sort leaders by hierarchy level (highest first)
    leaders.sort((a, b) => (b.hierarchy_level || 0) - (a.hierarchy_level || 0));

    // Format the response
    const formattedLeaders = leaders.map(leader => ({
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
    }));

    const remainingMissing = missingPositions.length - positionsToPopulate.length;

    return new Response(
      JSON.stringify({ 
        leaders: formattedLeaders,
        pincode_info: {
          ward: pincodeData.ward,
          assembly_constituency: pincodeData.assembly_constituency,
          parliamentary_constituency: pincodeData.parliamentary_constituency,
          district: pincodeData.district,
          state: pincodeData.state,
        },
        has_more_to_load: remainingMissing > 0,
        message: remainingMissing > 0 
          ? `Loading ${remainingMissing} more leaders...` 
          : undefined
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
