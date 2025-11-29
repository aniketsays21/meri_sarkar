import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Vote, TrendingUp, Users, Clock, Check, Plus, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { CreatePollDialog } from "./CreatePollDialog";

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  total_votes: number;
  ends_at: string | null;
  category: string;
  created_at: string;
}

export const PollContent = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());
  const [votingPollId, setVotingPollId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPolls();
    fetchUser();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('polls-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'polls' },
        () => fetchPolls()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (profile) {
        setUserId(profile.id);
        // Fetch user's votes
        const { data: votes } = await supabase
          .from('poll_votes')
          .select('poll_id')
          .eq('user_id', profile.id);
        if (votes) {
          setVotedPolls(new Set(votes.map(v => v.poll_id)));
        }
      }
    }
  };

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse options from JSONB
      const parsedPolls = (data || []).map(poll => ({
        ...poll,
        options: Array.isArray(poll.options) 
          ? (poll.options as unknown as PollOption[]) 
          : []
      })) as Poll[];
      
      setPolls(parsedPolls);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to vote",
        variant: "destructive"
      });
      return;
    }

    if (votedPolls.has(pollId)) {
      toast({
        title: "Already voted",
        description: "You have already voted on this poll",
        variant: "destructive"
      });
      return;
    }

    setVotingPollId(pollId);
    try {
      // Insert vote
      const { error: voteError } = await supabase.from('poll_votes').insert({
        poll_id: pollId,
        user_id: userId,
        option_index: optionIndex
      });

      if (voteError) throw voteError;

      // Update poll options and total votes
      const poll = polls.find(p => p.id === pollId);
      if (poll) {
        const updatedOptions = poll.options.map((opt, idx) => ({
          ...opt,
          votes: idx === optionIndex ? opt.votes + 1 : opt.votes
        }));

        await supabase.from('polls').update({
          options: updatedOptions,
          total_votes: poll.total_votes + 1
        }).eq('id', pollId);
      }

      setVotedPolls(prev => new Set([...prev, pollId]));
      fetchPolls();

      toast({
        title: "Vote recorded!",
        description: "Thanks for participating",
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive"
      });
    } finally {
      setVotingPollId(null);
    }
  };

  const getPercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const getTimeLeft = (endsAt: string | null) => {
    if (!endsAt) return "Ongoing";
    const end = new Date(endsAt);
    if (end < new Date()) return "Ended";
    return formatDistanceToNow(end, { addSuffix: false }) + " left";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Vote className="w-5 h-5" />
          <h2 className="font-semibold">Community Polls</h2>
        </div>
        <p className="text-xs opacity-90">
          Vote on issues that matter to your area
        </p>
      </div>

      {/* Polls List */}
      <div className="space-y-3">
        {polls.length === 0 ? (
          <div className="bg-card rounded-xl p-6 text-center border border-border">
            <Vote className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active polls yet</p>
          </div>
        ) : (
          polls.map((poll) => {
            const hasVoted = votedPolls.has(poll.id);
            const isVoting = votingPollId === poll.id;

            return (
              <div
                key={poll.id}
                className="bg-card rounded-xl p-4 border border-border shadow-card"
              >
                {/* Poll Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-foreground text-sm leading-tight flex-1">
                      {poll.question}
                    </h3>
                    {hasVoted && (
                      <Badge variant="secondary" className="shrink-0 text-xs bg-accent/10 text-accent">
                        <Check className="w-3 h-3 mr-1" />
                        Voted
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {poll.total_votes} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeLeft(poll.ends_at)}
                    </span>
                  </div>
                </div>

                {/* Options - Compact Horizontal Bars */}
                <div className="space-y-2">
                  {poll.options.map((option, idx) => {
                    const percentage = getPercentage(option.votes, poll.total_votes);
                    const isWinning = poll.options.every(o => option.votes >= o.votes);

                    return (
                      <button
                        key={idx}
                        onClick={() => !hasVoted && handleVote(poll.id, idx)}
                        disabled={hasVoted || isVoting}
                        className={`w-full text-left relative overflow-hidden rounded-lg transition-all ${
                          hasVoted
                            ? 'cursor-default'
                            : 'hover:ring-2 hover:ring-primary/30 active:scale-[0.99]'
                        }`}
                      >
                        {/* Background Progress */}
                        <div
                          className={`absolute inset-0 transition-all duration-500 ${
                            isWinning && hasVoted
                              ? 'bg-primary/20'
                              : 'bg-muted'
                          }`}
                          style={{ width: hasVoted ? `${percentage}%` : '0%' }}
                        />
                        
                        {/* Content */}
                        <div className="relative flex items-center justify-between p-2.5 bg-muted/50">
                          <span className="text-sm text-foreground truncate pr-2 flex-1">
                            {option.text}
                          </span>
                          {hasVoted && (
                            <span className={`text-sm font-semibold shrink-0 ${
                              isWinning ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              {percentage}%
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isVoting && (
                  <div className="flex items-center justify-center mt-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Poll */}
      <Button
        onClick={() => setIsCreateOpen(true)}
        variant="outline"
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create New Poll
      </Button>

      <CreatePollDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        userId={userId}
        onCreated={fetchPolls}
      />
    </div>
  );
};
