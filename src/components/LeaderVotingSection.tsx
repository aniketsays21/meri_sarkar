import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LeaderVotingCard } from "./LeaderVotingCard";

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
  const [isVoting, setIsVoting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
          // Refresh vote counts on any change
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
      const { data, error } = await supabase
        .from("leader_category_votes")
        .select("leader_id, category, vote_type");

      if (error) throw error;

      // Aggregate vote counts per leader per category
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
      const { data, error } = await supabase
        .from("leader_category_votes")
        .select("leader_id, category, vote_type")
        .eq("user_id", userId);

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

  const handleVote = async (leaderId: string, category: Category, voteType: VoteType) => {
    if (!userId) {
      toast.error("Please login to vote");
      return;
    }

    setIsVoting(true);
    
    const currentVote = userVotes[leaderId]?.[category];

    try {
      if (currentVote === voteType) {
        // Remove vote (toggle off)
        const { error } = await supabase
          .from("leader_category_votes")
          .delete()
          .eq("user_id", userId)
          .eq("leader_id", leaderId)
          .eq("category", category);

        if (error) throw error;

        // Update local state
        setUserVotes(prev => {
          const updated = { ...prev };
          if (updated[leaderId]) {
            delete updated[leaderId][category];
          }
          return updated;
        });
      } else if (currentVote) {
        // Change vote
        const { error } = await supabase
          .from("leader_category_votes")
          .update({ vote_type: voteType })
          .eq("user_id", userId)
          .eq("leader_id", leaderId)
          .eq("category", category);

        if (error) throw error;

        // Update local state
        setUserVotes(prev => ({
          ...prev,
          [leaderId]: {
            ...prev[leaderId],
            [category]: voteType
          }
        }));
      } else {
        // New vote
        const { error } = await supabase
          .from("leader_category_votes")
          .insert({
            user_id: userId,
            leader_id: leaderId,
            category,
            vote_type: voteType
          });

        if (error) throw error;

        // Update local state
        setUserVotes(prev => ({
          ...prev,
          [leaderId]: {
            ...prev[leaderId],
            [category]: voteType
          }
        }));
      }

      // Refresh vote counts
      fetchVoteCounts();
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error("Failed to submit vote");
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Rate Your Leaders</h2>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="space-y-4">
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Rate Your Leaders</h2>
        <span className="text-xs text-muted-foreground">
          Vote on issues in your area
        </span>
      </div>
      
      <div className="space-y-4">
        {leaders.map(leader => (
          <LeaderVotingCard
            key={leader.id}
            leader={leader}
            voteCounts={voteCounts[leader.id] || { safety: { up: 0, down: 0 }, roads: { up: 0, down: 0 }, water: { up: 0, down: 0 } }}
            userVotes={userVotes[leader.id] || {}}
            onVote={handleVote}
            isVoting={isVoting}
          />
        ))}
      </div>
    </div>
  );
};
