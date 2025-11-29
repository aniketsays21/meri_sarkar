import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import FloatingChatbot from "@/components/FloatingChatbot";
import { supabase } from "@/integrations/supabase/client";
import {
  Bell,
  Home,
  Users,
  MapPin,
  Users2,
  Newspaper,
  Calculator,
  Trophy,
} from "lucide-react";
import { HomeContent } from "@/components/HomeContent";
import { LeadersContent } from "@/components/LeadersContent";
import { ImpactContent } from "@/components/ImpactContent";
import { CommunityContent } from "@/components/CommunityContent";
import { NewsContent } from "@/components/NewsContent";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userPincode, setUserPincode] = useState("");
  const [userLocation, setUserLocation] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, pincode, constituency')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
            setUserName(profile.name);
            setUserPincode(profile.pincode || "");
            
            // Fetch location name from pincode_constituency table
            if (profile.pincode) {
              const { data: pincodeData } = await supabase
                .from('pincode_constituency')
                .select('assembly_constituency, district, state')
                .eq('pincode', profile.pincode)
                .single();
              
              if (pincodeData) {
                setUserLocation(pincodeData.assembly_constituency || pincodeData.district || pincodeData.state || "");
              } else {
                // If pincode not in our DB, use constituency from profile or pincode
                setUserLocation(profile.constituency || profile.pincode);
              }
            }
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
              <span>{userLocation || "Your Area"} - {userPincode}</span>
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
          {activeTab === "impact" && <ImpactContent />}
          {activeTab === "community" && <CommunityContent />}
          {activeTab === "news" && <NewsContent />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-around h-16 max-w-[430px] mx-auto">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "board", icon: Trophy, label: "Board", isLink: true, path: "/board" },
            { id: "leaders", icon: Users, label: "Leaders" },
            { id: "community", icon: Users2, label: "Community" },
            { id: "news", icon: Newspaper, label: "News" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.isLink && tab.path) {
                  navigate(tab.path);
                } else {
                  setActiveTab(tab.id);
                }
              }}
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
