import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import FloatingChatbot from "@/components/FloatingChatbot";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Home,
  BarChart3,
  MessageSquare,
  User,
  Users,
  MapPin,
} from "lucide-react";
import { HomeContent } from "@/components/HomeContent";
import { LeadersContent } from "@/components/LeadersContent";
import { CommunityContent } from "@/components/CommunityContent";
import { StatsContent } from "@/components/StatsContent";
import { ProfileContent } from "@/components/ProfileContent";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

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

      <div className="flex-1 overflow-y-auto">
        <div className="p-5">
          {activeTab === "home" && <HomeContent />}
          {activeTab === "leaders" && <LeadersContent />}
          {activeTab === "community" && <CommunityContent />}
          {activeTab === "stats" && <StatsContent />}
          {activeTab === "profile" && <ProfileContent />}
        </div>
      </div>

      {/* Floating AI Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default Dashboard;
