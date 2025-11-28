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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // List of famous Indian politicians to populate
    const famousPoliticians = [
      "Narendra Modi",
      "Amit Shah", 
      "Rahul Gandhi",
      "Arvind Kejriwal",
      "Akhilesh Yadav",
      "Mayawati",
      "Yogi Adityanath",
      "Mamata Banerjee",
      "Uddhav Thackeray",
      "Sharad Pawar",
      "Nitish Kumar",
      "Naveen Patnaik",
      "M.K. Stalin",
      "Jagan Mohan Reddy",
      "K. Chandrashekar Rao",
      "Pinarayi Vijayan",
      "Ashok Gehlot",
      "Bhagwant Mann",
      "Hemant Soren",
      "Conrad Sangma"
    ];

    console.log("Starting to populate famous politicians...");

    const allLeaders = [];

    for (const politicianName of famousPoliticians) {
      console.log(`Fetching data for: ${politicianName}`);

      const aiPrompt = `Provide COMPLETE and DETAILED information about ${politicianName}, the Indian politician.
      
      Return ONLY a JSON object (not array) with the following information:
      - name: Full official name
      - designation: COMPLETE current position with full details (e.g., "Prime Minister of India", "Union Home Minister", "Chief Minister of Uttar Pradesh")
      - party: Full party name (e.g., "Bharatiya Janata Party (BJP)", "Indian National Congress (INC)")
      - constituency: The constituency they represent (e.g., "Varanasi", "Gandhinagar", "Lucknow")
      - state: Full state name (e.g., "Uttar Pradesh", "Gujarat", "Delhi")
      - bio: Detailed 4-5 sentence biography covering their political career journey, major achievements, educational background, and current role
      - attendance: Parliament/assembly attendance percentage as number 0-100 (use realistic estimates based on public records)
      - funds_utilized: Development funds utilization percentage as number 0-100
      - questions_raised: Number of questions raised in parliament/assembly (realistic number)
      - assets: Declared assets in INR as number (use latest available data from affidavits)
      - criminal_cases: Number of pending criminal cases as number (0 if none)
      - education: Educational qualifications (e.g., "Bachelor of Arts, University of Delhi")
      - bills_passed: Number of bills/legislations passed or sponsored
      - total_funds_allocated: Total development funds allocated in INR
      
      IMPORTANT:
      - Provide ACCURATE and DETAILED information based on latest available data
      - Make the bio comprehensive and informative
      - Return ONLY valid JSON object (not array), no markdown, no explanation
      
      Example format:
      {
        "name": "Narendra Damodardas Modi",
        "designation": "Prime Minister of India",
        "party": "Bharatiya Janata Party (BJP)",
        "constituency": "Varanasi",
        "state": "Uttar Pradesh",
        "bio": "Narendra Modi is the 14th Prime Minister of India, serving since May 2014. Before becoming Prime Minister, he served as Chief Minister of Gujarat from 2001 to 2014. He is known for his focus on economic development, digital governance initiatives like Digital India, and foreign policy engagements. Modi won the 2014 and 2019 general elections with decisive mandates.",
        "attendance": 92,
        "funds_utilized": 88,
        "questions_raised": 0,
        "assets": 2500000,
        "criminal_cases": 0,
        "education": "Master of Arts in Political Science, Gujarat University",
        "bills_passed": 45,
        "total_funds_allocated": 50000000000
      }`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { 
              role: "system", 
              content: "You are an expert on Indian politics with comprehensive knowledge of prominent Indian politicians. Always return complete, accurate, and detailed information. Return only valid JSON objects." 
            },
            { role: "user", content: aiPrompt }
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error(`AI API error for ${politicianName}:`, aiResponse.status);
        continue;
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content || "{}";

      let leaderData;
      try {
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
        
        leaderData = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error(`Failed to parse AI response for ${politicianName}:`, parseError);
        continue;
      }

      // Check if leader already exists
      const { data: existing } = await supabase
        .from("leaders")
        .select("id")
        .ilike("name", leaderData.name)
        .single();

      if (existing) {
        // Update existing record with comprehensive data
        const { error: updateError } = await supabase
          .from("leaders")
          .update({
            designation: leaderData.designation || "Political Leader",
            party: leaderData.party || null,
            constituency: leaderData.constituency || null,
            state: leaderData.state || null,
            bio: leaderData.bio || null,
            attendance: typeof leaderData.attendance === 'number' ? leaderData.attendance : null,
            funds_utilized: typeof leaderData.funds_utilized === 'number' ? leaderData.funds_utilized : null,
            questions_raised: typeof leaderData.questions_raised === 'number' ? leaderData.questions_raised : null,
            assets: typeof leaderData.assets === 'number' ? leaderData.assets : null,
            criminal_cases: typeof leaderData.criminal_cases === 'number' ? leaderData.criminal_cases : null,
            education: leaderData.education || null,
            bills_passed: typeof leaderData.bills_passed === 'number' ? leaderData.bills_passed : null,
            total_funds_allocated: typeof leaderData.total_funds_allocated === 'number' ? leaderData.total_funds_allocated : null,
            hierarchy_level: getHierarchyLevel(leaderData.designation),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error(`Error updating ${politicianName}:`, updateError);
        } else {
          console.log(`Updated ${politicianName}`);
          allLeaders.push({ ...leaderData, id: existing.id, status: "updated" });
        }
      } else {
        // Insert new record
        const { data: inserted, error: insertError } = await supabase
          .from("leaders")
          .insert({
            name: leaderData.name,
            designation: leaderData.designation || "Political Leader",
            party: leaderData.party || null,
            constituency: leaderData.constituency || null,
            state: leaderData.state || null,
            bio: leaderData.bio || null,
            attendance: typeof leaderData.attendance === 'number' ? leaderData.attendance : null,
            funds_utilized: typeof leaderData.funds_utilized === 'number' ? leaderData.funds_utilized : null,
            questions_raised: typeof leaderData.questions_raised === 'number' ? leaderData.questions_raised : null,
            assets: typeof leaderData.assets === 'number' ? leaderData.assets : null,
            criminal_cases: typeof leaderData.criminal_cases === 'number' ? leaderData.criminal_cases : null,
            education: leaderData.education || null,
            bills_passed: typeof leaderData.bills_passed === 'number' ? leaderData.bills_passed : null,
            total_funds_allocated: typeof leaderData.total_funds_allocated === 'number' ? leaderData.total_funds_allocated : null,
            hierarchy_level: getHierarchyLevel(leaderData.designation),
            image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(leaderData.name)}`,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error inserting ${politicianName}:`, insertError);
        } else {
          console.log(`Inserted ${politicianName}`);
          allLeaders.push({ ...inserted, status: "inserted" });
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Populated ${allLeaders.length} famous politicians`,
        leaders: allLeaders
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Population error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Population failed" }),
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
  return 4;
}
