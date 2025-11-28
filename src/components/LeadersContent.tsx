import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import LeaderCard from "./LeaderCard";
import { Search, X } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Leader {
  id: string;
  name: string;
  designation: string;
  party: string | null;
  constituency: string | null;
  state: string | null;
  image_url: string | null;
  attendance: number | null;
  funds_utilized: number | null;
  questions_raised: number | null;
  hierarchy_level: number | null;
}

export const LeadersContent = () => {
  const navigate = useNavigate();
  const [localLeaders, setLocalLeaders] = useState<Leader[]>([]);
  const [searchResults, setSearchResults] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [locationInfo, setLocationInfo] = useState<{
    ward?: string;
    assembly_constituency?: string;
    parliamentary_constituency?: string;
    district?: string;
    state?: string;
  } | null>(null);

  useEffect(() => {
    fetchLocalLeaders();
  }, []);

  // Debounced search when query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearchMode(true);
      const timer = setTimeout(() => {
        searchAllLeaders(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchLocalLeaders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("pincode")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setLoading(false);
        return;
      }

      const pincode = profile?.pincode || "560029";

      const { data, error } = await supabase.functions.invoke("fetch-leaders", {
        body: { pincode }
      });

      if (error) throw error;

      if (data?.leaders) {
        setLocalLeaders(data.leaders as Leader[]);
      }
      if (data?.pincode_info) {
        setLocationInfo(data.pincode_info);
      }
    } catch (error) {
      console.error("Error fetching leaders:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchAllLeaders = async (query: string) => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      // Search across all leaders by name, designation, party, constituency, or state
      const { data, error } = await supabase
        .from("leaders")
        .select("id, name, designation, party, constituency, state, image_url, attendance, funds_utilized, questions_raised, hierarchy_level")
        .or(`name.ilike.%${query}%,designation.ilike.%${query}%,party.ilike.%${query}%,constituency.ilike.%${query}%,state.ilike.%${query}%`)
        .order("hierarchy_level", { ascending: true })
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching leaders:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setSearchResults([]);
  };

  const calculateScore = (leader: Leader) => {
    const attendance = leader.attendance || 0;
    const funds = leader.funds_utilized || 0;
    const questions = Math.min((leader.questions_raised || 0) / 10, 100);
    return Math.round((attendance + funds + questions) / 3);
  };

  const getHierarchyLabel = (level: number | null) => {
    const labels: Record<number, string> = {
      1: "National Level",
      2: "State Level", 
      3: "Parliamentary",
      4: "State Government",
      5: "Governor"
    };
    return labels[level || 3] || "Representative";
  };

  const displayLeaders = isSearchMode ? searchResults : localLeaders;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search all leaders by name, party, state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Mode Indicator */}
      {isSearchMode && (
        <div className="flex items-center justify-between bg-primary/5 rounded-lg px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {searching ? "Searching..." : `Found ${searchResults.length} leader${searchResults.length !== 1 ? 's' : ''}`}
          </span>
          <Button variant="ghost" size="sm" onClick={clearSearch}>
            Show my area leaders
          </Button>
        </div>
      )}

      {/* Leaders List */}
      {displayLeaders.length === 0 ? (
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <p className="text-muted-foreground">
            {isSearchMode 
              ? `No leaders found matching "${searchQuery}"`
              : "No leaders found for your area. Try searching for leaders above."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayLeaders.map((leader, index) => {
            const formattedLeader = {
              id: parseInt(leader.id) || 0,
              name: leader.name,
              position: leader.designation,
              party: leader.party || "Independent",
              constituency: leader.constituency || "Unknown",
              image: leader.image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
              score: calculateScore(leader),
              attendance: leader.attendance || 0,
              fundsUtilized: leader.funds_utilized || 0,
              questionsRaised: leader.questions_raised || 0,
            };

            return (
              <div key={leader.id} className="relative">
                {/* Hierarchy Label */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground">
                        {getHierarchyLabel(leader.hierarchy_level)}
                      </span>
                      {isSearchMode && leader.state && (
                        <span className="text-xs text-muted-foreground/70">
                          {leader.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Connecting Line */}
                {index > 0 && !isSearchMode && (
                  <div className="absolute left-4 -top-6 w-px h-6 bg-gradient-to-b from-primary/30 to-transparent" />
                )}

                <LeaderCard
                  leader={formattedLeader}
                  onClick={() => navigate(`/leader/${leader.id}`)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Location Info (only show when not searching) */}
      {!isSearchMode && locationInfo && localLeaders.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            📍 Showing leaders for {locationInfo.ward || locationInfo.assembly_constituency}, {locationInfo.parliamentary_constituency || locationInfo.district}
          </p>
        </div>
      )}
    </div>
  );
};
