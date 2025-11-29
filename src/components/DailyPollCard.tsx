import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Poll {
  id: string;
  category: string;
  question: string;
  poll_date: string;
}

interface PollResponse {
  poll_id: string;
  response: boolean;
}

export const DailyPollCard = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [responses, setResponses] = useState<Record<string, boolean>>({});
  const [userPincode, setUserPincode] = useState<string>("");
  const [userWard, setUserWard] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolls();
    fetchUserInfo();
    fetchUserResponses();
  }, []);

  const fetchUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("pincode")
        .eq("user_id", user.id)
        .single();

      if (profile?.pincode) {
        setUserPincode(profile.pincode);
        
        const { data: location } = await supabase
          .from("pincode_constituency")
          .select("ward")
          .eq("pincode", profile.pincode)
          .single();

        if (location?.ward) {
          setUserWard(location.ward);
        }
      }
    }
  };

  const fetchPolls = async () => {
    const { data, error } = await supabase
      .from("daily_polls")
      .select("*")
      .eq("is_active", true)
      .eq("poll_date", new Date().toISOString().split('T')[0])
      .order("category")
      .limit(2);

    if (error) {
      console.error("Error fetching polls:", error);
      return;
    }

    setPolls(data || []);
  };

  const fetchUserResponses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("poll_responses")
      .select("poll_id, response")
      .eq("user_id", user.id)
      .gte("created_at", new Date().toISOString().split('T')[0]);

    if (error) {
      console.error("Error fetching responses:", error);
      return;
    }

    const responsesMap: Record<string, boolean> = {};
    data?.forEach((r: PollResponse) => {
      responsesMap[r.poll_id] = r.response;
    });
    setResponses(responsesMap);
  };

  const handleResponse = async (pollId: string, response: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to participate in polls",
        variant: "destructive",
      });
      return;
    }

    if (!userPincode) {
      toast({
        title: "Location required",
        description: "Please update your pincode in profile settings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("poll_responses").insert({
      poll_id: pollId,
      user_id: user.id,
      pincode: userPincode,
      ward: userWard || null,
      response: response,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit response. You may have already voted today.",
        variant: "destructive",
      });
    } else {
      setResponses({ ...responses, [pollId]: response });
      toast({
        title: "Response recorded!",
        description: "Thank you for helping improve your area's score.",
      });
      
      // Navigate to board after 1 second
      setTimeout(() => {
        navigate("/board");
      }, 1000);
    }

    setLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      cleanliness: "🗑️",
      water: "💧",
      roads: "🚗",
      safety: "🛡️",
    };
    return icons[category] || "📊";
  };

  if (polls.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Today's Quick Polls
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Help your area climb the rankings! 🏆
        </p>
      </CardHeader>
      <CardContent className="max-h-[300px] overflow-y-auto space-y-4">
        {polls.map((poll) => (
          <div key={poll.id} className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xl">{getCategoryIcon(poll.category)}</span>
              <p className="text-sm font-medium flex-1">{poll.question}</p>
            </div>
            {responses[poll.id] !== undefined ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pl-8">
                {responses[poll.id] ? (
                  <>
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span>You voted Yes</span>
                  </>
                ) : (
                  <>
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <span>You voted No</span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex gap-2 pl-8">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-green-600/20 hover:bg-green-600/10 hover:border-green-600"
                  onClick={() => handleResponse(poll.id, true)}
                  disabled={loading}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-600/20 hover:bg-red-600/10 hover:border-red-600"
                  onClick={() => handleResponse(poll.id, false)}
                  disabled={loading}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  No
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
