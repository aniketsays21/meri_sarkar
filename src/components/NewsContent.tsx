import { useState, useEffect } from "react";
import { Newspaper, ExternalLink, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  url: string;
  image?: string;
}

const sourceColors: Record<string, string> = {
  "The Hindu": "bg-blue-100 text-blue-700",
  "Times of India": "bg-red-100 text-red-700",
  "Indian Express": "bg-orange-100 text-orange-700",
  "NDTV": "bg-purple-100 text-purple-700",
};

export const NewsContent = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-news');
      
      if (fnError) throw fnError;
      
      if (data?.news) {
        setNews(data.news);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Unable to load news. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Political News</h2>
          </div>
          <p className="text-sm text-gray-600">Loading latest updates...</p>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Political News</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNews(true)}
            disabled={refreshing}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Live updates from top Indian news sources
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNews()}
            className="text-red-600 border-red-300 hover:bg-red-100"
          >
            Retry
          </Button>
        </div>
      )}

      {news.length === 0 && !error ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No news available at the moment</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNews()}
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all active:scale-[0.99]"
            >
              <div className="flex gap-4 p-4">
                {article.image ? (
                  <img
                    src={article.image}
                    alt=""
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 flex items-center justify-center">
                    <Newspaper className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm leading-snug">
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceColors[article.source] || 'bg-gray-100 text-gray-700'}`}>
                      {article.source}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{article.publishedAt}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="text-center text-xs text-gray-500 py-2">
        News sourced from The Hindu, Times of India, Indian Express & NDTV
      </div>
    </div>
  );
};
