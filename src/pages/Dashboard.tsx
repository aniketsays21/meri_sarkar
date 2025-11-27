import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Vote,
  ChevronRight,
  Bell,
  Home,
  BarChart3,
  MessageSquare,
  User,
  Users,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  TrendingUp,
  Shield,
  Droplet,
  Construction,
  Heart,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  const areaMetrics = [
    { name: "Roads", score: 72, icon: Construction, color: "text-orange-500" },
    { name: "Water", score: 85, icon: Droplet, color: "text-blue-500" },
    { name: "Safety", score: 68, icon: Shield, color: "text-red-500" },
    { name: "Health", score: 78, icon: Heart, color: "text-pink-500" },
  ];

  const policies = [
    { title: "PM Kisan Yojana", amount: "₹6,000/year", eligible: true },
    { title: "Ayushman Bharat", amount: "₹5L coverage", eligible: true },
    { title: "Ujjwala Yojana", amount: "Free LPG", eligible: false },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Simple Header */}
      <div className="bg-primary p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-primary-foreground">
              Meri Sarkar
            </h1>
            <div className="flex items-center gap-1 text-primary-foreground/80 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              <span>Mumbai North - 400053</span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* 1. My Leader Tracker */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold">My Leader Tracker</h2>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">7.8</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold">Rajesh Kumar</h3>
                <p className="text-sm text-muted-foreground">MP - Mumbai North</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">ABC Party</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recent Work</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>Inaugurated new road in Ward 23</p>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>Raised 12 questions in Parliament</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. My Area Report */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold">My Area Report</h2>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold">75%</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {areaMetrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <metric.icon className={`w-5 h-5 ${metric.color}`} />
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    <span className="text-sm font-bold">{metric.score}%</span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Policy Impact */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold">Your Policy Impact</h2>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Government schemes you're eligible for
            </p>

            <div className="space-y-3">
              {policies.map((policy, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    policy.eligible
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                      : "bg-muted border-border"
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{policy.title}</p>
                    <p className="text-xs text-muted-foreground">{policy.amount}</p>
                  </div>
                  {policy.eligible && (
                    <div className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                      Eligible
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Track My Leader (State) */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold">Track State Leader</h2>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold">Devendra Fadnavis</h3>
                <p className="text-sm text-muted-foreground">Chief Minister - Maharashtra</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full bg-green-500`} />
                <p>Announced ₹500Cr infrastructure fund</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full bg-blue-500`} />
                <p>Launched new housing scheme</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Last updated: 2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="mobile-container flex items-center justify-around h-16">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "leaders", icon: Users, label: "Leaders" },
            { id: "community", icon: MessageSquare, label: "Community" },
            { id: "stats", icon: BarChart3, label: "Stats" },
            { id: "profile", icon: User, label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-smooth ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
