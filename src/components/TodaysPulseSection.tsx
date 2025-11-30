import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface PollStats {
  category: string;
  yesCount: number;
  noCount: number;
  totalCount: number;
  percentageUnhappy: number;
}

export const TodaysPulseSection = () => {
  const [pollStats, setPollStats] = useState<PollStats[]>([]);
  const [userPincode, setUserPincode] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userPincode) {
      fetchPollStats();
    }
  }, [userPincode]);

  const fetchUserData = async () => {
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

    if (profile?.pincode) {
      setUserPincode(profile.pincode);
    } else {
      setLoading(false);
    }
  };

  const fetchPollStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data: polls } = await supabase
      .from("daily_polls")
      .select("id, category, question")
      .eq("is_active", true);

    if (!polls) {
      setLoading(false);
      return;
    }

    const stats: PollStats[] = await Promise.all(
      polls.map(async (poll) => {
        const { data: responses } = await supabase
          .from("poll_responses")
          .select("response")
          .eq("poll_id", poll.id)
          .eq("pincode", userPincode)
          .gte("created_at", today);

        const yesCount = responses?.filter(r => r.response === true).length || 0;
        const noCount = responses?.filter(r => r.response === false).length || 0;
        const totalCount = yesCount + noCount;
        const percentageUnhappy = totalCount > 0 ? Math.round((noCount / totalCount) * 100) : 0;

        return {
          category: poll.category,
          yesCount,
          noCount,
          totalCount,
          percentageUnhappy,
        };
      })
    );

    setPollStats(stats);
    setLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      garbage: "🗑️",
      cleanliness: "🗑️",
      water: "💧",
      roads: "🚗",
      unsafe: "🛡️",
      safety: "🛡️",
      neta_missing: "👤",
    };
    return icons[category] || "📊";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      garbage: "Garbage",
      cleanliness: "Cleanliness",
      water: "Water",
      roads: "Roads",
      unsafe: "Safety",
      safety: "Safety",
      neta_missing: "Leader Attendance",
    };
    return labels[category] || category;
  };

  const getStatusIndicator = (percentage: number) => {
    if (percentage > 50) return { icon: "❌", color: "text-red-600" };
    if (percentage > 30) return { icon: "⚠️", color: "text-yellow-600" };
    return { icon: "✅", color: "text-green-600" };
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            📊 Today's Pulse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pollStats.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            📊 Today's Pulse
          </CardTitle>
          <p className="text-sm text-muted-foreground">Happy ratio in your area</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No poll responses yet today
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          📊 Today's Pulse
        </CardTitle>
        <p className="text-sm text-muted-foreground">Happy ratio in your area</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pollStats.map((stat) => {
            const status = getStatusIndicator(stat.percentageUnhappy);
            const happyPercentage = 100 - stat.percentageUnhappy;
            return (
              <div key={stat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCategoryIcon(stat.category)}</span>
                    <span className="font-medium capitalize">{getCategoryLabel(stat.category)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${status.color}`}>{status.icon}</span>
                    <span className="text-sm font-semibold">
                      {stat.percentageUnhappy}% unhappy
                    </span>
                  </div>
                </div>
                <Progress value={stat.percentageUnhappy} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{happyPercentage}% happy ({stat.yesCount} people)</span>
                  <span>{stat.percentageUnhappy}% unhappy ({stat.noCount} people)</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
