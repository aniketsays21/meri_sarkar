import { useState, useEffect } from "react";
import { Newspaper, ExternalLink, Clock, RefreshCw, AlertCircle, MapPin } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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

const NewsCard = ({ article }: { article: NewsItem }) => (
  <a
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
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
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

const EmptyState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="bg-gray-50 rounded-xl p-8 text-center">
    <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-3" />
    <p className="text-gray-600">No news available at the moment</p>
    <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
      Try Again
    </Button>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm text-red-700">{error}</p>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={onRetry}
      className="text-red-600 border-red-300 hover:bg-red-100"
    >
      Retry
    </Button>
  </div>
);

export const NewsContent = () => {
  const [activeTab, setActiveTab] = useState("current");
  
  // Current News State
  const [currentNews, setCurrentNews] = useState<NewsItem[]>([]);
  const [currentLoading, setCurrentLoading] = useState(true);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [currentRefreshing, setCurrentRefreshing] = useState(false);

  // Local News State
  const [localNews, setLocalNews] = useState<NewsItem[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [localCity, setLocalCity] = useState<string>("");
  const [localFetched, setLocalFetched] = useState(false);

  const fetchCurrentNews = async (isRefresh = false) => {
    if (isRefresh) setCurrentRefreshing(true);
    else setCurrentLoading(true);
    setCurrentError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-news');
      
      if (fnError) throw fnError;
      
      if (data?.news) {
        setCurrentNews(data.news);
      } else {
        setCurrentNews([]);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setCurrentError('Unable to load news. Please try again.');
    } finally {
      setCurrentLoading(false);
      setCurrentRefreshing(false);
    }
  };

  const fetchLocalNews = async (isRefresh = false) => {
    if (isRefresh) setLocalRefreshing(true);
    else setLocalLoading(true);
    setLocalError(null);

    try {
      // Get user's pincode from profile
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLocalError('Please sign in to see local news');
        setLocalLoading(false);
        setLocalRefreshing(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('pincode')
        .eq('user_id', user.id)
        .single();

      if (!profile?.pincode) {
        setLocalError('Please update your pincode in settings to see local news');
        setLocalLoading(false);
        setLocalRefreshing(false);
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('fetch-local-news', {
        body: { pincode: profile.pincode }
      });
      
      if (fnError) throw fnError;
      
      if (data?.news) {
        setLocalNews(data.news);
        setLocalCity(data.city || "Your Area");
      } else {
        setLocalNews([]);
      }
      setLocalFetched(true);
    } catch (err) {
      console.error('Error fetching local news:', err);
      setLocalError('Unable to load local news. Please try again.');
    } finally {
      setLocalLoading(false);
      setLocalRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCurrentNews();
  }, []);

  // Fetch local news when tab is switched to "local" for the first time
  useEffect(() => {
    if (activeTab === "local" && !localFetched && !localLoading) {
      fetchLocalNews();
    }
  }, [activeTab, localFetched, localLoading]);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger 
            value="current" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
          >
            <Newspaper className="w-4 h-4 mr-2" />
            Current News
          </TabsTrigger>
          <TabsTrigger 
            value="local" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
          >
            <MapPin className="w-4 h-4 mr-2" />
            My Area News
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-4 space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Political News</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchCurrentNews(true)}
                disabled={currentRefreshing}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-8"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${currentRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Live updates from top Indian news sources
            </p>
          </div>

          {currentLoading ? (
            <LoadingSkeleton />
          ) : currentError ? (
            <ErrorState error={currentError} onRetry={() => fetchCurrentNews()} />
          ) : currentNews.length === 0 ? (
            <EmptyState onRetry={() => fetchCurrentNews()} />
          ) : (
            <div className="space-y-4">
              {currentNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <div className="text-center text-xs text-gray-500 py-2">
            News sourced from The Hindu, Times of India, Indian Express & NDTV
          </div>
        </TabsContent>

        <TabsContent value="local" className="mt-4 space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">
                  {localCity ? `News from ${localCity}` : "My Area News"}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchLocalNews(true)}
                disabled={localRefreshing || localLoading}
                className="text-green-600 hover:text-green-700 hover:bg-green-100 h-8"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${localRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Local news based on your registered location
            </p>
          </div>

          {localLoading ? (
            <LoadingSkeleton />
          ) : localError ? (
            <ErrorState error={localError} onRetry={() => fetchLocalNews()} />
          ) : localNews.length === 0 && localFetched ? (
            <EmptyState onRetry={() => fetchLocalNews()} />
          ) : (
            <div className="space-y-4">
              {localNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <div className="text-center text-xs text-gray-500 py-2">
            Local news powered by NewsData.io
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
