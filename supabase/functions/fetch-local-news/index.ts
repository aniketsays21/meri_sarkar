import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pincode to city mapping for common Indian cities
const pincodeToCity: Record<string, string> = {
  // Bangalore
  "560001": "Bangalore",
  "560002": "Bangalore",
  "560068": "Bangalore",
  "560070": "Bangalore",
  "560076": "Bangalore",
  "560078": "Bangalore",
  "560100": "Bangalore",
  // Mumbai
  "400001": "Mumbai",
  "400050": "Mumbai",
  "400053": "Mumbai",
  // Delhi
  "110001": "Delhi",
  "110011": "Delhi",
  "110025": "Delhi",
  // Chennai
  "600001": "Chennai",
  "600020": "Chennai",
  // Hyderabad
  "500001": "Hyderabad",
  "500032": "Hyderabad",
  // Kolkata
  "700001": "Kolkata",
  "700020": "Kolkata",
  // Pune
  "411001": "Pune",
  "411014": "Pune",
};

function getCityFromPincode(pincode: string): string {
  // Check exact match first
  if (pincodeToCity[pincode]) {
    return pincodeToCity[pincode];
  }
  
  // Determine city by pincode range
  const prefix = pincode.substring(0, 3);
  const numPrefix = parseInt(prefix);
  
  // Bangalore: 560xxx
  if (pincode.startsWith("560")) return "Bangalore";
  // Mumbai: 400xxx
  if (pincode.startsWith("400")) return "Mumbai";
  // Delhi: 110xxx
  if (pincode.startsWith("110")) return "Delhi";
  // Chennai: 600xxx
  if (pincode.startsWith("600")) return "Chennai";
  // Hyderabad: 500xxx
  if (pincode.startsWith("500")) return "Hyderabad";
  // Kolkata: 700xxx
  if (pincode.startsWith("700")) return "Kolkata";
  // Pune: 411xxx
  if (pincode.startsWith("411")) return "Pune";
  // Ahmedabad: 380xxx
  if (pincode.startsWith("380")) return "Ahmedabad";
  // Jaipur: 302xxx
  if (pincode.startsWith("302")) return "Jaipur";
  // Lucknow: 226xxx
  if (pincode.startsWith("226")) return "Lucknow";
  
  // Default to general India news
  return "";
}

interface NewsDataArticle {
  article_id: string;
  title: string;
  description: string | null;
  source_id: string;
  source_name: string;
  pubDate: string;
  link: string;
  image_url: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pincode } = await req.json();
    
    if (!pincode) {
      return new Response(
        JSON.stringify({ error: 'Pincode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const city = getCityFromPincode(pincode);
    const apiKey = "pub_3d6c5dc54ba34f14a874d0748f633813";
    
    // Build API URL with parameters
    let apiUrl = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=in&language=en,hi`;
    
    // Add location query if we have a city
    if (city) {
      apiUrl += `&q=${encodeURIComponent(city)}`;
    }
    
    // Add category filter for local/political news
    apiUrl += `&category=politics,crime`;

    console.log(`Fetching local news for pincode: ${pincode}, city: ${city || 'India'}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('NewsData API error:', response.status, response.statusText);
      throw new Error(`NewsData API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== "success" || !data.results) {
      console.error('NewsData API returned unexpected data:', data);
      return new Response(
        JSON.stringify({ news: [], city: city || "India" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform the response to match our NewsItem format
    const news = data.results.slice(0, 15).map((article: NewsDataArticle, index: number) => ({
      id: article.article_id || `local-${index}-${Date.now()}`,
      title: article.title,
      description: article.description || '',
      source: article.source_name || article.source_id || 'Local News',
      publishedAt: formatRelativeTime(article.pubDate),
      url: article.link,
      image: article.image_url,
    }));

    return new Response(
      JSON.stringify({ news, city: city || "India" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching local news:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch local news', news: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
  } catch {
    return dateString;
  }
}
