import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  activity_type: string;
  activity_description: string;
  activity_date: string;
  is_positive: boolean;
}

interface Leader {
  id: string;
  name: string;
  designation: string;
  party?: string;
  image_url?: string;
}

interface LeaderActivityProps {
  leader: Leader;
  activities: Activity[];
  onClick: () => void;
}

export const LeaderActivity = ({ leader, activities, onClick }: LeaderActivityProps) => {
  const hasActivity = activities && activities.length > 0;
  const lastActivity = hasActivity ? activities[0] : null;
  const isInactive = !hasActivity || activities.some(a => a.activity_type === 'no_activity' || a.activity_type === 'absent');

  const getStatusIcon = () => {
    if (isInactive) {
      return <XCircle className="text-red-500" size={18} />;
    }
    if (activities.some(a => !a.is_positive)) {
      return <AlertTriangle className="text-yellow-500" size={18} />;
    }
    return <CheckCircle2 className="text-green-500" size={18} />;
  };

  const getLastActiveText = () => {
    if (!lastActivity) return 'No recent activity';
    
    try {
      const activityDate = new Date(lastActivity.activity_date);
      return `Last active: ${formatDistanceToNow(activityDate, { addSuffix: true })}`;
    } catch {
      return 'Last active: Recently';
    }
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={leader.image_url} alt={leader.name} />
          <AvatarFallback>{leader.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{leader.name}</h4>
              <p className="text-xs text-muted-foreground">
                {leader.designation}
                {leader.party && ` • ${leader.party}`}
              </p>
            </div>
            {getStatusIcon()}
          </div>

          {hasActivity && activities.length > 0 ? (
            <div className="space-y-1 mt-2">
              {activities.slice(0, 2).map((activity, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-xs mt-0.5">•</span>
                  <p className="text-xs text-foreground flex-1">{activity.activity_description}</p>
                </div>
              ))}
              {activities.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{activities.length - 2} more
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">❌ No activity recorded today</p>
          )}

          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Clock size={12} />
            {getLastActiveText()}
          </div>
        </div>
      </div>
    </Card>
  );
};