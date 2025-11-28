import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  image?: string;
}

const RSS_FEEDS = [
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', source: 'Times of India' },
  { url: 'https://indianexpress.com/section/political-pulse/feed/', source: 'Indian Express' },
  { url: 'https://feeds.feedburner.com/ndtvnews-india-news', source: 'NDTV' },
];

function parseRSSItem(item: string, source: string): NewsItem | null {
  try {
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/s);
    const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s);
    const linkMatch = item.match(/<link>(.*?)<\/link>|<link><!\[CDATA\[(.*?)\]\]><\/link>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    const imageMatch = item.match(/<media:content[^>]*url="([^"]+)"|<enclosure[^>]*url="([^"]+)"|<image>[^<]*<url>(.*?)<\/url>/);
    
    const title = titleMatch ? (titleMatch[1] || titleMatch[2])?.trim() : null;
    const description = descMatch ? (descMatch[1] || descMatch[2])?.trim() : null;
    const link = linkMatch ? (linkMatch[1] || linkMatch[2])?.trim() : null;
    const pubDate = pubDateMatch ? pubDateMatch[1]?.trim() : null;
    const image = imageMatch ? (imageMatch[1] || imageMatch[2] || imageMatch[3])?.trim() : null;

    if (!title || !link) return null;

    // Clean HTML from description
    const cleanDescription = description 
      ? description.replace(/<[^>]*>/g, '').substring(0, 200) 
      : '';

    return {
      id: `${source}-${link}`,
      title,
      description: cleanDescription,
      source,
      publishedAt: pubDate || new Date().toISOString(),
      url: link,
      image: image || undefined,
    };
  } catch (e) {
    console.error('Error parsing RSS item:', e);
    return null;
  }
}

function parseRSSFeed(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  
  for (const itemXml of itemMatches.slice(0, 5)) { // Limit to 5 items per feed
    const item = parseRSSItem(itemXml, source);
    if (item) items.push(item);
  }
  
  return items;
}

function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recently';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const allNews: NewsItem[] = [];
    
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
          },
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch ${feed.source}: ${response.status}`);
          return [];
        }
        
        const xml = await response.text();
        return parseRSSFeed(xml, feed.source);
      } catch (e) {
        console.error(`Error fetching ${feed.source}:`, e);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    results.forEach(items => allNews.push(...items));

    // Sort by date, newest first
    allNews.sort((a, b) => {
      try {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      } catch {
        return 0;
      }
    });

    // Format relative times
    const formattedNews = allNews.slice(0, 20).map(item => ({
      ...item,
      publishedAt: getRelativeTime(item.publishedAt),
    }));

    return new Response(JSON.stringify({ news: formattedNews }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-news:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch news', news: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
