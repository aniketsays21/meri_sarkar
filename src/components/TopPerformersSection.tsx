import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Calendar, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getWeek, getYear, startOfWeek, endOfWeek, format } from "date-fns";

interface LeaderScore {
  id: string;
  name: string;
  designation: string;
  party?: string;
  image_url?: string;
  totalUpvotes: number;
  totalDownvotes: number;
  score: number;
}

export const TopPerformersSection = () => {
  const [topPerformers, setTopPerformers] = useState<LeaderScore[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentWeek = getWeek(now);
  const currentYear = getYear(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekRange = `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;

  useEffect(() => {
    fetchTopPerformers();
  }, []);

  const fetchTopPerformers = async () => {
    try {
      // First get all votes for this week
      const { data: votes, error: votesError } = await supabase
        .from("leader_category_votes")
        .select("leader_id, vote_type")
        .eq("week_number", currentWeek)
        .eq("year", currentYear);

      if (votesError) throw votesError;

      // Aggregate votes by leader
      const leaderVotes: Record<string, { up: number; down: number }> = {};
      votes?.forEach(vote => {
        if (!leaderVotes[vote.leader_id]) {
          leaderVotes[vote.leader_id] = { up: 0, down: 0 };
        }
        if (vote.vote_type === "up") {
          leaderVotes[vote.leader_id].up++;
        } else {
          leaderVotes[vote.leader_id].down++;
        }
      });

      // Get leader IDs with most upvotes
      const leaderIds = Object.keys(leaderVotes);
      if (leaderIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch leader details
      const { data: leaders, error: leadersError } = await supabase
        .from("leaders")
        .select("id, name, designation, party, image_url")
        .in("id", leaderIds);

      if (leadersError) throw leadersError;

      // Calculate scores and sort
      const scoredLeaders: LeaderScore[] = (leaders || []).map(leader => {
        const voteData = leaderVotes[leader.id] || { up: 0, down: 0 };
        const total = voteData.up + voteData.down;
        const score = total > 0 ? Math.round((voteData.up / total) * 100) : 0;
        return {
          ...leader,
          totalUpvotes: voteData.up,
          totalDownvotes: voteData.down,
          score
        };
      });

      // Sort by score descending, then by total upvotes
      scoredLeaders.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.totalUpvotes - a.totalUpvotes;
      });

      setTopPerformers(scoredLeaders.slice(0, 3));
    } catch (error) {
      console.error("Error fetching top performers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  if (loading) {
    return (
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topPerformers.length === 0) {
    return (
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Performers
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Week {currentWeek}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No votes yet this week. Be the first to rate your leaders!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top Performers
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Week {currentWeek}: {weekRange}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Leaders with highest approval this week
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {topPerformers.map((leader, index) => (
          <div
            key={leader.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:shadow-sm transition-shadow"
          >
            <span className="text-2xl">{getMedalIcon(index)}</span>
            <img
              src={leader.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.name}`}
              alt={leader.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{leader.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{leader.designation}</p>
              {leader.party && (
                <Badge variant="outline" className="text-xs mt-1">{leader.party}</Badge>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold text-lg">{leader.score}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {leader.totalUpvotes} 👍 / {leader.totalDownvotes} 👎
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
