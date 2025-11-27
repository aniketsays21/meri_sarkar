import { Newspaper, ExternalLink, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

// Placeholder news - Replace with actual API integration
const mockNews = [
  {
    id: 1,
    title: "New Infrastructure Bill Passed in Parliament",
    description: "₹2 Lakh Crore allocated for road development across India",
    source: "The Hindu",
    publishedAt: "2 hours ago",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400",
    url: "#",
  },
  {
    id: 2,
    title: "Karnataka CM Announces Free Bus Travel for Women",
    description: "Shakti scheme to benefit over 2 crore women across the state",
    source: "Times of India",
    publishedAt: "5 hours ago",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
    url: "#",
  },
  {
    id: 3,
    title: "New Education Policy Implementation Begins",
    description: "Major reforms in school curriculum and examination system",
    source: "Indian Express",
    publishedAt: "1 day ago",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400",
    url: "#",
  },
  {
    id: 4,
    title: "Healthcare Budget Increased by 15%",
    description: "Focus on rural health centers and medical equipment",
    source: "NDTV",
    publishedAt: "2 days ago",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
    url: "#",
  },
];

export const NewsContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Political News</h2>
        </div>
        <p className="text-sm text-gray-600">
          Latest updates on policies and governance
        </p>
      </div>

      <div className="space-y-4">
        {mockNews.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex gap-4 p-4">
              <img
                src={article.image}
                alt={article.title}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="font-medium">{article.source}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.publishedAt}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100 text-center">
        <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          📰 News API integration needed
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Currently showing placeholder news
        </p>
      </div>
    </div>
  );
};
