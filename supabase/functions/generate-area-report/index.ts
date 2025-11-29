import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pincode } = await req.json();
    
    if (!pincode) {
      return new Response(
        JSON.stringify({ error: "Pincode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating area report for pincode:", pincode);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we have a valid (non-expired) report for this pincode
    const { data: existingReport, error: fetchError } = await supabase
      .from("area_reports")
      .select("*")
      .eq("pincode", pincode)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching existing report:", fetchError);
    }

    // If we have a valid cached report, return it
    if (existingReport) {
      console.log("Found cached report for pincode:", pincode);
      return new Response(
        JSON.stringify(existingReport),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("No cached report found, generating new one with AI...");

    // Get location details from pincode_constituency table
    const { data: locationData } = await supabase
      .from("pincode_constituency")
      .select("*")
      .eq("pincode", pincode)
      .maybeSingle();

    const locationContext = locationData
      ? `Location: ${locationData.ward || ""}, ${locationData.assembly_constituency || ""}, ${locationData.district || ""}, ${locationData.state || ""}`
      : `Pincode: ${pincode}`;

    // Generate report using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are a political data analyst for India. Generate a realistic area development report for TODAY.

Location: ${locationContext}
Today's Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

Create a JSON report with this EXACT structure (no markdown, just JSON):
{
  "overall_score": 73,
  "ward_rank": 64,
  "total_wards": 81,
  "rank_change": -2,
  "roads_score": 72,
  "roads_trend": "up",
  "roads_details": {
    "currentWork": "Road widening on Main Street",
    "contractor": "ABC Constructions Ltd",
    "budget": "₹2.5 Crores",
    "pastExperience": "Completed 5 road projects in past 2 years",
    "futureExpectations": "Expected completion by March 2025"
  },
  "water_score": 68,
  "water_trend": "down",
  "water_details": {
    "currentWork": "New pipeline installation in Ward 5",
    "contractor": "Aqua Infrastructure Pvt Ltd",
    "budget": "₹1.8 Crores",
    "pastExperience": "Maintained water supply for 3 wards",
    "futureExpectations": "24/7 water supply planned by June 2025"
  },
  "safety_score": 55,
  "safety_trend": "stable",
  "safety_details": {
    "currentWork": "CCTV installation in main areas",
    "contractor": "SecureCity Solutions",
    "budget": "₹80 Lakhs",
    "pastExperience": "Installed 200+ cameras in nearby areas",
    "futureExpectations": "Complete surveillance coverage by year-end"
  },
  "health_score": 75,
  "health_trend": "stable",
  "health_details": {
    "currentWork": "PHC expansion and equipment upgrade",
    "contractor": "HealthFirst Infrastructure",
    "budget": "₹3.2 Crores",
    "pastExperience": "Built 2 PHCs in neighboring districts",
    "futureExpectations": "New ICU ward operational by April 2025"
  },
  "daily_updates": [
    {
      "type": "water",
      "text": "31 water complaints filed in your area today",
      "severity": "warning"
    },
    {
      "type": "roads",
      "text": "Roads rating improved by 3 points this week",
      "severity": "positive"
    },
    {
      "type": "safety",
      "text": "2 safety incidents reported nearby",
      "severity": "alert"
    },
    {
      "type": "health",
      "text": "PHC expansion work started today",
      "severity": "positive"
    }
  ],
  "summary": "Your ward ranks #64 out of 81 wards. Water supply issues increased today while road conditions are improving.",
  "key_issues": [
    "Street lighting needs improvement",
    "Water supply disruptions reported",
    "Need more police patrolling"
  ],
  "recent_developments": [
    "New PHC expansion started",
    "Road widening project 60% complete",
    "CCTV cameras installed in main areas"
  ]
}

IMPORTANT GUIDELINES:
- ward_rank: Random between 40-75 out of 81 wards
- rank_change: Random between -3 to +3
- Trends: Use "up", "down", or "stable" based on scores
- daily_updates: Generate 3-4 TODAY-SPECIFIC bullet points with these types: water, roads, safety, health
- Severity levels: "positive", "warning", "alert", "info"
- Scores should be between 50-85
- Make daily_updates realistic for TODAY - not generic statements
- Make it realistic for ${locationData?.state || "India"} with local context

Return ONLY the JSON object, no markdown formatting.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a data generator that returns ONLY valid JSON. No explanations, no markdown code blocks, just the JSON object." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error("No content from AI");
    }

    console.log("AI response received, parsing...");

    // Parse the AI response - clean up any markdown code blocks
    let reportData;
    try {
      let cleanContent = aiContent.trim();
      // Remove markdown code blocks if present
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      reportData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Calculate overall score if not provided
    if (!reportData.overall_score) {
      reportData.overall_score = Math.round(
        (reportData.roads_score + reportData.water_score + reportData.safety_score + reportData.health_score) / 4
      );
    }

    // Prepare the report for database insertion
    const newReport = {
      pincode,
      state: locationData?.state || null,
      district: locationData?.district || null,
      constituency: locationData?.assembly_constituency || null,
      ward: locationData?.ward || null,
      ward_rank: reportData.ward_rank || null,
      total_wards: reportData.total_wards || 81,
      rank_change: reportData.rank_change || 0,
      roads_score: reportData.roads_score,
      roads_trend: reportData.roads_trend || 'stable',
      roads_details: reportData.roads_details,
      water_score: reportData.water_score,
      water_trend: reportData.water_trend || 'stable',
      water_details: reportData.water_details,
      safety_score: reportData.safety_score,
      safety_trend: reportData.safety_trend || 'stable',
      safety_details: reportData.safety_details,
      health_score: reportData.health_score,
      health_trend: reportData.health_trend || 'stable',
      health_details: reportData.health_details,
      overall_score: reportData.overall_score,
      daily_updates: reportData.daily_updates || [],
      summary: reportData.summary,
      key_issues: reportData.key_issues,
      recent_developments: reportData.recent_developments,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    // Insert the new report
    const { data: insertedReport, error: insertError } = await supabase
      .from("area_reports")
      .insert(newReport)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting report:", insertError);
      // Return the generated report even if insert fails
      return new Response(
        JSON.stringify(newReport),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("New report generated and cached for pincode:", pincode);

    return new Response(
      JSON.stringify(insertedReport),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-area-report:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate area report";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
