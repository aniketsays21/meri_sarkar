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
    const { query } = await req.json();
    
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ leaders: [], source: "none" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Searching for leader:", query);

    // Step 1: Search in database first
    const { data: dbLeaders, error: dbError } = await supabase
      .from("leaders")
      .select("id, name, designation, party, constituency, state, image_url")
      .ilike("name", `%${query}%`)
      .limit(10);

    if (dbError) {
      console.error("DB search error:", dbError);
    }

    if (dbLeaders && dbLeaders.length > 0) {
      console.log("Found leaders in DB:", dbLeaders.length);
      return new Response(
        JSON.stringify({ leaders: dbLeaders, source: "database" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Not found in DB - Use Gemini to search for Indian political leader
    console.log("No results in DB, searching with AI...");
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ leaders: [], source: "none", error: "AI not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiPrompt = `Search for Indian political leader named "${query}". 
    
    Return ONLY a JSON array with up to 5 matching Indian politicians. For each leader include:
    - name: Full official name
    - designation: Current political position (e.g., Prime Minister, Chief Minister, MLA, MP, etc.)
    - party: Political party abbreviation (e.g., BJP, INC, AAP, TMC, etc.)
    - constituency: The constituency they represent (if applicable)
    - state: Indian state they are associated with
    - bio: Brief 1-2 sentence description
    - attendance: Estimated parliament/assembly attendance percentage (number 0-100)
    - funds_utilized: Estimated development funds utilization percentage (number 0-100)
    - questions_raised: Estimated number of questions raised (number)
    - assets: Estimated declared assets in INR (number)
    - criminal_cases: Number of pending criminal cases (number, 0 if none known)
    
    If no Indian political leader matches this name, return an empty array [].
    
    IMPORTANT: Return ONLY valid JSON array, no markdown, no explanation. Example format:
    [{"name": "...", "designation": "...", "party": "...", "constituency": "...", "state": "...", "bio": "...", "attendance": 85, "funds_utilized": 75, "questions_raised": 50, "assets": 50000000, "criminal_cases": 0}]`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert on Indian politics. Return only valid JSON arrays." },
          { role: "user", content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ leaders: [], source: "error", error: "Rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ leaders: [], source: "error", error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ leaders: [], source: "error", error: "AI search failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";
    
    console.log("AI response:", content);

    // Parse AI response
    let parsedLeaders = [];
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      parsedLeaders = JSON.parse(cleanContent);
      
      if (!Array.isArray(parsedLeaders)) {
        parsedLeaders = [];
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify({ leaders: [], source: "ai", error: "Failed to parse AI response" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (parsedLeaders.length === 0) {
      return new Response(
        JSON.stringify({ leaders: [], source: "ai" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Save new leaders to database
    const leadersToInsert = parsedLeaders.map((leader: any) => ({
      name: leader.name,
      designation: leader.designation || "Political Leader",
      party: leader.party || null,
      constituency: leader.constituency || null,
      state: leader.state || null,
      bio: leader.bio || null,
      attendance: typeof leader.attendance === 'number' ? leader.attendance : null,
      funds_utilized: typeof leader.funds_utilized === 'number' ? leader.funds_utilized : null,
      questions_raised: typeof leader.questions_raised === 'number' ? leader.questions_raised : null,
      assets: typeof leader.assets === 'number' ? leader.assets : null,
      criminal_cases: typeof leader.criminal_cases === 'number' ? leader.criminal_cases : null,
      hierarchy_level: getHierarchyLevel(leader.designation),
      image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(leader.name)}`,
    }));

    console.log("Inserting leaders to DB:", leadersToInsert.length);

    const { data: insertedLeaders, error: insertError } = await supabase
      .from("leaders")
      .insert(leadersToInsert)
      .select("id, name, designation, party, constituency, state, image_url");

    if (insertError) {
      console.error("Insert error:", insertError);
      // Return AI results even if DB insert fails
      return new Response(
        JSON.stringify({ 
          leaders: leadersToInsert.map((l: any, i: number) => ({ ...l, id: `temp-${i}` })), 
          source: "ai",
          saved: false 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Leaders saved successfully");

    return new Response(
      JSON.stringify({ leaders: insertedLeaders, source: "ai", saved: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Search failed", leaders: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getHierarchyLevel(designation: string): number {
  const d = (designation || "").toLowerCase();
  if (d.includes("president") || d.includes("prime minister")) return 1;
  if (d.includes("governor") || d.includes("chief minister")) return 2;
  if (d.includes("member of parliament") || d.includes("mp") || d.includes("lok sabha") || d.includes("rajya sabha")) return 3;
  if (d.includes("member of legislative") || d.includes("mla") || d.includes("mlc")) return 4;
  if (d.includes("councillor") || d.includes("corporator") || d.includes("mayor")) return 5;
  return 4; // default
}