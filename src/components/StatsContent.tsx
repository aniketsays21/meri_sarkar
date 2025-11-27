import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const areaMetrics = [
  { 
    name: "Roads", 
    score: 72, 
    trend: -5, 
    details: "23 km pothole-free, 12 km under repair",
    color: "bg-blue-500",
    textColor: "text-blue-600"
  },
  { 
    name: "Water Supply", 
    score: 85, 
    trend: 8, 
    details: "18 hours daily supply, 95% coverage",
    color: "bg-cyan-500",
    textColor: "text-cyan-600"
  },
  { 
    name: "Safety", 
    score: 68, 
    trend: 3, 
    details: "Crime rate down 12%, 8 CCTV zones",
    color: "bg-orange-500",
    textColor: "text-orange-600"
  },
  { 
    name: "Health", 
    score: 78, 
    trend: 5, 
    details: "2 PHCs operational, 24/7 ambulance",
    color: "bg-green-500",
    textColor: "text-green-600"
  },
  { 
    name: "Education", 
    score: 81, 
    trend: 2, 
    details: "12 govt schools, 89% attendance rate",
    color: "bg-purple-500",
    textColor: "text-purple-600"
  },
  { 
    name: "Cleanliness", 
    score: 76, 
    trend: -3, 
    details: "Daily garbage collection, 4 parks maintained",
    color: "bg-pink-500",
    textColor: "text-pink-600"
  },
];

export const StatsContent = () => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const overallScore = Math.round(
    areaMetrics.reduce((acc, m) => acc + m.score, 0) / areaMetrics.length
  );

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Area Performance</h2>
          <Activity className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </span>
          <span className="text-lg text-gray-500">/100</span>
        </div>
        <p className="text-sm text-gray-600">BTM Layout, Ward 143</p>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-4">
        {areaMetrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{metric.name}</h3>
                <p className="text-xs text-gray-500">{metric.details}</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}
                  </span>
                  <span className="text-sm text-gray-500">/100</span>
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{Math.abs(metric.trend)}% this month</span>
                </div>
              </div>
            </div>
            
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${metric.color} transition-all duration-500`}
                style={{ width: `${metric.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          📊 Data updated daily from official government sources
        </p>
      </div>
    </div>
  );
};
