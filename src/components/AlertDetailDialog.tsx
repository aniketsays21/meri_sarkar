import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Droplet, Trash2, AlertTriangle, User, Car, Instagram, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface AlertDetailDialogProps {
  alert: Alert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAlertUpdated: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "water": return Droplet;
    case "garbage": return Trash2;
    case "unsafe": return AlertTriangle;
    case "neta_missing": return User;
    case "roads": return Car;
    default: return AlertTriangle;
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "water": return "Water Issue";
    case "garbage": return "Garbage Issue";
    case "unsafe": return "Unsafe Area";
    case "neta_missing": return "Neta Missing";
    case "roads": return "Roads Broken";
    default: return category;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "water": return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "garbage": return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    case "unsafe": return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    case "neta_missing": return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "roads": return "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20";
    default: return "bg-muted text-muted-foreground";
  }
};

export const AlertDetailDialog = ({
  alert,
  open,
  onOpenChange,
  onAlertUpdated,
}: AlertDetailDialogProps) => {
  const Icon = getCategoryIcon(alert.category);

  const shareToWhatsApp = () => {
    let text = `🚨 ${getCategoryLabel(alert.category).toUpperCase()} in ${alert.location_name || "my area"}!\n\n${alert.title}\n\n${alert.description}`;
    if (alert.image_url) {
      text += `\n\n📷 See photo: ${alert.image_url}`;
    }
    text += `\n\nReport issues in your area with our app!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToInstagram = () => {
    toast({
      title: "Instagram Story",
      description: "Take a screenshot of this alert and share it to your Instagram story!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {getCategoryLabel(alert.category)}
          </DialogTitle>
          <DialogDescription>
            {alert.location_name || "Your Area"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{alert.title}</h3>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
          </div>

          {alert.image_url && (
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={alert.image_url} 
                alt="Alert" 
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>📅 Reported {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
            <span>👥 {alert.upvotes} affected</span>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold mb-3">Spread the Word</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={shareToInstagram}
                className="gap-2"
              >
                <Instagram className="w-4 h-4" />
                Instagram Story
              </Button>
              <Button
                variant="outline"
                onClick={shareToWhatsApp}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
