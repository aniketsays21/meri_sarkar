import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import LeaderCard from "./LeaderCard";
import { Search, X, RefreshCw, Users } from "lucide-react";
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

const HIERARCHY_LABELS: Record<number, { en: string; hi: string; emoji: string }> = {
  6: { en: "Prime Minister", hi: "प्रधानमंत्री", emoji: "🇮🇳" },
  5: { en: "Governor", hi: "राज्यपाल", emoji: "🎩" },
  4: { en: "Chief Minister", hi: "मुख्यमंत्री", emoji: "👑" },
  3: { en: "Member of Parliament", hi: "सांसद", emoji: "🏛️" },
  2: { en: "MLA", hi: "विधायक", emoji: "🏢" },
  1: { en: "Ward Councillor", hi: "पार्षद", emoji: "🏘️" },
};

export const LeadersContent = () => {
  const navigate = useNavigate();
  const [localLeaders, setLocalLeaders] = useState<Leader[]>([]);
  const [searchResults, setSearchResults] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading your leaders...");
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [hasMoreToLoad, setHasMoreToLoad] = useState(false);
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
      setLoading(true);
      setLoadingMessage("Finding your area representatives...");
      
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
      setLoadingMessage("Fetching leader data from AI...");

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
      if (data?.has_more_to_load) {
        setHasMoreToLoad(true);
      }
    } catch (error) {
      console.error("Error fetching leaders:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreLeaders = async () => {
    setHasMoreToLoad(false);
    setLoadingMessage("Loading more leaders...");
    await fetchLocalLeaders();
  };

  const searchAllLeaders = async (query: string) => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("leaders")
        .select("id, name, designation, party, constituency, state, image_url, attendance, funds_utilized, questions_raised, hierarchy_level")
        .or(`name.ilike.%${query}%,designation.ilike.%${query}%,party.ilike.%${query}%,constituency.ilike.%${query}%,state.ilike.%${query}%`)
        .order("hierarchy_level", { ascending: false })
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

  const getHierarchyInfo = (level: number | null) => {
    return HIERARCHY_LABELS[level || 3] || { en: "Representative", hi: "प्रतिनिधि", emoji: "👤" };
  };

  const displayLeaders = isSearchMode ? searchResults : localLeaders;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">{loadingMessage}</p>
              <p className="text-xs text-muted-foreground mt-1">
                AI is finding and generating data for your area's political representatives
              </p>
            </div>
          </div>
        </div>
        
        {/* Skeleton Cards */}
        <div className="space-y-4">
          {[6, 5, 4, 3, 2, 1].map((level) => {
            const info = HIERARCHY_LABELS[level];
            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.emoji}</span>
                  <span className="text-xs font-medium text-muted-foreground">{info.en}</span>
                  <span className="text-xs text-muted-foreground/60">({info.hi})</span>
                </div>
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Hierarchy Info */}
      {!isSearchMode && (
        <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏛️</span>
            <div>
              <h3 className="font-semibold text-foreground">Your Political Hierarchy</h3>
              <p className="text-xs text-muted-foreground">
                Tap any leader to see their complete profile, projects & performance
              </p>
            </div>
          </div>
        </div>
      )}

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
        <div className="space-y-4">
          {displayLeaders.map((leader, index) => {
            const hierarchyInfo = getHierarchyInfo(leader.hierarchy_level);
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
                {/* Hierarchy Label with Hindi */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{hierarchyInfo.emoji}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {hierarchyInfo.en}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({hierarchyInfo.hi})
                    </span>
                  </div>
                  {isSearchMode && leader.state && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {leader.state}
                    </span>
                  )}
                </div>

                {/* Connecting Line */}
                {index > 0 && !isSearchMode && (
                  <div className="absolute left-[14px] -top-4 w-0.5 h-4 bg-gradient-to-b from-primary/40 to-primary/10" />
                )}

                <LeaderCard
                  leader={formattedLeader}
                  onClick={() => navigate(`/leader/${leader.id}`)}
                />

                {/* Arrow to next level */}
                {index < displayLeaders.length - 1 && !isSearchMode && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-primary/10 to-primary/40" />
                  </div>
                )}
              </div>
            );
          })}

          {/* You (Citizen) at the bottom */}
          {!isSearchMode && displayLeaders.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-lg">🏠</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">YOU</span>
                <span className="text-xs text-muted-foreground">(नागरिक)</span>
              </div>
              {locationInfo && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {locationInfo.ward || locationInfo.assembly_constituency}, {locationInfo.district}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Load More Button */}
      {hasMoreToLoad && !isSearchMode && (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={loadMoreLeaders}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Load more leaders
        </Button>
      )}

      {/* Location Info */}
      {!isSearchMode && locationInfo && localLeaders.length > 0 && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            📍 {locationInfo.parliamentary_constituency} Parliamentary • {locationInfo.assembly_constituency} Assembly • {locationInfo.state}
          </p>
        </div>
      )}
    </div>
  );
};
