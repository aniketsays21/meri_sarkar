import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign } from "lucide-react";

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
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-score-excellent text-white";
    if (score >= 6.5) return "bg-score-good text-white";
    if (score >= 5) return "bg-score-average text-white";
    if (score >= 3) return "bg-score-poor text-white";
    return "bg-score-bad text-white";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6.5) return "Good";
    if (score >= 5) return "Average";
    if (score >= 3) return "Poor";
    return "Needs Work";
  };

  return (
    <Card
      onClick={onClick}
      className="p-5 shadow-card hover:shadow-card-hover transition-smooth cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-start gap-4 mb-4">
        <img
          src={leader.image}
          alt={leader.name}
          className="w-16 h-16 rounded-2xl bg-muted object-cover"
        />
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg mb-1">
            {leader.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {leader.position}
          </p>
          <Badge variant="secondary" className="text-xs">
            {leader.party}
          </Badge>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className={`px-3 py-1 rounded-full font-display font-bold text-lg ${getScoreColor(
              leader.score
            )}`}
          >
            {leader.score}
          </div>
          <span className="text-xs text-muted-foreground">
            {getScoreLabel(leader.score)}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sabha Attendance</p>
            <p className="font-display font-bold text-sm">{leader.attendance}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Funds Used</p>
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
