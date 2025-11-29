import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, AlertCircle, Calculator, ArrowRight, Droplets, Shield } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TrendIndicator } from "./TrendIndicator";
import { RankBadge } from "./RankBadge";
import { DailyUpdate } from "./DailyUpdate";
import { LeaderActivity } from "./LeaderActivity";

interface DailyUpdateItem {
  type: string;
  text: string;
  severity: 'positive' | 'warning' | 'alert' | 'info';
}

interface AreaReport {
  id: string;
  pincode: string;
  ward_rank?: number;
  total_wards?: number;
  rank_change?: number;
  roads_score: number;
  roads_trend?: 'up' | 'down' | 'stable';
  water_score: number;
  water_trend?: 'up' | 'down' | 'stable';
  safety_score: number;
  safety_trend?: 'up' | 'down' | 'stable';
  health_score: number;
  health_trend?: 'up' | 'down' | 'stable';
  overall_score: number;
  daily_updates?: DailyUpdateItem[];
  summary: string;
  key_issues: string[];
  recent_developments: string[];
}

interface LeaderActivityData {
  activity_type: string;
  activity_description: string;
  activity_date: string;
  is_positive: boolean;
}

interface Leader {
  id: string;
  name: string;
  designation: string;
  party?: string;
  image_url?: string;
}

export const HomeContent = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [leaderActivities, setLeaderActivities] = useState<Record<string, LeaderActivityData[]>>({});
  const [areaReport, setAreaReport] = useState<AreaReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchLeaders();
    fetchAreaReport();
  }, []);

  const fetchLeaders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("pincode")
        .eq("user_id", user.id)
        .single();

      const pincode = profile?.pincode || "560029";

      const { data } = await supabase.functions.invoke("fetch-leaders", {
        body: { pincode }
      });

      if (data?.leaders) {
        setLeaders(data.leaders);
        fetchActivities(pincode);
      }
    } catch (error) {
      console.error("Error fetching leaders:", error);
    }
  };

  const fetchActivities = async (pincode: string) => {
    try {
      setLoadingActivities(true);
      const { data, error } = await supabase.functions.invoke("populate-leader-activities", {
        body: { pincode }
      });

      if (error) {
        console.error("Error fetching activities:", error);
      } else if (data?.activities) {
        // Group activities by leader_id
        const groupedActivities: Record<string, LeaderActivityData[]> = {};
        data.activities.forEach((activity: any) => {
          const leaderId = activity.leaders?.id || activity.leader_id;
          if (!groupedActivities[leaderId]) {
            groupedActivities[leaderId] = [];
          }
          groupedActivities[leaderId].push(activity);
        });
        setLeaderActivities(groupedActivities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchAreaReport = async () => {
    try {
      setLoadingReport(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingReport(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("pincode")
        .eq("user_id", user.id)
        .single();

      const pincode = profile?.pincode;
      if (!pincode) {
        setLoadingReport(false);
        return;
      }

      setGeneratingReport(true);
      
      const { data, error } = await supabase.functions.invoke("generate-area-report", {
        body: { pincode }
      });

      if (error) {
        console.error("Error fetching area report:", error);
        toast.error("Failed to load area report");
      } else if (data) {
        setAreaReport(data);
      }
    } catch (error) {
      console.error("Error fetching area report:", error);
      toast.error("Failed to load area report");
    } finally {
      setLoadingReport(false);
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Your Ward Today */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📍 Your Ward Today</h2>
          {areaReport && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchAreaReport}
              disabled={loadingReport}
              className="text-muted-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${loadingReport ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>

        {loadingReport ? (
          <div className="space-y-4">
            {generatingReport && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                  <div>
                    <p className="text-sm font-medium">Generating your ward report...</p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                  </div>
                </div>
              </Card>
            )}
            <Card className="p-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-24 w-full" />
            </Card>
          </div>
        ) : areaReport ? (
          <>
            <Card className="p-6">
              {areaReport.ward_rank && areaReport.total_wards && (
                <RankBadge 
                  rank={areaReport.ward_rank} 
                  total={areaReport.total_wards}
                  change={areaReport.rank_change || 0}
                />
              )}

              {/* Trend Indicators */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <TrendIndicator trend={areaReport.water_trend || 'stable'} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Water</p>
                    <p className="text-lg font-bold">{areaReport.water_score}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 11l19-9-9 19-2-8-8-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <TrendIndicator trend={areaReport.roads_trend || 'stable'} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Roads</p>
                    <p className="text-lg font-bold">{areaReport.roads_score}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    <TrendIndicator trend={areaReport.safety_trend || 'stable'} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Safety</p>
                    <p className="text-lg font-bold">{areaReport.safety_score}</p>
                  </div>
                </div>
              </div>

              {/* Daily Updates */}
              {areaReport.daily_updates && areaReport.daily_updates.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-sm mb-3">TODAY'S UPDATES:</h3>
                  <div className="space-y-1">
                    {areaReport.daily_updates.map((update, idx) => (
                      <DailyUpdate 
                        key={idx}
                        type={update.type}
                        text={update.text}
                        severity={update.severity}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </>
        ) : (
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Unable to load ward report</p>
            <Button variant="outline" size="sm" onClick={fetchAreaReport}>
              Try Again
            </Button>
          </Card>
        )}
      </div>

      {/* Neta Activity Today */}
      <div>
        <h2 className="text-lg font-semibold mb-4">🏛️ Neta Activity Today</h2>
        {loadingActivities ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : leaders.length > 0 ? (
          <div className="space-y-3">
            {leaders.map((leader) => (
              <LeaderActivity
                key={leader.id}
                leader={leader}
                activities={leaderActivities[leader.id] || []}
                onClick={() => navigate(`/leader/${leader.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No leaders found</p>
          </Card>
        )}
      </div>

      {/* Policies for You */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Policies for You</h2>
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">
                Discover Your Benefits
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Find government policies and subsidies based on your profile
              </p>
              <Button
                onClick={() => navigate("/impact-calculator")}
                className="w-full gradient-primary"
                size="sm"
              >
                View All Benefits
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};