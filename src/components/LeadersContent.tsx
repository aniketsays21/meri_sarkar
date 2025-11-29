import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import LeaderCard from "./LeaderCard";
import { Search, X, RefreshCw, ChevronDown } from "lucide-react";
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

const HIERARCHY_LABELS: Record<number, { en: string; hi: string }> = {
  6: { en: "Prime Minister", hi: "प्रधानमंत्री" },
  5: { en: "Governor", hi: "राज्यपाल" },
  4: { en: "Chief Minister", hi: "मुख्यमंत्री" },
  3: { en: "Member of Parliament", hi: "सांसद" },
  2: { en: "MLA", hi: "विधायक" },
  1: { en: "Ward Councillor", hi: "पार्षद" },
};

export const LeadersContent = () => {
  const navigate = useNavigate();
  const [localLeaders, setLocalLeaders] = useState<Leader[]>([]);
  const [searchResults, setSearchResults] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
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
    return HIERARCHY_LABELS[level || 3] || { en: "Representative", hi: "प्रतिनिधि" };
  };

  const displayLeaders = isSearchMode ? searchResults : localLeaders;

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-3 w-64" />
        </div>
        
        {/* Search Skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />
        
        {/* Leader Cards Skeleton */}
        <div className="space-y-4">
          {[6, 5, 4, 3, 2, 1].map((level) => (
            <div key={level} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {!isSearchMode && (
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold text-foreground mb-1">Your Political Hierarchy</h3>
          <p className="text-xs text-muted-foreground">
            Tap any leader to see their complete profile, projects & performance
          </p>
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
          className="pl-10 pr-10 h-10 bg-card"
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
        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
          <span className="text-sm text-muted-foreground">
            {searching ? "Searching..." : `Found ${searchResults.length} leader${searchResults.length !== 1 ? 's' : ''}`}
          </span>
          <Button variant="ghost" size="sm" onClick={clearSearch} className="text-xs h-7">
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
                {/* Hierarchy Label */}
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-xs font-semibold text-foreground">
                    {hierarchyInfo.en}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({hierarchyInfo.hi})
                  </span>
                  {isSearchMode && leader.state && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {leader.state}
                    </span>
                  )}
                </div>

                {/* Connecting Line */}
                {index > 0 && !isSearchMode && (
                  <div className="absolute left-4 -top-4 w-0.5 h-4 bg-border" />
                )}

                <LeaderCard
                  leader={formattedLeader}
                  onClick={() => navigate(`/leader/${leader.id}`)}
                />

                {/* Arrow to next level */}
                {index < displayLeaders.length - 1 && !isSearchMode && (
                  <div className="flex justify-center py-1">
                    <ChevronDown className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            );
          })}

          {/* You (Citizen) at the bottom */}
          {!isSearchMode && displayLeaders.length > 0 && (
            <div className="flex items-center gap-2 pt-2 px-1">
              <span className="text-xs font-semibold text-primary">YOU</span>
              <span className="text-xs text-muted-foreground">(नागरिक)</span>
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
        <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            {locationInfo.parliamentary_constituency} Parliamentary • {locationInfo.assembly_constituency} Assembly • {locationInfo.state}
          </p>
        </div>
      )}
    </div>
  );
};