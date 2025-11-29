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

    const prompt = `Generate a realistic area development report for an Indian locality.
${locationContext}

Generate realistic data for infrastructure metrics. Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "roads_score": <number 40-90>,
  "roads_details": {
    "currentWork": "<ongoing road project description>",
    "contractor": "<realistic Indian contractor company name>",
    "budget": "<budget in crores/lakhs format like ₹2.5 Crores>",
    "pastExperience": "<brief past project experience>",
    "futureExpectations": "<expected completion and improvements>"
  },
  "water_score": <number 40-90>,
  "water_details": {
    "currentWork": "<ongoing water project>",
    "contractor": "<contractor name>",
    "budget": "<budget>",
    "pastExperience": "<past experience>",
    "futureExpectations": "<future expectations>"
  },
  "safety_score": <number 40-90>,
  "safety_details": {
    "currentWork": "<ongoing safety/security project>",
    "contractor": "<contractor name>",
    "budget": "<budget>",
    "pastExperience": "<past experience>",
    "futureExpectations": "<future expectations>"
  },
  "health_score": <number 40-90>,
  "health_details": {
    "currentWork": "<ongoing health infrastructure project>",
    "contractor": "<contractor name>",
    "budget": "<budget>",
    "pastExperience": "<past experience>",
    "futureExpectations": "<future expectations>"
  },
  "overall_score": <average of all scores>,
  "summary": "<2-3 sentence summary of area development status>",
  "key_issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "recent_developments": ["<development 1>", "<development 2>"]
}

Make it realistic for ${locationData?.state || "India"} with local context. Vary the scores - not all should be similar.`;

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
