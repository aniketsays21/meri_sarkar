import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Droplet, Trash2, AlertCircle, User, Car, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { AlertDetailDialog } from "./AlertDetailDialog";

interface Alert {
  id: string;
  category: string;
  title: string;
  description: string;
  location_name: string | null;
  upvotes: number;
  created_at: string;
  user_id: string;
  image_url: string | null;
}

interface AlertWithUpvote extends Alert {
  hasUpvoted: boolean;
}

interface AreaAlertsListProps {
  pincode: string;
  onAlertClick?: (alert: Alert) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "water":
      return Droplet;
    case "garbage":
      return Trash2;
    case "unsafe":
      return AlertTriangle;
    case "neta_missing":
      return User;
    case "roads":
      return Car;
    default:
      return AlertCircle;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "water":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "garbage":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "unsafe":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    case "neta_missing":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "roads":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "water":
      return "Water Issue";
    case "garbage":
      return "Garbage Issue";
    case "unsafe":
      return "Unsafe Area";
    case "neta_missing":
      return "Neta Missing";
    case "roads":
      return "Roads Broken";
    default:
      return category;
  }
};

export const AreaAlertsList = ({ pincode }: AreaAlertsListProps) => {
  const [alerts, setAlerts] = useState<AlertWithUpvote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [upvoting, setUpvoting] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("area_alerts")
        .select("*")
        .eq("pincode", pincode)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      if (!user) {
        setAlerts((data || []).map(alert => ({ ...alert, hasUpvoted: false })));
        return;
      }

      // Check which alerts the user has upvoted
      const alertIds = (data || []).map(a => a.id);
      const { data: upvotes } = await supabase
        .from("alert_upvotes")
        .select("alert_id")
        .eq("user_id", user.id)
        .in("alert_id", alertIds);

      const upvotedIds = new Set(upvotes?.map(v => v.alert_id) || []);
      
      setAlerts((data || []).map(alert => ({
        ...alert,
        hasUpvoted: upvotedIds.has(alert.id)
      })));
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "Failed to load area alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (alert: AlertWithUpvote, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upvote",
        variant: "destructive",
      });
      return;
    }

    setUpvoting(alert.id);
    try {
      if (alert.hasUpvoted) {
        // Remove upvote
        await supabase
          .from("alert_upvotes")
          .delete()
          .eq("alert_id", alert.id)
          .eq("user_id", user.id);

        await supabase
          .from("area_alerts")
          .update({ upvotes: alert.upvotes - 1 })
          .eq("id", alert.id);
      } else {
        // Add upvote
        await supabase.from("alert_upvotes").insert({
          alert_id: alert.id,
          user_id: user.id,
        });

        await supabase
          .from("area_alerts")
          .update({ upvotes: alert.upvotes + 1 })
          .eq("id", alert.id);
      }

      fetchAlerts();
    } catch (error) {
      console.error("Error upvoting:", error);
      toast({
        title: "Error",
        description: "Failed to update vote",
        variant: "destructive",
      });
    } finally {
      setUpvoting(null);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Subscribe to new alerts
    const channel = supabase
      .channel("area-alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "area_alerts",
          filter: `pincode=eq.${pincode}`,
        },
        (payload) => {
          const newAlert = payload.new as Alert;
          toast({
            title: `New ${getCategoryLabel(newAlert.category)}`,
            description: newAlert.title,
          });
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pincode]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Area Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Area Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No active alerts in your area
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Area Alerts ({alerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert) => {
            const Icon = getCategoryIcon(alert.category);
            const colorClass = getCategoryColor(alert.category);

            return (
              <div
                key={alert.id}
                className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className={colorClass}>
                      <Icon className="w-3 h-3 mr-1" />
                      {getCategoryLabel(alert.category).toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>👥 {alert.upvotes} {alert.upvotes === 1 ? "person" : "people"} affected</span>
                  </div>
                </div>
                <Button
                  variant={alert.hasUpvoted ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => handleUpvote(alert, e)}
                  disabled={upvoting === alert.id}
                  className="w-full gap-2"
                >
                  <ThumbsUp className="w-3 h-3" />
                  {alert.hasUpvoted ? "You're affected" : "I'm affected too"}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {selectedAlert && (
        <AlertDetailDialog
          alert={selectedAlert}
          open={!!selectedAlert}
          onOpenChange={(open) => !open && setSelectedAlert(null)}
          onAlertUpdated={fetchAlerts}
        />
      )}
    </>
  );
};
