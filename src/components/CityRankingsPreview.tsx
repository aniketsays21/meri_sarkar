import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Trophy, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WardScore {
  id: string;
  ward: string;
  pincode: string;
  city: string;
  overall_score: number;
  rank: number;
  rank_change: number;
  week_number: number;
  year: number;
}

export const CityRankingsPreview = () => {
  const navigate = useNavigate();
  const [topWards, setTopWards] = useState<WardScore[]>([]);
  const [userWard, setUserWard] = useState<WardScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopWards();
    fetchUserWard();
  }, []);

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const fetchTopWards = async () => {
    const currentWeek = getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from("ward_weekly_scores")
      .select("*")
      .eq("week_number", currentWeek)
      .eq("year", currentYear)
      .order("rank", { ascending: true })
      .limit(3);

    if (!error && data) {
      setTopWards(data);
    }
    setLoading(false);
  };

  const fetchUserWard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("pincode")
      .eq("user_id", user.id)
      .single();

    if (profile?.pincode) {
      const currentWeek = getWeekNumber(new Date());
      const currentYear = new Date().getFullYear();

      const { data: wardScore } = await supabase
        .from("ward_weekly_scores")
        .select("*")
        .eq("pincode", profile.pincode)
        .eq("week_number", currentWeek)
        .eq("year", currentYear)
        .single();

      if (wardScore) {
        setUserWard(wardScore);
      }
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getRankIcon = (rankChange: number) => {
    if (rankChange > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (rankChange < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  if (loading || topWards.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          City Rankings
        </h2>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/rankings")}
          className="text-primary"
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {userWard && (
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Your Area</p>
              <h4 className="font-semibold">{userWard.ward}</h4>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <span className="text-xl font-bold">#{userWard.rank}</span>
                {getRankIcon(userWard.rank_change)}
              </div>
              <p className="text-sm font-semibold text-primary">{userWard.overall_score}/100</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Top Performers</h3>
        <div className="space-y-3">
          {topWards.map((ward) => (
            <div
              key={ward.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getMedalEmoji(ward.rank)}</span>
                <div>
                  <h4 className="font-medium text-sm">{ward.ward}</h4>
                  <p className="text-xs text-muted-foreground">{ward.city}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-primary">{ward.overall_score}</span>
                  {getRankIcon(ward.rank_change)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button
        onClick={() => navigate("/rankings")}
        className="w-full"
        variant="outline"
      >
        View Full Rankings
      </Button>
    </div>
  );
};
