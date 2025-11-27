import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Vote,
  TrendingUp,
  Users,
  Award,
  ChevronRight,
  Bell,
  Search,
  Home,
  BarChart3,
  MessageSquare,
  User,
} from "lucide-react";
import LeaderCard from "@/components/LeaderCard";

const mockLeaders = [
  {
    id: 1,
    name: "Rajesh Kumar",
    position: "MP - Lok Sabha",
    party: "ABC Party",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    score: 8.5,
    attendance: 92,
    fundsUtilized: 78,
    questionsRaised: 145,
    constituency: "Mumbai North",
  },
  {
    id: 2,
    name: "Priya Sharma",
    position: "MLA - State Assembly",
    party: "XYZ Party",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    score: 7.2,
    attendance: 85,
    fundsUtilized: 65,
    questionsRaised: 89,
    constituency: "Andheri West",
  },
  {
    id: 3,
    name: "Amit Patel",
    position: "Corporator - Ward 23",
    party: "DEF Party",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    score: 6.8,
    attendance: 76,
    fundsUtilized: 58,
    questionsRaised: 34,
    constituency: "Andheri West Ward 23",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-score-excellent";
    if (score >= 6.5) return "text-score-good";
    if (score >= 5) return "text-score-average";
    if (score >= 3) return "text-score-poor";
    return "text-score-bad";
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-hero p-6 rounded-b-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white">
                Neta Watch
              </h1>
              <p className="text-white/80 text-sm">Mumbai North - 400053</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leaders, schemes, issues..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white shadow-card text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 shadow-card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-display font-bold text-accent">
                342
              </p>
              <p className="text-xs text-muted-foreground">Civic Points</p>
            </div>
          </Card>

          <Card className="p-4 shadow-card bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-2xl font-display font-bold text-secondary">
                #12
              </p>
              <p className="text-xs text-muted-foreground">Ward Rank</p>
            </div>
          </Card>

          <Card className="p-4 shadow-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-display font-bold text-primary">8</p>
              <p className="text-xs text-muted-foreground">Issues Raised</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Section Header */}
      <div className="px-6 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Your Leaders</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary"
          onClick={() => navigate("/compare")}
        >
          Compare All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Leader Cards */}
      <div className="px-6 space-y-4 mb-6">
        {mockLeaders.map((leader) => (
          <LeaderCard
            key={leader.id}
            leader={leader}
            onClick={() => navigate(`/leader/${leader.id}`)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-xl font-display font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 shadow-card hover:shadow-card-hover transition-smooth cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold">Find Benefits</p>
                <p className="text-xs text-muted-foreground">₹68K eligible</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-card hover:shadow-card-hover transition-smooth cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="font-display font-bold">Report Issue</p>
                <p className="text-xs text-muted-foreground">Get resolved</p>
              </div>
            </div>
          </Card>
        </div>
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
