import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, User, Calculator, ArrowRight, RefreshCw, AlertTriangle, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AreaMetric {
  name: string;
  score: number;
  color: string;
  details: {
    currentWork: string;
    contractor: string;
    budget: string;
    pastExperience: string;
    futureExpectations: string;
  };
}

interface LocationData {
  state: string;
  district: string;
  assembly_constituency: string;
  parliamentary_constituency: string;
  ward: string;
}

interface AreaReport {
  roads_score: number;
  roads_details: any;
  water_score: number;
  water_details: any;
  safety_score: number;
  safety_details: any;
  health_score: number;
  health_details: any;
  overall_score: number;
  summary: string;
  key_issues: string[];
  recent_developments: string[];
}

interface HomeContentProps {
  onLocationUpdate?: (location: LocationData | null) => void;
}

export const HomeContent = ({ onLocationUpdate }: HomeContentProps) => {
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState<AreaMetric | null>(null);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [areaMetrics, setAreaMetrics] = useState<AreaMetric[]>([]);
  const [areaReport, setAreaReport] = useState<AreaReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingArea, setLoadingArea] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("pincode")
        .eq("user_id", user.id)
        .maybeSingle();

      const pincode = profile?.pincode || "560029";

      // Fetch leaders and area data in parallel
      await Promise.all([
        fetchLeaders(pincode),
        fetchAreaData(pincode)
      ]);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaders = async (pincode: string) => {
    try {
      const { data } = await supabase.functions.invoke("fetch-leaders", {
        body: { pincode }
      });

      if (data?.leaders) {
        setLeaders(data.leaders);
      }
    } catch (error) {
      console.error("Error fetching leaders:", error);
    }
  };

  const fetchAreaData = async (pincode: string) => {
    setLoadingArea(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-area-data", {
        body: { pincode }
      });

      if (error) throw error;

      if (data) {
        const { areaReport: report, location, fromCache: cached } = data;
        
        setFromCache(cached);
        setAreaReport(report);
        
        // Update parent with location data
        if (onLocationUpdate && location) {
          onLocationUpdate(location);
        }

        // Transform to metrics format
        if (report) {
          const metrics: AreaMetric[] = [
            {
              name: "Roads",
              score: report.roads_score || 65,
              color: getScoreColorClass(report.roads_score || 65),
              details: report.roads_details || {}
            },
            {
              name: "Water",
              score: report.water_score || 70,
              color: getScoreColorClass(report.water_score || 70),
              details: report.water_details || {}
            },
            {
              name: "Safety",
              score: report.safety_score || 60,
              color: getScoreColorClass(report.safety_score || 60),
              details: report.safety_details || {}
            },
            {
              name: "Health",
              score: report.health_score || 72,
              color: getScoreColorClass(report.health_score || 72),
              details: report.health_details || {}
            }
          ];
          setAreaMetrics(metrics);
        }
      }
    } catch (error) {
      console.error("Error fetching area data:", error);
      toast.error("Failed to load area report");
    } finally {
      setLoadingArea(false);
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const refreshAreaData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("pincode")
      .eq("user_id", user.id)
      .maybeSingle();

    const pincode = profile?.pincode || "560029";
    
    toast.info("Refreshing area data...");
    await fetchAreaData(pincode);
    toast.success("Area data updated!");
  };

  return (
    <div className="space-y-6">
      {/* My Leaders */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Leaders</h2>
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex-shrink-0 w-[280px] p-5">
                <div className="flex items-center gap-4 mb-3">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : leaders && leaders.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {leaders.map((leader: any) => (
              <Card
                key={leader.id}
                className="flex-shrink-0 w-[280px] p-5 hover:shadow-lg transition-all cursor-pointer snap-center"
                onClick={() => navigate(`/leader/${leader.id}`)}
              >
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={leader.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.name}`}
                    alt={leader.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate">{leader.name}</h3>
                    <Badge variant="outline" className="text-xs mb-1">{leader.designation}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {leader.party && (
                    <div className="px-2 py-0.5 rounded-full bg-primary/10">
                      <span className="text-xs font-medium text-primary">{leader.party}</span>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1">No leaders found</h3>
                <p className="text-sm text-muted-foreground">Check your pincode</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* My Area Report */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">My Area Report</h2>
            {fromCache && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Cached
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshAreaData}
            disabled={loadingArea}
          >
            <RefreshCw className={`w-4 h-4 ${loadingArea ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Area Summary */}
        {areaReport?.summary && (
          <Card className="p-4 mb-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <p className="text-sm text-muted-foreground">{areaReport.summary}</p>
            {areaReport.key_issues && areaReport.key_issues.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {areaReport.key_issues.slice(0, 3).map((issue, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-orange-500/10 text-orange-700 border-orange-200">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {issue}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        )}

        {loadingArea ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-16 mb-3" />
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-2 w-full" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {areaMetrics.map((metric) => (
              <Card 
                key={metric.name} 
                className="p-4 hover:shadow-lg transition-all cursor-pointer active:scale-95"
                onClick={() => setSelectedMetric(metric)}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">{metric.name}</p>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-2xl font-bold ${getScoreTextColor(metric.score)}`}>
                    {metric.score}
                  </span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${metric.color} transition-all duration-500`} 
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

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
                {selectedMetric.details.currentWork && (
                  <div className="p-4 bg-primary/5 rounded-xl">
                    <h4 className="font-semibold text-sm mb-2 text-primary">Current Work</h4>
                    <p className="text-sm text-foreground">{selectedMetric.details.currentWork}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {selectedMetric.details.contractor && (
                    <div className="p-3 bg-card rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Contractor</p>
                      <p className="text-sm font-medium">{selectedMetric.details.contractor}</p>
                    </div>
                  )}
                  {selectedMetric.details.budget && (
                    <div className="p-3 bg-card rounded-lg border">
                      <p className="text-xs text-muted-foreground mb-1">Budget</p>
                      <p className="text-sm font-medium">{selectedMetric.details.budget}</p>
                    </div>
                  )}
                </div>

                {selectedMetric.details.pastExperience && (
                  <div className="p-4 bg-accent/5 rounded-xl">
                    <h4 className="font-semibold text-sm mb-2">Past Experience</h4>
                    <p className="text-sm text-muted-foreground">{selectedMetric.details.pastExperience}</p>
                  </div>
                )}

                {selectedMetric.details.futureExpectations && (
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
    </div>
  );
};
