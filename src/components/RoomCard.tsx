import { Users, Clock, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";

interface RoomCardProps {
  room: {
    id: string;
    title: string;
    description: string | null;
    topic_category: string;
    is_live: boolean;
    scheduled_at: string | null;
    created_at: string;
    participant_count?: number;
  };
  onJoin: () => void;
}

const categoryColors: Record<string, string> = {
  national: "bg-primary/10 text-primary",
  state: "bg-secondary/10 text-secondary",
  local: "bg-accent/10 text-accent",
  policy: "bg-muted text-muted-foreground",
};

export const RoomCard = ({ room, onJoin }: RoomCardProps) => {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      national: "National",
      state: "State",
      local: "Local",
      policy: "Policy",
    };
    return labels[category] || category;
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-card transition-smooth hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {room.is_live && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5 animate-pulse">
                LIVE
              </Badge>
            )}
            <Badge 
              variant="secondary" 
              className={`text-xs px-2 py-0.5 ${categoryColors[room.topic_category] || categoryColors.policy}`}
            >
              {getCategoryLabel(room.topic_category)}
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
            {room.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs shrink-0">
          <Users className="w-3.5 h-3.5" />
          <span>{room.participant_count || 0}</span>
        </div>
      </div>

      {room.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {room.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>
            {room.scheduled_at
              ? `Scheduled ${formatDistanceToNow(new Date(room.scheduled_at), { addSuffix: true })}`
              : formatDistanceToNow(new Date(room.created_at), { addSuffix: true })}
          </span>
        </div>
        <Button
          size="sm"
          onClick={onJoin}
          className={room.is_live 
            ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
            : "gradient-primary text-primary-foreground"
          }
        >
          {room.is_live ? "Join Live" : "Enter"}
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
