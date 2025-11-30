import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, ArrowRight, RefreshCw, AlertCircle, AlertTriangle } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AreaReportCard } from "./AreaReportCard";
import { AreaAlertsList } from "./AreaAlertsList";
import { CreateAlertDialog } from "./CreateAlertDialog";
import { DailyPollCard } from "./DailyPollCard";
import { LeaderVotingSection } from "./LeaderVotingSection";

interface AreaDetails {
  currentWork: string;
  contractor: string;
  budget: string;
  pastExperience: string;
  futureExpectations: string;
}

interface AreaMetric {
  name: string;
  score: number;
  color: string;
  details: AreaDetails;
}

interface AreaReport {
  id: string;
  pincode: string;
  roads_score: number;
  roads_details: AreaDetails;
  roads_trend?: string;
  water_score: number;
  water_details: AreaDetails;
  water_trend?: string;
  safety_score: number;
  safety_details: AreaDetails;
  safety_trend?: string;
  health_score: number;
  health_details: AreaDetails;
  health_trend?: string;
  overall_score: number;
  summary: string;
  key_issues: string[];
  recent_developments: string[];
  generated_at: string;
  expires_at: string;
  ward?: string;
  ward_rank?: number;
  total_wards?: number;
  rank_change?: number;
  constituency?: string;
  district?: string;
  state?: string;
}

export const HomeContent = () => {
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState<AreaMetric | null>(null);
  const [areaReport, setAreaReport] = useState<AreaReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [userPincode, setUserPincode] = useState<string>("");
  const [locationName, setLocationName] = useState<string>("");
  const [createAlertOpen, setCreateAlertOpen] = useState(false);

  useEffect(() => {
    fetchUserInfo();
    fetchAreaReport();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("pincode, constituency")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setUserPincode(profile.pincode || "");
        setLocationName(profile.constituency || "");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
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

  const getMetricColor = (name: string) => {
    switch (name) {
      case "Roads": return "bg-blue-500";
      case "Water": return "bg-cyan-500";
      case "Safety": return "bg-orange-500";
      case "Health": return "bg-green-500";
      default: return "bg-primary";
    }
  };

  const getAreaMetrics = (): AreaMetric[] => {
    if (!areaReport) return [];
    return [
      { 
        name: "Roads", 
        score: areaReport.roads_score || 0, 
        color: "bg-blue-500",
        details: areaReport.roads_details || {} as AreaDetails
      },
      { 
        name: "Water", 
        score: areaReport.water_score || 0, 
        color: "bg-cyan-500",
        details: areaReport.water_details || {} as AreaDetails
      },
      { 
        name: "Safety", 
        score: areaReport.safety_score || 0, 
        color: "bg-orange-500",
        details: areaReport.safety_details || {} as AreaDetails
      },
      { 
        name: "Health", 
        score: areaReport.health_score || 0, 
        color: "bg-green-500",
        details: areaReport.health_details || {} as AreaDetails
      },
    ];
  };

  const areaMetrics = getAreaMetrics();

  return (
    <div className="space-y-6">
      {/* Daily Polls */}
      <DailyPollCard />

      {/* Rate Your Leaders - New Voting Section */}
      <LeaderVotingSection />

      {/* My Area Report */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">My Area Report</h2>

        {loadingReport ? (
          <div className="space-y-4">
            {generatingReport && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                  <div>
                    <p className="text-sm font-medium">Generating your area report...</p>
                    <p className="text-xs text-muted-foreground">This may take a few seconds</p>
                  </div>
                </div>
              </Card>
            )}
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : areaReport ? (
          <AreaReportCard
            overallScore={areaReport.overall_score || 0}
            wardRank={areaReport.ward_rank || 0}
            totalWards={areaReport.total_wards || 81}
            rankChange={areaReport.rank_change || 0}
            metrics={areaMetrics.map((m) => ({
              name: m.name,
              score: m.score,
              trend: areaReport[`${m.name.toLowerCase()}_trend` as keyof AreaReport] as "up" | "down" | "stable" || "stable",
              details: m.details,
            }))}
            ward={areaReport.ward || ""}
            constituency={areaReport.constituency || ""}
          />
        ) : (
          <Card className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Unable to load area report</p>
            <Button variant="outline" size="sm" onClick={fetchAreaReport}>
              Try Again
            </Button>
          </Card>
        )}

        {/* Area Alerts Section */}
        {userPincode && <AreaAlertsList pincode={userPincode} />}

        {/* Key Issues & Recent Developments */}
        {areaReport && (
          <div className="grid gap-3">
            {areaReport.key_issues && areaReport.key_issues.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Key Issues
                </h3>
                <ul className="space-y-2">
                  {areaReport.key_issues.map((issue, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            {areaReport.recent_developments && areaReport.recent_developments.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  ✅ Recent Developments
                </h3>
                <ul className="space-y-2">
                  {areaReport.recent_developments.map((dev, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {dev}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Create Alert Dialog */}
      <CreateAlertDialog
        open={createAlertOpen}
        onOpenChange={setCreateAlertOpen}
        pincode={userPincode}
        locationName={locationName}
      />

      {/* Area Metrics Detail Dialog */}
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedMetric?.name} Status</DialogTitle>
          </DialogHeader>
          
          {selectedMetric && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className={`text-3xl font-bold ${getScoreTextColor(selectedMetric.score)}`}>
                  {selectedMetric.score}/100
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${selectedMetric.color}`} 
                      style={{ width: `${selectedMetric.score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedMetric.details?.currentWork && (
                  <div className="p-4 bg-primary/5 rounded-xl">
                    <h4 className="font-semibold text-sm mb-2 text-primary">Current Work</h4>
                    <p className="text-sm text-foreground">{selectedMetric.details.currentWork}</p>
                  </div>
                )}

                {(selectedMetric.details?.contractor || selectedMetric.details?.budget) && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMetric.details?.contractor && (
                      <div className="p-3 bg-card rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Contractor</p>
                        <p className="text-sm font-medium">{selectedMetric.details.contractor}</p>
                      </div>
                    )}
                    {selectedMetric.details?.budget && (
                      <div className="p-3 bg-card rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Budget</p>
                        <p className="text-sm font-medium">{selectedMetric.details.budget}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedMetric.details?.pastExperience && (
                  <div className="p-4 bg-accent/5 rounded-xl">
                    <h4 className="font-semibold text-sm mb-2">Past Experience</h4>
                    <p className="text-sm text-muted-foreground">{selectedMetric.details.pastExperience}</p>
                  </div>
                )}

                {selectedMetric.details?.futureExpectations && (
                  <div className="p-4 bg-secondary/5 rounded-xl">
                    <h4 className="font-semibold text-sm mb-2">Future Expectations</h4>
                    <p className="text-sm text-muted-foreground">{selectedMetric.details.futureExpectations}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Card 
            className="p-4 hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate("/impact-calculator")}
          >
            <div className="mb-3">
              <h4 className="font-semibold text-sm mb-1">PM Kisan</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  ✓ Eligible
                </span>
              </div>
              <p className="text-lg font-bold text-primary">₹6,000</p>
              <p className="text-xs text-muted-foreground">per year</p>
            </div>
          </Card>

          <Card 
            className="p-4 hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate("/impact-calculator")}
          >
            <div className="mb-3">
              <h4 className="font-semibold text-sm mb-1">Soil Health</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  ✓ Eligible
                </span>
              </div>
              <p className="text-sm font-semibold text-primary">Free</p>
              <p className="text-xs text-muted-foreground">scheme</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Alert Button */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-[430px]">
        <Button
          onClick={() => setCreateAlertOpen(true)}
          size="lg"
          className="w-full gap-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all text-base font-semibold py-6"
        >
          <AlertTriangle className="w-5 h-5" />
          Alert My Area
        </Button>
      </div>
    </div>
  );
};
