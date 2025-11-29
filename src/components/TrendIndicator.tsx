import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  size?: number;
}

export const TrendIndicator = ({ trend, size = 20 }: TrendIndicatorProps) => {
  if (trend === 'up') {
    return <TrendingUp className="text-green-500" size={size} />;
  }
  if (trend === 'down') {
    return <TrendingDown className="text-red-500" size={size} />;
  }
  return <Minus className="text-yellow-500" size={size} />;
};