import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, IndianRupee } from "lucide-react";

interface Leader {
  id: number;
  name: string;
  position: string;
  party: string;
  image: string;
  score: number;
  attendance: number;
  fundsUtilized: number;
  questionsRaised: number;
  constituency: string;
}

interface LeaderCardProps {
  leader: Leader;
  onClick: () => void;
}

const LeaderCard = ({ leader, onClick }: LeaderCardProps) => {
  const [imageError, setImageError] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-score-excellent text-white";
    if (score >= 65) return "bg-score-good text-white";
    if (score >= 50) return "bg-score-average text-white";
    if (score >= 30) return "bg-score-poor text-white";
    return "bg-score-bad text-white";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 65) return "Good";
    if (score >= 50) return "Average";
    if (score >= 30) return "Poor";
    return "Needs Work";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPartyColor = (party: string) => {
    const partyLower = party?.toLowerCase() || "";
    if (partyLower.includes("bjp") || partyLower.includes("bharatiya janata")) return "bg-orange-500";
    if (partyLower.includes("congress") || partyLower.includes("inc")) return "bg-blue-500";
    if (partyLower.includes("aap")) return "bg-cyan-500";
    if (partyLower.includes("tmc")) return "bg-green-600";
    if (partyLower.includes("sp")) return "bg-red-500";
    if (partyLower.includes("independent")) return "bg-gray-500";
    return "bg-primary";
  };

  const getPartyBadgeColor = (party: string) => {
    const partyLower = party?.toLowerCase() || "";
    if (partyLower.includes("bjp") || partyLower.includes("bharatiya janata")) return "bg-orange-500 text-white hover:bg-orange-600";
    if (partyLower.includes("congress") || partyLower.includes("inc")) return "bg-blue-600 text-white hover:bg-blue-700";
    if (partyLower.includes("aap")) return "bg-cyan-500 text-white hover:bg-cyan-600";
    if (partyLower.includes("independent")) return "bg-gray-500 text-white hover:bg-gray-600";
    return "bg-primary text-primary-foreground";
  };

  return (
    <Card
      onClick={onClick}
      className="p-4 shadow-card hover:shadow-card-hover transition-smooth cursor-pointer active:scale-[0.98] border-border/50"
    >
      <div className="flex items-start gap-3 mb-3">
        {!imageError && leader.image ? (
          <img
            src={leader.image}
            alt={leader.name}
            className="w-14 h-14 rounded-xl bg-muted object-cover flex-shrink-0"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${getPartyColor(leader.party)}`}
          >
            {getInitials(leader.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-base leading-tight mb-0.5 truncate">
            {leader.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-1.5 truncate">
            {leader.position}
          </p>
          <Badge className={`text-xs px-2 py-0.5 ${getPartyBadgeColor(leader.party)}`}>
            {leader.party}
          </Badge>
        </div>
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm ${getScoreColor(
              leader.score
            )}`}
          >
            {leader.score}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {getScoreLabel(leader.score)}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground leading-tight">Sabha Attendance</p>
            <p className="font-display font-bold text-sm">{leader.attendance}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <IndianRupee className="w-3.5 h-3.5 text-accent" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground leading-tight">Funds Used</p>
            <p className="font-display font-bold text-sm">
              {leader.fundsUtilized}%
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LeaderCard;
