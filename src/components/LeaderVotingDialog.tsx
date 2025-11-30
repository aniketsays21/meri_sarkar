import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThumbsUp, ThumbsDown, Shield, Route, Droplets, Clock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getWeek, getYear, endOfWeek, differenceInDays } from "date-fns";

interface Leader {
  id: string;
  name: string;
  designation: string;
  party?: string;
  image_url?: string;
}

interface VoteCounts {
  safety: { up: number; down: number };
  roads: { up: number; down: number };
  water: { up: number; down: number };
}

interface UserVotes {
  safety?: "up" | "down";
  roads?: "up" | "down";
  water?: "up" | "down";
}

type Category = "safety" | "roads" | "water";
type VoteType = "up" | "down";

const CATEGORIES = [
  { key: "safety" as const, label: "Safety", description: "Street lights, police presence, safe roads", icon: Shield, color: "text-orange-500", bgColor: "bg-orange-500" },
  { key: "roads" as const, label: "Roads", description: "Road quality, potholes, traffic management", icon: Route, color: "text-blue-500", bgColor: "bg-blue-500" },
  { key: "water" as const, label: "Water", description: "Water supply, drainage, cleanliness", icon: Droplets, color: "text-cyan-500", bgColor: "bg-cyan-500" },
];

interface LeaderVotingDialogProps {
  leader: Leader;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVoteComplete?: () => void;
}

export const LeaderVotingDialog = ({ leader, open, onOpenChange, onVoteComplete }: LeaderVotingDialogProps) => {
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({
    safety: { up: 0, down: 0 },
    roads: { up: 0, down: 0 },
    water: { up: 0, down: 0 }
  });
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [isVoting, setIsVoting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentWeek = getWeek(now);
  const currentYear = getYear(now);
  const weekEndDate = endOfWeek(now, { weekStartsOn: 1 });
  const daysUntilReset = differenceInDays(weekEndDate, now);

  useEffect(() => {
    if (open) {
      checkAuth();
    }
  }, [open]);

  useEffect(() => {
    if (open && leader.id) {
      fetchVoteCounts();
      if (userId) {
        fetchUserVotes();
      }
    }
  }, [open, leader.id, userId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const fetchVoteCounts = async () => {
    try {
      const { data, error } = await supabase
        .from("leader_category_votes")
        .select("category, vote_type")
        .eq("leader_id", leader.id)
        .eq("week_number", currentWeek)
        .eq("year", currentYear);

      if (error) throw error;

      const counts: VoteCounts = {
        safety: { up: 0, down: 0 },
        roads: { up: 0, down: 0 },
        water: { up: 0, down: 0 }
      };

      data?.forEach(vote => {
        const category = vote.category as Category;
        const voteType = vote.vote_type as VoteType;
        counts[category][voteType]++;
      });

      setVoteCounts(counts);
    } catch (error) {
      console.error("Error fetching vote counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("leader_category_votes")
        .select("category, vote_type")
        .eq("user_id", userId)
        .eq("leader_id", leader.id)
        .eq("week_number", currentWeek)
        .eq("year", currentYear);

      if (error) throw error;

      const votes: UserVotes = {};
      data?.forEach(vote => {
        votes[vote.category as Category] = vote.vote_type as VoteType;
      });

      setUserVotes(votes);
    } catch (error) {
      console.error("Error fetching user votes:", error);
    }
  };

  const handleVote = async (category: Category, voteType: VoteType) => {
    if (!userId) {
      toast.error("Please login to vote");
      return;
    }

    setIsVoting(true);
    const currentVote = userVotes[category];

    try {
      if (currentVote === voteType) {
        const { error } = await supabase
          .from("leader_category_votes")
          .delete()
          .eq("user_id", userId)
          .eq("leader_id", leader.id)
          .eq("category", category)
          .eq("week_number", currentWeek)
          .eq("year", currentYear);

        if (error) throw error;

        setUserVotes(prev => {
          const updated = { ...prev };
          delete updated[category];
          return updated;
        });
        toast.success("Vote removed");
      } else if (currentVote) {
        const { error } = await supabase
          .from("leader_category_votes")
          .update({ vote_type: voteType })
          .eq("user_id", userId)
          .eq("leader_id", leader.id)
          .eq("category", category)
          .eq("week_number", currentWeek)
          .eq("year", currentYear);

        if (error) throw error;

        setUserVotes(prev => ({
          ...prev,
          [category]: voteType
        }));
        toast.success("Vote updated");
      } else {
        const { error } = await supabase
          .from("leader_category_votes")
          .insert({
            user_id: userId,
            leader_id: leader.id,
            category,
            vote_type: voteType,
            week_number: currentWeek,
            year: currentYear
          });

        if (error) throw error;

        setUserVotes(prev => ({
          ...prev,
          [category]: voteType
        }));
        toast.success("Vote submitted!");
      }

      fetchVoteCounts();
      onVoteComplete?.();
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error("Failed to submit vote");
    } finally {
      setIsVoting(false);
    }
  };

  const getVotePercentage = (up: number, down: number) => {
    const total = up + down;
    if (total === 0) return 50;
    return Math.round((up / total) * 100);
  };

  const totalVotes = Object.values(userVotes).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
              src={leader.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.name}`}
              alt={leader.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
            />
            <div className="text-left">
              <h3 className="font-semibold text-base">{leader.name}</h3>
              <p className="text-sm text-muted-foreground font-normal">{leader.designation}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base">Your Weekly Vote</h3>
              <p className="text-xs text-muted-foreground">Rate this leader on key issues</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>Resets in {daysUntilReset} days</span>
            </div>
          </div>

          {/* Vote status badge */}
          {totalVotes > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              You've voted on {totalVotes}/3 categories this week
            </Badge>
          )}

          {/* Voting Categories */}
          <div className="space-y-4">
            {CATEGORIES.map(({ key, label, description, icon: Icon, color, bgColor }) => {
              const counts = voteCounts[key];
              const userVote = userVotes[key];
              const percentage = getVotePercentage(counts.up, counts.down);
              const totalCategoryVotes = counts.up + counts.down;

              return (
                <div key={key} className="space-y-2 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `${bgColor}/10`)}>
                      <Icon className={cn("w-4 h-4", color)} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{label}</span>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    {userVote && (
                      <Badge variant="outline" className="text-xs">
                        Your vote: {userVote === "up" ? "👍" : "👎"}
                      </Badge>
                    )}
                  </div>

                  <div className="relative">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-300", bgColor)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-background/70" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-9 px-3 gap-2 transition-all",
                        userVote === "down" 
                          ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400" 
                          : "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      )}
                      onClick={() => handleVote(key, "down")}
                      disabled={isVoting}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="font-medium">{counts.down}</span>
                    </Button>

                    <span className="text-xs text-muted-foreground">
                      {totalCategoryVotes} votes
                    </span>

                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-9 px-3 gap-2 transition-all",
                        userVote === "up" 
                          ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" 
                          : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
                      )}
                      onClick={() => handleVote(key, "up")}
                      disabled={isVoting}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-medium">{counts.up}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week info footer */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Week {currentWeek}, {currentYear}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
