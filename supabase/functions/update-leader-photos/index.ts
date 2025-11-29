import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchWikipediaPhoto(name: string): Promise<string | null> {
  try {
    // Format name for Wikipedia API (replace spaces with underscores)
    const formattedName = name.replace(/ /g, '_');
    
    // First, search for the Wikipedia page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(formattedName)}&prop=pageimages&pithumbsize=400&format=json&origin=*`;
    
    console.log(`Fetching Wikipedia photo for: ${name}`);
    console.log(`URL: ${searchUrl}`);
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    console.log(`Wikipedia response for ${name}:`, JSON.stringify(data));
    
    const pages = data.query?.pages;
    if (!pages) {
      console.log(`No pages found for ${name}`);
      return null;
    }
    
    // Get the first page result
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];
    
    if (pageId === '-1' || !page.thumbnail) {
      // Try with "(politician)" suffix for disambiguation
      const politicianSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(formattedName)}_(politician)&prop=pageimages&pithumbsize=400&format=json&origin=*`;
      
      console.log(`Trying with (politician) suffix: ${politicianSearchUrl}`);
      
      const politicianResponse = await fetch(politicianSearchUrl);
      const politicianData = await politicianResponse.json();
      
      const politicianPages = politicianData.query?.pages;
      if (politicianPages) {
        const politicianPageId = Object.keys(politicianPages)[0];
        const politicianPage = politicianPages[politicianPageId];
        
        if (politicianPageId !== '-1' && politicianPage.thumbnail) {
          console.log(`Found photo with (politician) suffix: ${politicianPage.thumbnail.source}`);
          return politicianPage.thumbnail.source;
        }
      }
      
      console.log(`No thumbnail found for ${name}`);
      return null;
    }
    
    console.log(`Found photo: ${page.thumbnail.source}`);
    return page.thumbnail.source;
  } catch (error) {
    console.error(`Error fetching Wikipedia photo for ${name}:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body to check if specific leader ID is provided
    let specificLeaderId: string | null = null;
    try {
      const body = await req.json();
      specificLeaderId = body.leaderId || null;
    } catch {
      // No body provided, update all leaders
    }

    let query = supabase.from('leaders').select('id, name, image_url');
    
    if (specificLeaderId) {
      query = query.eq('id', specificLeaderId);
    }

    const { data: leaders, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching leaders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${leaders?.length || 0} leaders to update`);

    const results = {
      updated: [] as string[],
      failed: [] as string[],
      skipped: [] as string[],
    };

    for (const leader of leaders || []) {
      // Skip if already has a real Wikipedia/Wikimedia image
      if (leader.image_url && leader.image_url.includes('wikimedia.org')) {
        console.log(`Skipping ${leader.name} - already has Wikipedia image`);
        results.skipped.push(leader.name);
        continue;
      }

      const photoUrl = await fetchWikipediaPhoto(leader.name);

      if (photoUrl) {
        const { error: updateError } = await supabase
          .from('leaders')
          .update({ image_url: photoUrl })
          .eq('id', leader.id);

        if (updateError) {
          console.error(`Error updating ${leader.name}:`, updateError);
          results.failed.push(leader.name);
        } else {
          console.log(`Updated ${leader.name} with photo: ${photoUrl}`);
          results.updated.push(leader.name);
        }
      } else {
        console.log(`No photo found for ${leader.name}`);
        results.failed.push(leader.name);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Update results:', results);

    return new Response(JSON.stringify({
      success: true,
      results,
      message: `Updated ${results.updated.length} leaders, ${results.failed.length} failed, ${results.skipped.length} skipped`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-leader-photos function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
