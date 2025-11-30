import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, AlertTriangle, BarChart3, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDetailDialog } from "@/components/AlertDetailDialog";

interface Alert {
  id: string;
  category: string;
  title: string;
  description: string;
  location_name: string | null;
  upvotes: number;
  created_at: string;
  user_id: string;
  image_url: string | null;
}

interface PollStats {
  category: string;
  yesCount: number;
  noCount: number;
  totalCount: number;
  percentageUnhappy: number;
}

export default function MohallaPerformanceBoard() {
  const navigate = useNavigate();
  const [userPincode, setUserPincode] = useState<string>("");
  const [userWard, setUserWard] = useState<string>("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pollStats, setPollStats] = useState<PollStats[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userPincode) {
      fetchAlerts();
      fetchPollStats();
    }
  }, [userPincode]);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("pincode")
      .eq("user_id", user.id)
      .single();

    if (profile?.pincode) {
      setUserPincode(profile.pincode);
      
      const { data: location } = await supabase
        .from("pincode_constituency")
        .select("ward")
        .eq("pincode", profile.pincode)
        .single();

      if (location?.ward) {
        setUserWard(location.ward);
      }
    }
    setLoading(false);
  };

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("area_alerts")
      .select("*")
      .eq("pincode", userPincode)
      .eq("status", "active")
      .order("upvotes", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching alerts:", error);
      return;
    }

    setAlerts(data || []);
  };

  const fetchPollStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data: polls } = await supabase
      .from("daily_polls")
      .select("id, category, question")
      .eq("is_active", true);

    if (!polls) return;

    const stats: PollStats[] = await Promise.all(
      polls.map(async (poll) => {
        const { data: responses } = await supabase
          .from("poll_responses")
          .select("response")
          .eq("poll_id", poll.id)
          .eq("pincode", userPincode)
          .gte("created_at", today);

        const yesCount = responses?.filter(r => r.response === true).length || 0;
        const noCount = responses?.filter(r => r.response === false).length || 0;
        const totalCount = yesCount + noCount;
        const percentageUnhappy = totalCount > 0 ? Math.round((noCount / totalCount) * 100) : 0;

        return {
          category: poll.category,
          yesCount,
          noCount,
          totalCount,
          percentageUnhappy,
        };
      })
    );

    setPollStats(stats);
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      cleanliness: "Garbage",
      water: "Water",
      roads: "Roads",
      safety: "Safety",
    };
    return labels[category] || category;
  };

  const getStatusIndicator = (percentage: number) => {
    if (percentage > 50) return { icon: "❌", color: "text-red-600" };
    if (percentage > 30) return { icon: "⚠️", color: "text-yellow-600" };
    return { icon: "✅", color: "text-green-600" };
  };

  const generateHighlights = () => {
    const highlights: string[] = [];

    // Generate from alerts
    const waterAlerts = alerts.filter(a => a.category === "water").length;
    const cleanlinessAlerts = alerts.filter(a => a.category === "cleanliness").length;
    const roadAlerts = alerts.filter(a => a.category === "roads").length;

    if (waterAlerts > 0) {
      highlights.push(`🚰 Water supply issues in ${waterAlerts} locations`);
    }
    if (cleanlinessAlerts > 0) {
      highlights.push(`🗑 ${cleanlinessAlerts} garbage collection complaints`);
    }
    if (roadAlerts > 0) {
      highlights.push(`🚧 ${roadAlerts} road condition alerts reported`);
    }

    // Generate from poll stats
    pollStats.forEach(stat => {
      if (stat.percentageUnhappy > 50 && stat.totalCount > 5) {
        highlights.push(`${getCategoryIcon(stat.category)} ${stat.percentageUnhappy}% report ${stat.category} issues`);
      }
    });

    return highlights.length > 0 ? highlights : ["✨ No major issues reported today"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  const highlights = generateHighlights();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold">📍 {userWard || "Your Area"} — TODAY</h1>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { 
                  month: "long", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </p>
            </div>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Top Highlights */}
        <Card className="border-primary/20 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              🔥 TOP HIGHLIGHTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-foreground">•</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Active Area Alerts */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              🚨 ACTIVE AREA ALERTS
            </CardTitle>
            <p className="text-sm text-muted-foreground">Updates from nearby areas</p>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active alerts in your area
              </p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getCategoryIcon(alert.category)}</span>
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                        </div>
                        {alert.location_name && (
                          <p className="text-xs text-muted-foreground mb-1">
                            📍 {alert.location_name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          👥 {alert.upvotes} affected
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        VIEW
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Pulse */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              📊 TODAY'S PULSE
            </CardTitle>
            <p className="text-sm text-muted-foreground">Real-time feedback from your area</p>
          </CardHeader>
          <CardContent>
            {pollStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No poll responses yet today
              </p>
            ) : (
              <div className="space-y-4">
                {pollStats.map((stat) => {
                  const status = getStatusIndicator(stat.percentageUnhappy);
                  return (
                    <div key={stat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getCategoryIcon(stat.category)}</span>
                          <span className="font-medium capitalize">{getCategoryLabel(stat.category)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg ${status.color}`}>{status.icon}</span>
                          <span className="text-sm font-semibold">
                            {stat.percentageUnhappy}% unhappy
                          </span>
                        </div>
                      </div>
                      <Progress value={stat.percentageUnhappy} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {stat.totalCount} responses
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View City Rankings Button */}
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => navigate("/rankings")}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View City Rankings
        </Button>
      </div>

      {selectedAlert && (
        <AlertDetailDialog
          alert={selectedAlert}
          open={!!selectedAlert}
          onOpenChange={(open) => !open && setSelectedAlert(null)}
          onAlertUpdated={fetchAlerts}
        />
      )}
    </div>
  );
}
