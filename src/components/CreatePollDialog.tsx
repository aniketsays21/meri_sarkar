import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onCreated: () => void;
}

export const CreatePollDialog = ({
  open,
  onOpenChange,
  userId,
  onCreated,
}: CreatePollDialogProps) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    if (!userId) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to create a poll",
        variant: "destructive",
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question for your poll",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter(o => o.trim());
    if (validOptions.length < 2) {
      toast({
        title: "Options required",
        description: "Please add at least 2 options",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const pollOptions = validOptions.map(text => ({ text: text.trim(), votes: 0 }));
      
      const { error } = await supabase.from("polls").insert({
        question: question.trim(),
        options: pollOptions,
        created_by: userId,
        category: "local",
        ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

      if (error) throw error;

      toast({
        title: "Poll created!",
        description: "Your poll is now live",
      });

      setQuestion("");
      setOptions(["", ""]);
      onOpenChange(false);
      onCreated();
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create Poll</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="What do you want to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${idx + 1}`}
                  value={option}
                  onChange={(e) => updateOption(idx, e.target.value)}
                  maxLength={100}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(idx)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 4 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            )}
          </div>

          <Button
            onClick={handleCreate}
            disabled={loading || !question.trim() || options.filter(o => o.trim()).length < 2}
            className="w-full gradient-primary text-primary-foreground"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Poll"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
