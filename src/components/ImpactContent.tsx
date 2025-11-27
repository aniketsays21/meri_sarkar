import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Calculator,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const ImpactContent = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 border border-primary/20">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <Calculator className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">
              Policies for You
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Discover government policies and subsidies based on your profile
            </p>
            <Button
              onClick={() => navigate("/impact-calculator")}
              className="w-full gradient-primary"
            >
              View All Benefits
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Preview of Top Policies */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Top Benefits for You</h3>
        
        <Card 
          className="p-4 hover:shadow-md transition-all cursor-pointer"
          onClick={() => navigate("/impact-calculator")}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">PM Kisan Samman Nidhi</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  For Farmers
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  ✓ Eligible
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">₹6,000</p>
              <p className="text-xs text-muted-foreground">per year</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Direct income support for small and marginal farmers
          </p>
        </Card>

        <Card 
          className="p-4 hover:shadow-md transition-all cursor-pointer"
          onClick={() => navigate("/impact-calculator")}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">Soil Health Card Scheme</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  For Farmers
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  ✓ Eligible
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-primary">Free</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Get soil health report to improve crop productivity
          </p>
        </Card>
      </div>

      <Card className="p-4 bg-accent/5 border-accent/20">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-1">
              Why Check Policies?
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Discover benefits you're missing out on</li>
              <li>• See exact eligibility criteria</li>
              <li>• Get direct application links</li>
              <li>• Maximize your government benefits</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
