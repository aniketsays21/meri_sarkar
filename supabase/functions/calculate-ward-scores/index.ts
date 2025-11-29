import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PollResponse {
  pincode: string;
  ward: string;
  response: boolean;
  created_at: string;
}

interface Alert {
  pincode: string;
  category: string;
  upvotes: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting ward score calculation...');

    // Get current week and year
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();
    
    // Get week start date (7 days ago)
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    // Fetch all poll responses from the last week
    const { data: pollResponses, error: pollError } = await supabase
      .from('poll_responses')
      .select('*')
      .gte('created_at', weekStart.toISOString());

    if (pollError) {
      console.error('Error fetching poll responses:', pollError);
      throw pollError;
    }

    // Fetch all alerts from the last week
    const { data: alerts, error: alertsError } = await supabase
      .from('area_alerts')
      .select('pincode, category, upvotes')
      .gte('created_at', weekStart.toISOString())
      .eq('status', 'active');

    if (alertsError) {
      console.error('Error fetching alerts:', alertsError);
      throw alertsError;
    }

    // Group data by pincode
    const wardData: Record<string, any> = {};

    // Process poll responses
    if (pollResponses) {
      for (const response of pollResponses) {
        if (!response.pincode) continue;
        
        if (!wardData[response.pincode]) {
          wardData[response.pincode] = {
            pincode: response.pincode,
            ward: response.ward,
            responses: { cleanliness: [], water: [], roads: [], safety: [] },
            alerts: { cleanliness: 0, water: 0, roads: 0, safety: 0 },
            confirmations: { cleanliness: 0, water: 0, roads: 0, safety: 0 },
            totalResponses: 0,
            totalAlerts: 0,
            totalConfirmations: 0,
          };
        }

        // Get poll category
        const { data: poll } = await supabase
          .from('daily_polls')
          .select('category')
          .eq('id', (response as any).poll_id)
          .single();

        if (poll?.category) {
          wardData[response.pincode].responses[poll.category].push(response.response);
          wardData[response.pincode].totalResponses++;
        }
      }
    }

    // Process alerts
    alerts?.forEach((alert: Alert) => {
      if (!alert.pincode) return;
      
      if (!wardData[alert.pincode]) {
        wardData[alert.pincode] = {
          pincode: alert.pincode,
          ward: '',
          responses: { cleanliness: [], water: [], roads: [], safety: [] },
          alerts: { cleanliness: 0, water: 0, roads: 0, safety: 0 },
          confirmations: { cleanliness: 0, water: 0, roads: 0, safety: 0 },
          totalResponses: 0,
          totalAlerts: 0,
          totalConfirmations: 0,
        };
      }

      wardData[alert.pincode].alerts[alert.category]++;
      wardData[alert.pincode].confirmations[alert.category] += alert.upvotes || 0;
      wardData[alert.pincode].totalAlerts++;
      wardData[alert.pincode].totalConfirmations += alert.upvotes || 0;
    });

    // Calculate scores for each ward
    const wardScores = [];
    
    for (const [pincode, data] of Object.entries(wardData)) {
      // Get location details
      const { data: location } = await supabase
        .from('pincode_constituency')
        .select('ward, district, state')
        .eq('pincode', pincode)
        .single();

      const ward = data.ward || location?.ward || `Ward ${pincode}`;
      const city = location?.district || 'Unknown';
      const state = location?.state || 'Unknown';

      // Calculate category scores
      const scores = {
        cleanliness: calculateCategoryScore(
          data.responses.cleanliness,
          data.alerts.cleanliness,
          data.confirmations.cleanliness,
          data.totalResponses
        ),
        water: calculateCategoryScore(
          data.responses.water,
          data.alerts.water,
          data.confirmations.water,
          data.totalResponses
        ),
        roads: calculateCategoryScore(
          data.responses.roads,
          data.alerts.roads,
          data.confirmations.roads,
          data.totalResponses
        ),
        safety: calculateCategoryScore(
          data.responses.safety,
          data.alerts.safety,
          data.confirmations.safety,
          data.totalResponses
        ),
      };

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        scores.cleanliness * 0.3 +
        scores.water * 0.3 +
        scores.roads * 0.2 +
        scores.safety * 0.2
      );

      wardScores.push({
        pincode,
        ward,
        city,
        state,
        week_number: weekNumber,
        year,
        cleanliness_score: scores.cleanliness,
        water_score: scores.water,
        roads_score: scores.roads,
        safety_score: scores.safety,
        overall_score: overallScore,
        total_responses: data.totalResponses,
        total_alerts: data.totalAlerts,
        total_confirmations: data.totalConfirmations,
      });
    }

    // Sort by overall score and assign ranks
    wardScores.sort((a, b) => b.overall_score - a.overall_score);
    
    // Get previous week's ranks
    const { data: prevScores } = await supabase
      .from('ward_weekly_scores')
      .select('pincode, rank')
      .eq('week_number', weekNumber - 1)
      .eq('year', year);

    const prevRankMap: Record<string, number> = {};
    prevScores?.forEach((score: any) => {
      prevRankMap[score.pincode] = score.rank;
    });

    // Assign ranks and calculate rank changes
    const scoresToInsert = wardScores.map((score, index) => {
      const rank = index + 1;
      const prevRank = prevRankMap[score.pincode] || rank;
      const rankChange = prevRank - rank; // Positive = improved, Negative = worsened

      return {
        ...score,
        rank,
        prev_rank: prevRank,
        rank_change: rankChange,
      };
    });

    // Upsert scores
    const { error: upsertError } = await supabase
      .from('ward_weekly_scores')
      .upsert(scoresToInsert, {
        onConflict: 'pincode,week_number,year',
      });

    if (upsertError) {
      console.error('Error upserting scores:', upsertError);
      throw upsertError;
    }

    console.log(`Successfully calculated scores for ${scoresToInsert.length} wards`);

    return new Response(
      JSON.stringify({
        success: true,
        wardsProcessed: scoresToInsert.length,
        weekNumber,
        year,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in calculate-ward-scores:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function calculateCategoryScore(
  responses: boolean[],
  alertCount: number,
  confirmations: number,
  totalResponses: number
): number {
  // If no data, return neutral score
  if (responses.length === 0 && alertCount === 0) {
    return 50;
  }

  // Calculate poll negativity rate (% of "No" responses)
  const pollBadRate = responses.length > 0
    ? (responses.filter(r => !r).length / responses.length) * 100
    : 0;

  // Normalize alerts per 1000 users (assuming active users = totalResponses)
  const normalizedAlerts = totalResponses > 0
    ? (alertCount / totalResponses) * 1000
    : alertCount * 10; // Fallback multiplier if no responses

  // Normalize confirmations per 1000 users
  const normalizedConfirmations = totalResponses > 0
    ? (confirmations / totalResponses) * 1000
    : confirmations * 10;

  // Calculate "dirt score" (higher = worse)
  const dirtScore =
    0.6 * pollBadRate +
    0.3 * Math.min(normalizedAlerts, 100) + // Cap at 100 to prevent extreme values
    0.1 * Math.min(normalizedConfirmations, 100);

  // Convert to category score (higher = better)
  const categoryScore = Math.max(0, Math.min(100, 100 - dirtScore));

  return Math.round(categoryScore);
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
