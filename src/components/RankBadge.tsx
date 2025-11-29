import { TrendingDown, TrendingUp } from "lucide-react";

interface RankBadgeProps {
  rank: number;
  total: number;
  change: number;
}

export const RankBadge = ({ rank, total, change }: RankBadgeProps) => {
  const percentage = ((total - rank) / total) * 100;
  
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold">#{rank}</span>
          <span className="text-muted-foreground">/ {total}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      {change !== 0 && (
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
          change < 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
        }`}>
          {change < 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
          {Math.abs(change)}
        </div>
      )}
    </div>
  );
};