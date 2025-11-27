import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import FloatingChatbot from "@/components/FloatingChatbot";
import { supabase } from "@/integrations/supabase/client";
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
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const areaMetrics = [
    { name: "Roads", score: 72, icon: Construction },
    { name: "Water", score: 85, icon: Droplet },
    { name: "Safety", score: 68, icon: Shield },
    { name: "Health", score: 78, icon: Heart },
  ];

  const policies = [
    { title: "PM Kisan Yojana", amount: "₹6,000/year", eligible: true },
    { title: "Ayushman Bharat", amount: "₹5L coverage", eligible: true },
    { title: "Ujjwala Yojana", amount: "Free LPG", eligible: false },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-[hsl(var(--score-excellent))]";
    if (score >= 70) return "bg-[hsl(var(--score-good))]";
    if (score >= 60) return "bg-[hsl(var(--score-average))]";
    if (score >= 50) return "bg-[hsl(var(--score-poor))]";
    return "bg-[hsl(var(--score-bad))]";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-[hsl(var(--score-excellent))]";
    if (score >= 70) return "text-[hsl(var(--score-good))]";
    if (score >= 60) return "text-[hsl(var(--score-average))]";
    if (score >= 50) return "text-[hsl(var(--score-poor))]";
    return "text-[hsl(var(--score-bad))]";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    if (score >= 50) return "Poor";
    return "Needs Attention";
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
            setUserName(profile.name);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="mobile-container min-h-screen bg-background pb-20">
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <div className="space-y-6 px-5">
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
          
          <div>
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Hi {userName || 'there'}! 👋
            </h1>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
              <MapPin className="w-4 h-4" />
              <span>Mumbai North - 400053</span>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-smooth hover:bg-muted/80">
            <Bell className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="space-y-8 py-2">
        {/* 1. My Leader Report - Overall Score */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-foreground">My Leader Report</h2>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="bg-background border border-border/50 p-6 rounded-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-[72px] h-[72px] rounded-full bg-background flex items-center justify-center flex-col border-2 border-primary/20">
                    <span className="text-3xl font-display font-bold text-primary">78</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg text-foreground">Rajesh Kumar</h3>
                <p className="text-sm text-muted-foreground">MP - Mumbai North</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                    Good Performance
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Activities</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Inaugurated new road</p>
                    <p className="text-xs text-muted-foreground">Ward 23 • 2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-2xl">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">12 questions in Parliament</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. My Area Report - Multiple Metrics */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-foreground">My Area Report</h2>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm font-bold text-accent">75</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Overall area score across key metrics</p>
          
          <div className="grid grid-cols-2 gap-4">
            {areaMetrics.map((metric) => (
              <div key={metric.name} className="p-5 rounded-3xl bg-background border border-border/50 transition-smooth">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getScoreColor(metric.score)}/10`}>
                    <metric.icon className={`w-5 h-5 ${getScoreTextColor(metric.score)}`} />
                  </div>
                  <span className="font-medium text-sm text-foreground">{metric.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-end gap-1">
                    <span className={`text-3xl font-display font-bold ${getScoreTextColor(metric.score)}`}>{metric.score}</span>
                    <span className="text-xs text-muted-foreground mb-1.5">/ 100</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{getScoreLabel(metric.score)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Your Policy Impact */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-foreground">Your Policy Impact</h2>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Based on your profile, you're eligible for these schemes
          </p>

          <div className="space-y-3">
            {policies.map((policy, index) => (
              <div
                key={index}
                className={`p-5 rounded-3xl transition-smooth border ${
                  policy.eligible
                    ? "bg-accent/5 border-accent/30"
                    : "bg-background border-border/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className={`w-5 h-5 ${policy.eligible ? "text-accent" : "text-muted-foreground"}`} />
                      <p className="font-display font-bold text-sm text-foreground">{policy.title}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{policy.amount}</p>
                  </div>
                  {policy.eligible ? (
                    <div className="px-3 py-1.5 bg-accent text-white text-xs font-medium rounded-full flex-shrink-0">
                      ✓ Eligible
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-medium rounded-full flex-shrink-0">
                      Not Eligible
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Track State Leader */}
        <div className="px-5 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-foreground">Track State Leader</h2>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">What your Chief Minister is doing</p>
          
          <div className="bg-background border border-border/50 p-6 rounded-3xl">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/50">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">Devendra Fadnavis</h3>
                <p className="text-sm text-muted-foreground">Chief Minister, Maharashtra</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Updates</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">₹500Cr infrastructure fund announced</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">New affordable housing scheme launched</p>
                    <p className="text-xs text-muted-foreground">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-around h-16 max-w-[430px] mx-auto">
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

      {/* Floating AI Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default Dashboard;
