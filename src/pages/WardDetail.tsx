import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  total_alerts: number;
  total_responses: number;
  total_confirmations: number;
  week_number: number;
  year: number;
}

interface Alert {
  id: string;
  title: string;
  category: string;
  upvotes: number;
  created_at: string;
}

export default function WardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ward, setWard] = useState<WardScore | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalWards, setTotalWards] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchWardDetails();
      fetchWardAlerts();
    }
  }, [id]);

  const fetchWardDetails = async () => {
    const { data, error } = await supabase
      .from("ward_weekly_scores")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching ward:", error);
      setLoading(false);
      return;
    }

    setWard(data);

    // Get total wards count
    const { count } = await supabase
      .from("ward_weekly_scores")
      .select("*", { count: "exact", head: true })
      .eq("week_number", data.week_number)
      .eq("year", data.year);

    setTotalWards(count || 0);
    setLoading(false);
  };

  const fetchWardAlerts = async () => {
    const { data: wardData } = await supabase
      .from("ward_weekly_scores")
      .select("pincode")
      .eq("id", id)
      .single();

    if (!wardData) return;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: alertsData } = await supabase
      .from("area_alerts")
      .select("id, title, category, upvotes, created_at")
      .eq("pincode", wardData.pincode)
      .gte("created_at", weekAgo.toISOString())
      .order("upvotes", { ascending: false })
      .limit(10);

    setAlerts(alertsData || []);
  };

  const getRankIcon = (rankChange: number) => {
    if (rankChange > 0) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (rankChange < 0) return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      cleanliness: "🗑️",
      water: "💧",
      roads: "🚗",
      safety: "🛡️",
    };
    return icons[category] || "📊";
  };

  const handleShare = () => {
    if (!ward) return;
    const text = `${ward.ward} is ranked #${ward.rank} out of ${totalWards} areas this week with a score of ${ward.overall_score}/100!`;
    if (navigator.share) {
      navigator.share({ title: `${ward.ward} Performance`, text });
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ward details...</p>
        </div>
      </div>
    );
  }

  if (!ward) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Ward not found</p>
          <Button onClick={() => navigate("/board")} className="mt-4">
            Back to Board
          </Button>
        </div>
      </div>
    );
  }

  const categories = [
    { name: "Cleanliness", score: ward.cleanliness_score, key: "cleanliness" },
    { name: "Water", score: ward.water_score, key: "water" },
    { name: "Roads", score: ward.roads_score, key: "roads" },
    { name: "Safety", score: ward.safety_score, key: "safety" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate("/board")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-lg font-bold">{ward.ward}</h1>
              <p className="text-xs text-muted-foreground">Pincode: {ward.pincode}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <span className="text-4xl font-bold text-primary">{ward.overall_score}</span>
                  <span className="text-muted-foreground">/100</span>
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              
              <Progress value={ward.overall_score} className="h-3" />
              
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Rank #{ward.rank} / {totalWards}
                </Badge>
                <div className="flex items-center gap-1">
                  {getRankIcon(ward.rank_change)}
                  {ward.rank_change !== 0 && (
                    <span className={ward.rank_change > 0 ? "text-green-600" : "text-red-600"}>
                      {Math.abs(ward.rank_change)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      {getCategoryIcon(category.key)} {category.name}
                    </span>
                    <span className="text-sm font-bold text-primary">{category.score}</span>
                  </div>
                  <Progress value={category.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                This Week's Top Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate(`/dashboard?tab=alerts`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCategoryIcon(alert.category)}</span>
                      <span className="text-sm font-medium">{alert.title}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{alert.upvotes} affected</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-accent/10 to-transparent">
          <CardHeader>
            <CardTitle>Help Your Area Climb</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg">✅</span>
              <div>
                <p className="font-medium">Answer Today's Polls</p>
                <p className="text-sm text-muted-foreground">Your daily responses improve area data accuracy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">✅</span>
              <div>
                <p className="font-medium">Report Real Issues</p>
                <p className="text-sm text-muted-foreground">Alert authorities to problems in your area</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">✅</span>
              <div>
                <p className="font-medium">Share With Neighbors</p>
                <p className="text-sm text-muted-foreground">More participation = better representation</p>
              </div>
            </div>
            <div className="flex gap-2 pt-3">
              <Button className="flex-1" onClick={() => navigate("/dashboard")}>
                Answer Polls
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard?tab=alerts")}>
                Report Issue
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week's Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{ward.total_responses}</p>
              <p className="text-xs text-muted-foreground">Poll Responses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{ward.total_alerts}</p>
              <p className="text-xs text-muted-foreground">Alerts Raised</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{ward.total_confirmations}</p>
              <p className="text-xs text-muted-foreground">Confirmations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
