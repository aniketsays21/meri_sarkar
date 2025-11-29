import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Droplet, Trash2, AlertTriangle, User, Car, Upload, X } from "lucide-react";

interface CreateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pincode: string;
  locationName: string;
}

const categories = [
  { id: "water", label: "Water Problem", icon: Droplet, color: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30" },
  { id: "garbage", label: "Garbage Not Picked Up", icon: Trash2, color: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30" },
  { id: "unsafe", label: "Unsafe Area", icon: AlertTriangle, color: "bg-red-500/10 hover:bg-red-500/20 border-red-500/30" },
  { id: "neta_missing", label: "Neta Missing", icon: User, color: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30" },
  { id: "roads", label: "Roads Broken", icon: Car, color: "bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/30" },
];

export const CreateAlertDialog = ({
  open,
  onOpenChange,
  pincode,
  locationName,
}: CreateAlertDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a category and provide a title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit an alert",
          variant: "destructive",
        });
        return;
      }

      let imageUrl: string | null = null;

      // Upload image if present
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('alert-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('alert-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("area_alerts").insert({
        user_id: user.id,
        pincode,
        category: selectedCategory,
        title: title.trim(),
        description: description.trim(),
        location_name: locationName,
        upvotes: 1, // Creator automatically upvotes
        image_url: imageUrl,
      });

      if (error) throw error;

      toast({
        title: "Alert submitted",
        description: "Your area alert has been posted successfully",
      });

      // Reset form
      setSelectedCategory("");
      setTitle("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting alert:", error);
      toast({
        title: "Error",
        description: "Failed to submit alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Alert My Area
          </DialogTitle>
          <DialogDescription>
            Report an issue in your area to notify others
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>What's the issue? *</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedCategory === cat.id
                        ? `${cat.color} border-2`
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-medium block">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Short Title *</Label>
            <Input
              id="title"
              placeholder="e.g., No water in HSR Layout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Describe the issue (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Add a photo (optional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label 
                htmlFor="image" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload image</span>
                <span className="text-xs text-muted-foreground mt-1">Max 5MB</span>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Submitting..." : "Submit Alert"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
