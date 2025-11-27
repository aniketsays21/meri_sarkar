import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, User } from "lucide-react";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const areaMetrics = [
  { 
    name: "Roads", 
    score: 72, 
    color: "bg-blue-500",
    details: {
      currentWork: "Resurfacing of MG Road, 2.5 km stretch",
      contractor: "ABC Construction Ltd",
      budget: "₹2.5 Crores",
      pastExperience: "Previous road work completed 2 months ahead of schedule with good quality materials",
      futureExpectations: "Expected completion by March 2025. New drainage system to be installed alongside"
    }
  },
  { 
    name: "Water", 
    score: 85, 
    color: "bg-cyan-500",
    details: {
      currentWork: "Installation of new water pipeline in Ward 12",
      contractor: "WaterTech Solutions",
      budget: "₹1.8 Crores",
      pastExperience: "Water supply improved by 40% after last project. Minimal leakage issues",
      futureExpectations: "24/7 water supply expected from April 2025 onwards"
    }
  },
  { 
    name: "Safety", 
    score: 68, 
    color: "bg-orange-500",
    details: {
      currentWork: "CCTV camera installation at 50 locations",
      contractor: "SecureCity Tech Pvt Ltd",
      budget: "₹85 Lakhs",
      pastExperience: "Crime rate reduced by 25% in areas with CCTV coverage",
      futureExpectations: "All cameras to be connected to central monitoring by February 2025"
    }
  },
  { 
    name: "Health", 
    score: 78, 
    color: "bg-green-500",
    details: {
      currentWork: "Expansion of Primary Health Center with 20 new beds",
      contractor: "MediCare Infrastructure",
      budget: "₹3.2 Crores",
      pastExperience: "Current PHC serves 500+ patients daily. Staff shortage is a concern",
      futureExpectations: "New facility to double capacity and add emergency services by May 2025"
    }
  },
];

export const HomeContent = () => {
  const navigate = useNavigate();
  const [selectedMetric, setSelectedMetric] = useState<typeof areaMetrics[0] | null>(null);

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

  return (
    <div className="space-y-6">
      {/* My Leader Report */}
      <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/leaders')}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Leader Report</h2>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-1">Ramesh Kumar</h3>
            <p className="text-sm text-muted-foreground">Ward Councillor</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="px-2 py-0.5 rounded-full bg-primary/10">
                <span className="text-xs font-medium text-primary">BJP</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* My Area Report */}
      <div>
        <h2 className="text-lg font-semibold mb-4">My Area Report</h2>
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
      </div>

      {/* Area Metrics Detail Dialog */}
      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent className="max-w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedMetric?.name} Status</DialogTitle>
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
                <div className="p-4 bg-primary/5 rounded-xl">
                  <h4 className="font-semibold text-sm mb-2 text-primary">Current Work</h4>
                  <p className="text-sm text-foreground">{selectedMetric.details.currentWork}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-card rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Contractor</p>
                    <p className="text-sm font-medium">{selectedMetric.details.contractor}</p>
                  </div>
                  <div className="p-3 bg-card rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1">Budget</p>
                    <p className="text-sm font-medium">{selectedMetric.details.budget}</p>
                  </div>
                </div>

                <div className="p-4 bg-accent/5 rounded-xl">
                  <h4 className="font-semibold text-sm mb-2">Past Experience</h4>
                  <p className="text-sm text-muted-foreground">{selectedMetric.details.pastExperience}</p>
                </div>

                <div className="p-4 bg-secondary/5 rounded-xl">
                  <h4 className="font-semibold text-sm mb-2">Future Expectations</h4>
                  <p className="text-sm text-muted-foreground">{selectedMetric.details.futureExpectations}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
