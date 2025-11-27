import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import LeaderCard from "./LeaderCard";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

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

export const LeadersContent = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from("leaders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setLeaders(data as Leader[]);
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
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Know Your Neta</h2>
        <p className="text-sm text-gray-600">
          Your political hierarchy from local to state level leaders
        </p>
      </div>

      <div className="space-y-4">
        {leaders.map((leader, index) => {
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
              {index > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-0.5 h-4 bg-gradient-to-b from-indigo-200 to-transparent" />
              )}
              <LeaderCard
                leader={formattedLeader}
                onClick={() => navigate(`/leader/${leader.id}`)}
              />
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          📍 Showing leaders for BTM Layout, Bengaluru South
        </p>
      </div>
    </div>
  );
};
