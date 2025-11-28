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

function extractText(xml: string, tag: string): string | null {
  // Try CDATA first
  const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  
  // Try regular tag
  const tagRegex = new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i');
  const tagMatch = xml.match(tagRegex);
  if (tagMatch) return tagMatch[1].trim();
  
  return null;
}

function extractLink(itemXml: string): string | null {
  // Method 1: Standard <link>URL</link>
  const linkMatch = itemXml.match(/<link>([^<]+)<\/link>/i);
  if (linkMatch && linkMatch[1].startsWith('http')) {
    return linkMatch[1].trim();
  }
  
  // Method 2: CDATA link
  const cdataLink = itemXml.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/i);
  if (cdataLink && cdataLink[1].startsWith('http')) {
    return cdataLink[1].trim();
  }
  
  // Method 3: <link> right after </title> (common in Atom feeds)
  const afterTitleLink = itemXml.match(/<\/title>\s*<link>(https?:\/\/[^\s<]+)/i);
  if (afterTitleLink) {
    return afterTitleLink[1].trim();
  }
  
  // Method 4: guid as link
  const guidMatch = itemXml.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/i);
  if (guidMatch) {
    return guidMatch[1].trim();
  }
  
  // Method 5: feedburner origLink
  const origLink = itemXml.match(/<feedburner:origLink>(https?:\/\/[^<]+)<\/feedburner:origLink>/i);
  if (origLink) {
    return origLink[1].trim();
  }

  // Method 6: Look for any http URL in the item
  const anyUrl = itemXml.match(/>(https?:\/\/[^\s<"]+)</);
  if (anyUrl) {
    return anyUrl[1].trim();
  }
  
  return null;
}

function extractImage(itemXml: string): string | null {
  // media:content
  const mediaContent = itemXml.match(/<media:content[^>]*url="([^"]+)"/i);
  if (mediaContent) return mediaContent[1];
  
  // media:thumbnail
  const mediaThumbnail = itemXml.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
  if (mediaThumbnail) return mediaThumbnail[1];
  
  // enclosure
  const enclosure = itemXml.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i);
  if (enclosure) return enclosure[1];
  
  // image in description
  const imgInDesc = itemXml.match(/<img[^>]*src="([^"]+)"/i);
  if (imgInDesc) return imgInDesc[1];
  
  return null;
}

function parseDate(dateString: string | null): Date | null {
  if (!dateString) return null;
  
  try {
    // Try standard parsing first
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try common RSS date formats
    // Format: "28 Nov 2025 10:30:00 +0530"
    const rfcMatch = dateString.match(/(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (rfcMatch) {
      const months: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      const [, day, month, year, hour, min, sec] = rfcMatch;
      const monthNum = months[month];
      if (monthNum !== undefined) {
        return new Date(parseInt(year), monthNum, parseInt(day), parseInt(hour), parseInt(min), parseInt(sec));
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

function getRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Recently';
  
  const date = parseDate(dateString);
  if (!date) return 'Recently';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Handle future dates or very old dates
  if (diffMs < 0 || diffMs > 30 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function parseRSSItem(itemXml: string, source: string): NewsItem | null {
  try {
    const title = extractText(itemXml, 'title');
    const link = extractLink(itemXml);
    const description = extractText(itemXml, 'description');
    const pubDate = extractText(itemXml, 'pubDate') || extractText(itemXml, 'dc:date');
    const image = extractImage(itemXml);

    if (!title) {
      console.log(`[${source}] Skipping item - no title`);
      return null;
    }
    
    if (!link) {
      console.log(`[${source}] Skipping item - no link found for: ${title.substring(0, 50)}`);
      return null;
    }

    // Clean HTML from description
    const cleanDescription = description 
      ? description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 200).trim()
      : '';

    const relativeTime = getRelativeTime(pubDate);

    console.log(`[${source}] Parsed: ${title.substring(0, 40)}... | URL: ${link.substring(0, 50)}... | Time: ${relativeTime}`);

    return {
      id: `${source}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
      description: cleanDescription.replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
      source,
      publishedAt: relativeTime,
      url: link,
      image: image || undefined,
    };
  } catch (e) {
    console.error(`[${source}] Error parsing RSS item:`, e);
    return null;
  }
}

function parseRSSFeed(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  
  console.log(`[${source}] Found ${itemMatches.length} items in feed`);
  
  for (const itemXml of itemMatches.slice(0, 5)) {
    const item = parseRSSItem(itemXml, source);
    if (item) items.push(item);
  }
  
  console.log(`[${source}] Successfully parsed ${items.length} items`);
  return items;
}

serve(async (req) => {
  console.log('=== fetch-news function called ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const allNews: NewsItem[] = [];
    
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        console.log(`Fetching ${feed.source}...`);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
          console.error(`[${feed.source}] HTTP ${response.status}`);
          return [];
        }
        
        const xml = await response.text();
        console.log(`[${feed.source}] Received ${xml.length} bytes`);
        
        return parseRSSFeed(xml, feed.source);
      } catch (e) {
        console.error(`[${feed.source}] Error:`, e);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    results.forEach(items => allNews.push(...items));

    console.log(`Total news items: ${allNews.length}`);

    // Shuffle to mix sources, then take top 20
    const shuffled = allNews.sort(() => Math.random() - 0.5).slice(0, 20);

    return new Response(JSON.stringify({ news: shuffled }), {
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
