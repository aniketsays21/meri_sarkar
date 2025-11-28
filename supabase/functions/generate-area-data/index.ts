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

    console.log("Generating area data for pincode:", pincode);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, get location details from pincode_constituency
    const { data: locationData, error: locationError } = await supabase
      .from("pincode_constituency")
      .select("*")
      .eq("pincode", pincode)
      .maybeSingle();

    if (locationError) {
      console.error("Error fetching location:", locationError);
    }

    const location = locationData || {
      state: "Unknown",
      district: "Unknown",
      assembly_constituency: "Unknown",
      parliamentary_constituency: "Unknown",
      ward: "Unknown"
    };

    console.log("Location data:", location);

    // Check if we have a cached report that hasn't expired
    const { data: cachedReport, error: cacheError } = await supabase
      .from("area_reports")
      .select("*")
      .eq("pincode", pincode)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cachedReport && !cacheError) {
      console.log("Returning cached report for pincode:", pincode);
      return new Response(
        JSON.stringify({ 
          areaReport: cachedReport, 
          location,
          fromCache: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate new report using AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Generate a realistic area report for pincode ${pincode} in ${location.district || "Unknown"}, ${location.state || "Unknown"}, India.
    
The area is in ${location.assembly_constituency || "Unknown"} assembly constituency, ${location.parliamentary_constituency || "Unknown"} parliamentary constituency.

Generate realistic data for an Indian locality. Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "roads_score": <number 40-90>,
  "roads_details": {
    "currentWork": "<ongoing road work description>",
    "contractor": "<realistic Indian contractor name>",
    "budget": "<budget in crores/lakhs>",
    "pastExperience": "<past road work summary>",
    "futureExpectations": "<future plans>"
  },
  "water_score": <number 50-95>,
  "water_details": {
    "currentWork": "<ongoing water project>",
    "contractor": "<contractor name>",
    "budget": "<budget>",
    "pastExperience": "<past water improvements>",
    "futureExpectations": "<future water plans>"
  },
  "safety_score": <number 45-85>,
  "safety_details": {
    "currentWork": "<safety initiatives>",
    "contractor": "<implementing agency>",
    "budget": "<budget>",
    "pastExperience": "<crime/safety history>",
    "futureExpectations": "<future safety plans>"
  },
  "health_score": <number 50-90>,
  "health_details": {
    "currentWork": "<health infrastructure work>",
    "contractor": "<healthcare provider/contractor>",
    "budget": "<budget>",
    "pastExperience": "<healthcare history>",
    "futureExpectations": "<future health plans>"
  },
  "overall_score": <average of all scores>,
  "summary": "<2-3 sentence summary of the area's development status>",
  "key_issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "recent_developments": ["<development 1>", "<development 2>"]
}`;

    console.log("Calling AI to generate area report...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a data generator for Indian governance data. Generate realistic but fictional data for demonstration purposes. Always return valid JSON only, no markdown formatting." 
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", aiResponse.status);
      throw new Error("Failed to generate area report");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response received, parsing...");

    // Parse AI response - handle potential markdown code blocks
    let reportData;
    try {
      // Remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      reportData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Generate fallback data
      reportData = {
        roads_score: 65,
        roads_details: {
          currentWork: "Road maintenance in progress",
          contractor: "Local PWD",
          budget: "₹50 Lakhs",
          pastExperience: "Regular maintenance conducted",
          futureExpectations: "Improvement expected by next quarter"
        },
        water_score: 70,
        water_details: {
          currentWork: "Pipeline extension project",
          contractor: "Municipal Corporation",
          budget: "₹1.2 Crores",
          pastExperience: "Water supply improved in last 2 years",
          futureExpectations: "24x7 water supply planned"
        },
        safety_score: 60,
        safety_details: {
          currentWork: "CCTV installation",
          contractor: "Police Department",
          budget: "₹30 Lakhs",
          pastExperience: "Crime rate stable",
          futureExpectations: "Enhanced surveillance planned"
        },
        health_score: 72,
        health_details: {
          currentWork: "PHC upgrade",
          contractor: "Health Department",
          budget: "₹80 Lakhs",
          pastExperience: "Basic healthcare available",
          futureExpectations: "Specialist services to be added"
        },
        overall_score: 67,
        summary: "The area is undergoing steady development with focus on infrastructure improvement.",
        key_issues: ["Traffic congestion", "Irregular water supply", "Limited public transport"],
        recent_developments: ["New road constructed", "Health center upgraded"]
      };
    }

    // Save to database
    const { data: savedReport, error: saveError } = await supabase
      .from("area_reports")
      .upsert({
        pincode,
        state: location.state,
        district: location.district,
        constituency: location.assembly_constituency,
        ward: location.ward,
        roads_score: reportData.roads_score,
        roads_details: reportData.roads_details,
        water_score: reportData.water_score,
        water_details: reportData.water_details,
        safety_score: reportData.safety_score,
        safety_details: reportData.safety_details,
        health_score: reportData.health_score,
        health_details: reportData.health_details,
        overall_score: reportData.overall_score,
        summary: reportData.summary,
        key_issues: reportData.key_issues,
        recent_developments: reportData.recent_developments,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }, { onConflict: 'pincode' })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving report:", saveError);
    }

    console.log("Area report generated and cached successfully");

    return new Response(
      JSON.stringify({ 
        areaReport: savedReport || { ...reportData, pincode, ...location },
        location,
        fromCache: false 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating area data:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
