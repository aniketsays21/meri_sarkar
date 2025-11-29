import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Car, Droplet, Shield, Heart } from "lucide-react";

interface AreaMetric {
  name: string;
  score: number;
  trend: "up" | "down" | "stable";
  details: any;
}

interface AreaReportCardProps {
  overallScore: number;
  wardRank: number;
  totalWards: number;
  rankChange: number;
  metrics: AreaMetric[];
  ward: string;
  constituency: string;
}

const getCategoryIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case "roads":
      return Car;
    case "water":
      return Droplet;
    case "safety":
      return Shield;
    case "health":
      return Heart;
    default:
      return Minus;
  }
};

const getCategoryColor = (name: string) => {
  switch (name.toLowerCase()) {
    case "roads":
      return "text-slate-600 dark:text-slate-400";
    case "water":
      return "text-blue-600 dark:text-blue-400";
    case "safety":
      return "text-orange-600 dark:text-orange-400";
    case "health":
      return "text-green-600 dark:text-green-400";
    default:
      return "text-foreground";
  }
};

const getTrendIcon = (trend: string) => {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-green-600" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-red-600" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export const AreaReportCard = ({
  overallScore,
  wardRank,
  totalWards,
  rankChange,
  metrics,
  ward,
  constituency,
}: AreaReportCardProps) => {
  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">My Area Report</CardTitle>
        <p className="text-sm text-muted-foreground">
          {ward}, {constituency}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score Section */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-primary">{overallScore}</div>
              <div className="text-sm text-muted-foreground">/100</div>
            </div>
            <Progress value={overallScore} className="w-32 h-2" />
          </div>
          <div className="text-right space-y-1">
            <div className="text-sm font-medium">
              Ward Rank: <span className="text-primary">#{wardRank}</span> of {totalWards}
            </div>
            {rankChange !== 0 && (
              <div className="text-xs flex items-center gap-1 justify-end">
                {rankChange > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={rankChange > 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(rankChange)} places this week
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Category Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => {
              const Icon = getCategoryIcon(metric.name);
              const colorClass = getCategoryColor(metric.name);
              
              return (
                <div
                  key={metric.name}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-semibold">{metric.score}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  <Progress value={metric.score} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
