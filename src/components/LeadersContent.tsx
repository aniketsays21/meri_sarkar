import { useNavigate } from "react-router-dom";
import LeaderCard from "./LeaderCard";
import { Crown, Building2, Users, Home } from "lucide-react";

const mockLeaders = [
  {
    id: 1,
    name: "Thaawarchand Gehlot",
    position: "Governor",
    party: "BJP",
    constituency: "Karnataka",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    score: 85,
    attendance: 95,
    fundsUtilized: 88,
    questionsRaised: 0,
  },
  {
    id: 2,
    name: "Siddaramaiah",
    position: "Chief Minister",
    party: "INC",
    constituency: "Karnataka",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    score: 78,
    attendance: 92,
    fundsUtilized: 85,
    questionsRaised: 45,
  },
  {
    id: 3,
    name: "Tejasvi Surya",
    position: "Member of Parliament",
    party: "BJP",
    constituency: "Bengaluru South",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    score: 72,
    attendance: 88,
    fundsUtilized: 78,
    questionsRaised: 156,
  },
  {
    id: 4,
    name: "Ramalinga Reddy",
    position: "Member of Legislative Assembly",
    party: "INC",
    constituency: "BTM Layout",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    score: 75,
    attendance: 85,
    fundsUtilized: 82,
    questionsRaised: 89,
  },
  {
    id: 5,
    name: "Lakshmi Devi",
    position: "Ward Councillor",
    party: "INC",
    constituency: "Ward 143",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    score: 80,
    attendance: 90,
    fundsUtilized: 85,
    questionsRaised: 34,
  },
];

export const LeadersContent = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Know Your Neta</h2>
        <p className="text-sm text-gray-600">
          Your political hierarchy from local to state level leaders
        </p>
      </div>

      <div className="space-y-4">
        {mockLeaders.map((leader, index) => (
          <div key={leader.id} className="relative">
            {index > 0 && (
              <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-0.5 h-4 bg-gradient-to-b from-indigo-200 to-transparent" />
            )}
            <LeaderCard
              leader={leader}
              onClick={() => navigate(`/leader/${leader.id}`)}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          📍 Showing leaders for BTM Layout, Bengaluru South
        </p>
      </div>
    </div>
  );
};
