import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import LeaderCard from "./LeaderCard";
import { Search, X, User, Sparkles, Database, Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

interface Leader {
  id: string;
  name: string;
  designation: string;
  party: string | null;
  constituency: string | null;
  image_url: string | null;
  attendance: number | null;
  funds_utilized: number | null;
  questions_raised: number | null;
}

interface SearchSuggestion {
  id: string;
  name: string;
  designation: string;
  party: string | null;
  constituency: string | null;
  state: string | null;
  image_url: string | null;
}

interface SearchResult {
  leaders: SearchSuggestion[];
  source: "database" | "ai" | "none" | "error";
  saved?: boolean;
  error?: string;
}

export const LeadersContent = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSource, setSearchSource] = useState<string>("");
  const searchRef = useRef<HTMLDivElement>(null);
  const [locationInfo, setLocationInfo] = useState<{
    ward?: string;
    assembly_constituency?: string;
    parliamentary_constituency?: string;
    district?: string;
    state?: string;
  } | null>(null);

  useEffect(() => {
    fetchLeaders();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AI-powered search when query changes
  useEffect(() => {
    const searchLeaders = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setSearchSource("");
        return;
      }

      setSearchLoading(true);
      setShowSuggestions(true);
      
      try {
        // Use AI-powered search edge function
        const { data, error } = await supabase.functions.invoke<SearchResult>("search-leader", {
          body: { query: searchQuery }
        });

        if (error) throw error;

        if (data) {
          setSuggestions(data.leaders || []);
          setSearchSource(data.source);
          
          if (data.source === "ai" && data.saved) {
            toast.success("New leader data fetched and saved!", {
              description: `Found ${data.leaders.length} leader(s) from web`
            });
          }
          
          if (data.error) {
            toast.error(data.error);
          }
        }
      } catch (error) {
        console.error("Error searching leaders:", error);
        toast.error("Search failed. Please try again.");
      } finally {
        setSearchLoading(false);
      }
    };

    const debounce = setTimeout(searchLeaders, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const fetchLeaders = async () => {
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
        setLeaders(data.leaders as Leader[]);
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

  const calculateScore = (leader: Leader) => {
    const attendance = leader.attendance || 0;
    const funds = leader.funds_utilized || 0;
    const questions = Math.min((leader.questions_raised || 0) / 10, 100);
    return Math.round((attendance + funds + questions) / 3);
  };

  const filteredLeaders = leaders.filter(leader =>
    leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    leader.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    leader.party?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHierarchyLabel = (index: number) => {
    const labels = ["State Level", "National Level", "Assembly Level", "Local Level"];
    return labels[index] || `Level ${index + 1}`;
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigate(`/leader/${suggestion.id}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
        <p className="text-gray-600">No leaders found. Add leaders from your backend.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar with Autocomplete */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search any leader by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <Card className="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto shadow-lg border bg-card">
            {searchLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Searching database & web...
                </p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-1 flex items-center gap-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Results ({suggestions.length})
                  </p>
                  {searchSource === "ai" && (
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Fetched
                    </Badge>
                  )}
                  {searchSource === "database" && (
                    <Badge variant="outline" className="text-xs">
                      <Database className="w-3 h-3 mr-1" />
                      From DB
                    </Badge>
                  )}
                </div>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <img
                      src={suggestion.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${suggestion.name}`}
                      alt={suggestion.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{suggestion.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {suggestion.designation} • {suggestion.party || "Independent"}
                      </p>
                      {(suggestion.constituency || suggestion.state) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {[suggestion.constituency, suggestion.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="p-4 text-center">
                <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No leaders found for "{searchQuery}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different spelling or full name
                </p>
              </div>
            ) : null}
          </Card>
        )}
      </div>

      {/* My Area Leaders */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Leaders in Your Area
        </h3>
        <div className="space-y-6">
          {filteredLeaders.map((leader, index) => {
            const numericId = parseInt(leader.id) || 0;
            const formattedLeader = {
              id: numericId,
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
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {getHierarchyLabel(index)}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {index > 0 && (
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
      </div>

      {locationInfo && (
        <div className="bg-card rounded-xl p-6 border text-center">
          <p className="text-sm text-muted-foreground">
            📍 Showing leaders for {locationInfo.ward || locationInfo.assembly_constituency}, {locationInfo.parliamentary_constituency || locationInfo.district}
          </p>
        </div>
      )}
    </div>
  );
};
