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
      .limit(20);

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

    const aiPrompt = `Find ALL Indian politicians whose name contains "${query}". 
    
    CRITICAL INSTRUCTIONS:
    1. Return ALL matching politicians, not just the most famous one
    2. Include variations of the name (e.g., "Nitin" should return ALL politicians named Nitin - Nitin Gadkari, Nitin Patel, etc.)
    3. For EACH politician, provide COMPLETE detailed information
    
    Return ONLY a JSON array with ALL matching Indian politicians. For each leader provide:
    - name: Full official name
    - designation: COMPLETE current position (e.g., "Prime Minister of India", "Union Minister for Road Transport & Highways", "Chief Minister of Karnataka", "Member of Parliament (Lok Sabha)", "Member of Legislative Assembly (MLA)")
    - party: Full party name (e.g., "Bharatiya Janata Party (BJP)", "Indian National Congress (INC)", "Aam Aadmi Party (AAP)")
    - constituency: The constituency they represent (required - e.g., "Nagpur", "Varanasi", "Amethi")
    - state: Full state name (e.g., "Maharashtra", "Karnataka", "Delhi")
    - bio: Detailed 3-4 sentence biography covering their political career, major achievements, and current role
    - attendance: Parliament/assembly attendance percentage as number 0-100 (use realistic estimates based on public records)
    - funds_utilized: Development funds utilization percentage as number 0-100
    - questions_raised: Number of questions raised in parliament/assembly (realistic number)
    - assets: Declared assets in INR as number (use latest available data)
    - criminal_cases: Number of pending criminal cases as number (0 if none)
    
    IMPORTANT: 
    - Return ALL politicians matching the query, not just one
    - If query is "Nitin", return Nitin Gadkari, Nitin Patel, and ALL other politicians named Nitin
    - If query is "Narendra", return Narendra Modi, Narendra Singh Tomar, etc.
    - Return empty array [] ONLY if absolutely no politician matches
    - Return ONLY valid JSON array, no markdown, no explanation
    
    Example format:
    [
      {"name": "Nitin Jairam Gadkari", "designation": "Union Minister for Road Transport & Highways", "party": "Bharatiya Janata Party (BJP)", "constituency": "Nagpur", "state": "Maharashtra", "bio": "A seasoned politician known for his work in infrastructure development, particularly road construction. He previously served as the President of the BJP and is currently serving his second term as Union Minister.", "attendance": 88, "funds_utilized": 85, "questions_raised": 45, "assets": 150000000, "criminal_cases": 0},
      {"name": "Nitin Patel", "designation": "Deputy Chief Minister of Gujarat", "party": "Bharatiya Janata Party (BJP)", "constituency": "Mehsana", "state": "Gujarat", "bio": "Senior BJP leader serving as Deputy Chief Minister of Gujarat. Known for his work in agriculture and rural development.", "attendance": 92, "funds_utilized": 80, "questions_raised": 38, "assets": 80000000, "criminal_cases": 0}
    ]`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: "You are an expert on Indian politics with comprehensive knowledge of ALL Indian politicians at national, state, and local levels. Always return complete, detailed information for ALL matching politicians. Return only valid JSON arrays." },
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