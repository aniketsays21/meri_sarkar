import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Trophy, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareableAreaCard } from "@/components/ShareableAreaCard";

interface WardScore {
  id: string;
  ward: string;
  pincode: string;
  city: string;
  state: string;
  overall_score: number;
  rank: number;
  prev_rank: number;
  rank_change: number;
  cleanliness_score: number;
  water_score: number;
  roads_score: number;
  safety_score: number;
  week_number: number;
  year: number;
}

export default function MohallaPerformanceBoard() {
  const navigate = useNavigate();
  const [scores, setScores] = useState<WardScore[]>([]);
  const [userWard, setUserWard] = useState<WardScore | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScores();
    fetchUserWard();
  }, []);

  const fetchScores = async () => {
    const currentWeek = getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from("ward_weekly_scores")
      .select("*")
      .eq("week_number", currentWeek)
      .eq("year", currentYear)
      .order("rank", { ascending: true })
      .limit(100);

    if (error) {
      console.error("Error fetching scores:", error);
      setLoading(false);
      return;
    }

    setScores(data || []);
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

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getRankIcon = (rankChange: number) => {
    if (rankChange > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rankChange < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getCategoryChampions = (category: 'cleanliness' | 'water' | 'roads' | 'safety') => {
    const field = `${category}_score`;
    return [...scores]
      .sort((a, b) => (b[field] || 0) - (a[field] || 0))
      .slice(0, 3);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      cleanliness: "🗑️",
      water: "💧",
      roads: "🚗",
      safety: "🛡️",
    };
    return icons[category];
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading performance board...</p>
        </div>
      </div>
    );
  }

  const topPerformers = scores.slice(0, 3);
  const bottomPerformers = scores.slice(-3).reverse();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-lg font-bold flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Area Performance Board
              </h1>
              <p className="text-xs text-muted-foreground">Week {getWeekNumber(new Date())}, {new Date().getFullYear()}</p>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {userWard && (
          <Card className="border-primary bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-base">Your Area</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{userWard.ward}</h3>
                  <p className="text-sm text-muted-foreground">Pincode: {userWard.pincode}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-2xl font-bold">#{userWard.rank}</span>
                    {getRankIcon(userWard.rank_change)}
                    {userWard.rank_change !== 0 && (
                      <span className="text-sm">{Math.abs(userWard.rank_change)}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">of {scores.length} areas</p>
                  <p className="text-lg font-semibold text-primary">{userWard.overall_score}/100</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1" 
                  onClick={() => navigate(`/ward/${userWard.id}`)}
                >
                  View Details
                </Button>
                <ShareableAreaCard
                  ward={userWard.ward}
                  city={userWard.city}
                  rank={userWard.rank}
                  totalAreas={scores.length}
                  overallScore={userWard.overall_score}
                  rankChange={userWard.rank_change}
                  cleanliness={userWard.cleanliness_score}
                  water={userWard.water_score}
                  roads={userWard.roads_score}
                  safety={userWard.safety_score}
                  pincode={userWard.pincode}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((ward) => (
              <div
                key={ward.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => navigate(`/ward/${ward.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMedalEmoji(ward.rank)}</span>
                  <div>
                    <h4 className="font-semibold">{ward.ward}</h4>
                    <p className="text-xs text-muted-foreground">{ward.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{ward.overall_score}</span>
                    {getRankIcon(ward.rank_change)}
                    {ward.rank_change > 0 && (
                      <span className="text-xs text-green-600">+{ward.rank_change}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Category Champions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['cleanliness', 'water', 'roads', 'safety'] as const).map((category) => (
              <div key={category}>
                <h4 className="font-semibold mb-2 flex items-center gap-2 capitalize">
                  <span>{getCategoryIcon(category)}</span>
                  {category}
                </h4>
                <div className="space-y-2">
                  {getCategoryChampions(category).map((ward, idx) => (
                    <div
                      key={ward.id}
                      className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/ward/${ward.id}`)}
                    >
                      <span className="text-muted-foreground">
                        {idx + 1}. {ward.ward}
                      </span>
                      <Badge variant="secondary">{ward[`${category}_score`]}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {bottomPerformers.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Needs Improvement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bottomPerformers.map((ward) => (
                <div
                  key={ward.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 hover:bg-destructive/10 cursor-pointer transition-colors"
                  onClick={() => navigate(`/ward/${ward.id}`)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{ward.rank}</span>
                      <span className="font-medium">{ward.ward}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ward.city}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-destructive">{ward.overall_score}</span>
                    {ward.rank_change < 0 && (
                      <span className="text-xs text-destructive">
                        {ward.rank_change}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
