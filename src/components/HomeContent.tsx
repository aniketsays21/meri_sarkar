import { TrendingUp, AlertCircle, CheckCircle, Activity } from "lucide-react";

const areaMetrics = [
  { name: "Roads", score: 72, color: "bg-blue-500" },
  { name: "Water", score: 85, color: "bg-cyan-500" },
  { name: "Safety", score: 68, color: "bg-orange-500" },
  { name: "Health", score: 78, color: "bg-green-500" },
];

const policies = [
  { name: "PM Kisan Yojana", eligible: true, amount: "₹6,000/year" },
  { name: "Ayushman Bharat", eligible: true, coverage: "₹5 Lakh" },
  { name: "Pradhan Mantri Awas Yojana", eligible: false, reason: "Income exceeds limit" },
];

export const HomeContent = () => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "Good";
    if (score >= 50) return "Average";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      {/* My Leader Report */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Leader Report</h2>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getScoreColor(78)}`}>
            <span className="text-white text-sm font-semibold">{getScoreLabel(78)}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">Approved ₹2.5 Cr for road development in Ward 143</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">Inaugurated new primary health center</p>
          </div>
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">Attended 12 out of 15 sessions this month</p>
          </div>
        </div>
      </div>

      {/* My Area Report */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Area Report</h2>
        <div className="grid grid-cols-2 gap-4">
          {areaMetrics.map((metric) => (
            <div key={metric.name} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">{metric.name}</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${getScoreTextColor(metric.score)}`}>
                  {metric.score}
                </span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${metric.color}`} 
                  style={{ width: `${metric.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Policy Impact */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Policy Impact</h2>
        <div className="space-y-3">
          {policies.map((policy) => (
            <div key={policy.name} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              {policy.eligible ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{policy.name}</p>
                {policy.eligible ? (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Eligible • {policy.amount || policy.coverage}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">{policy.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Track State Leader */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Track State Leader</h2>
        </div>
        <p className="text-sm text-gray-700 mb-3">Chief Minister - Siddaramaiah</p>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-xs text-purple-600 font-medium">Today:</span>
            <p className="text-sm text-gray-700">Launched "Shakti" scheme - Free bus travel for women</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-purple-600 font-medium">Yesterday:</span>
            <p className="text-sm text-gray-700">Reviewed implementation of "Gruha Lakshmi" scheme</p>
          </div>
        </div>
      </div>
    </div>
  );
};
