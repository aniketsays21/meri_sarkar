import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ThumbsUp, ThumbsDown, Shield, Route, Droplets, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface Leader {
  id: string;
  name: string;
  designation: string;
  party?: string;
  image_url?: string;
}

interface LeaderVotingCardProps {
  leader: Leader;
  voteCounts: VoteCounts;
  userVotes: UserVotes;
  onVote: (leaderId: string, category: "safety" | "roads" | "water", voteType: "up" | "down") => void;
  isVoting?: boolean;
}

const CATEGORIES = [
  { key: "safety" as const, label: "Safety", icon: Shield, color: "text-orange-500", bgColor: "bg-orange-500" },
  { key: "roads" as const, label: "Roads", icon: Route, color: "text-blue-500", bgColor: "bg-blue-500" },
  { key: "water" as const, label: "Water", icon: Droplets, color: "text-cyan-500", bgColor: "bg-cyan-500" },
];

export const LeaderVotingCard = ({ 
  leader, 
  voteCounts, 
  userVotes, 
  onVote,
  isVoting = false 
}: LeaderVotingCardProps) => {
  const navigate = useNavigate();

  const getVotePercentage = (up: number, down: number) => {
    const total = up + down;
    if (total === 0) return 50;
    return Math.round((up / total) * 100);
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Leader Info Header */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate(`/leader/${leader.id}`)}
      >
        <img
          src={leader.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.name}`}
          alt={leader.name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-border"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
            {leader.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">{leader.designation}</Badge>
            {leader.party && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {leader.party}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      {/* Voting Categories */}
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label, icon: Icon, color, bgColor }) => {
          const counts = voteCounts[key];
          const userVote = userVotes[key];
          const percentage = getVotePercentage(counts.up, counts.down);

          return (
            <div key={key} className="space-y-1.5">
              {/* Category Label */}
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", color)} />
                <span className="text-sm font-medium">{label}</span>
              </div>

              {/* Voting Row */}
              <div className="flex items-center gap-2">
                {/* Downvote Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2 gap-1 transition-all",
                    userVote === "down" 
                      ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400" 
                      : "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  )}
                  onClick={() => onVote(leader.id, key, "down")}
                  disabled={isVoting}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium min-w-[20px]">{counts.down}</span>
                </Button>

                {/* Progress Bar */}
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                  <div 
                    className={cn("h-full transition-all duration-300", bgColor)}
                    style={{ width: `${percentage}%` }}
                  />
                  {/* Center line indicator */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-background/50" />
                </div>

                {/* Upvote Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2 gap-1 transition-all",
                    userVote === "up" 
                      ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" 
                      : "hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
                  )}
                  onClick={() => onVote(leader.id, key, "up")}
                  disabled={isVoting}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium min-w-[20px]">{counts.up}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
