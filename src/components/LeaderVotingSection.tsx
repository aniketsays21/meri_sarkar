import { useState, useEffect } from "react";
import { User, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { LeaderVotingCard } from "./LeaderVotingCard";
import { getWeek, getYear, startOfWeek, endOfWeek, format } from "date-fns";

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

export const LeaderVotingSection = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteCounts, setVoteCounts] = useState<Record<string, VoteCounts>>({});
  const [userVotes, setUserVotes] = useState<Record<string, UserVotes>>({});
  const [userId, setUserId] = useState<string | null>(null);

  // Get current week info
  const now = new Date();
  const currentWeek = getWeek(now);
  const currentYear = getYear(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekRange = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  useEffect(() => {
    fetchLeaders();
    checkAuth();
  }, []);

  useEffect(() => {
    if (leaders.length > 0) {
      fetchVoteCounts();
      if (userId) {
        fetchUserVotes();
      }
    }
  }, [leaders, userId]);

  // Set up realtime subscription for vote updates
  useEffect(() => {
    const channel = supabase
      .channel('leader-votes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leader_category_votes'
        },
        () => {
          fetchVoteCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const fetchLeaders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("pincode")
        .eq("user_id", user.id)
        .single();

      const pincode = profile?.pincode || "560029";

      const { data } = await supabase.functions.invoke("fetch-leaders", {
        body: { pincode }
      });

      if (data?.leaders) {
        setLeaders(data.leaders);
      }
    } catch (error) {
      console.error("Error fetching leaders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteCounts = async () => {
    try {
      // Get all votes for the current week to show community totals
      const { data, error } = await supabase
        .from("leader_category_votes")
        .select("leader_id, category, vote_type")
        .eq("week_number", currentWeek)
        .eq("year", currentYear);

      if (error) throw error;

      const counts: Record<string, VoteCounts> = {};
      
      leaders.forEach(leader => {
        counts[leader.id] = {
          safety: { up: 0, down: 0 },
          roads: { up: 0, down: 0 },
          water: { up: 0, down: 0 }
        };
      });

      data?.forEach(vote => {
        if (counts[vote.leader_id]) {
          const category = vote.category as Category;
          const voteType = vote.vote_type as VoteType;
          counts[vote.leader_id][category][voteType]++;
        }
      });

      setVoteCounts(counts);
    } catch (error) {
      console.error("Error fetching vote counts:", error);
    }
  };

  const fetchUserVotes = async () => {
    if (!userId) return;

    try {
      // Only get user's votes for the current week
      const { data, error } = await supabase
        .from("leader_category_votes")
        .select("leader_id, category, vote_type")
        .eq("user_id", userId)
        .eq("week_number", currentWeek)
        .eq("year", currentYear);

      if (error) throw error;

      const votes: Record<string, UserVotes> = {};
      
      data?.forEach(vote => {
        if (!votes[vote.leader_id]) {
          votes[vote.leader_id] = {};
        }
        votes[vote.leader_id][vote.category as Category] = vote.vote_type as VoteType;
      });

      setUserVotes(votes);
    } catch (error) {
      console.error("Error fetching user votes:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Rate Your Leaders</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-[200px] rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Rate Your Leaders</h2>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1">No leaders found</h3>
              <p className="text-sm text-muted-foreground">Update your pincode to see local leaders</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with week info */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Rate Your Leaders</h2>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>Week {currentWeek}: {weekRange}</span>
        </div>
      </div>
      
      {/* Horizontal scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {leaders.map(leader => (
          <LeaderVotingCard
            key={leader.id}
            leader={leader}
            voteCounts={voteCounts[leader.id] || { safety: { up: 0, down: 0 }, roads: { up: 0, down: 0 }, water: { up: 0, down: 0 } }}
            userVotes={userVotes[leader.id] || {}}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
};
