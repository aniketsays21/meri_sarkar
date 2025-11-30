import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WardScore {
  id: string;
  ward: string;
  pincode: string;
  city: string;
  state: string;
  overall_score: number;
  rank: number;
  prev_rank: number;
  rank_change: number;
  cleanliness_score: number;
  water_score: number;
  roads_score: number;
  safety_score: number;
}

export default function WardComparison() {
  const navigate = useNavigate();
  const [allWards, setAllWards] = useState<WardScore[]>([]);
  const [selectedWards, setSelectedWards] = useState<WardScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWards();
  }, []);

  const fetchWards = async () => {
    const currentWeek = getWeekNumber(new Date());
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from("ward_weekly_scores")
      .select("*")
      .eq("week_number", currentWeek)
      .eq("year", currentYear)
      .order("rank", { ascending: true });

    if (error) {
      console.error("Error fetching wards:", error);
      toast({
        title: "Error",
        description: "Failed to load ward data",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setAllWards(data || []);
    setLoading(false);
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleWardSelect = (wardId: string) => {
    const ward = allWards.find(w => w.id === wardId);
    if (!ward) return;

    if (selectedWards.find(w => w.id === wardId)) {
      toast({
        title: "Already selected",
        description: "This ward is already in comparison",
      });
      return;
    }

    if (selectedWards.length >= 3) {
      toast({
        title: "Maximum reached",
        description: "You can compare up to 3 wards at a time",
      });
      return;
    }

    setSelectedWards([...selectedWards, ward]);
  };

  const removeWard = (wardId: string) => {
    setSelectedWards(selectedWards.filter(w => w.id !== wardId));
  };

  const getRankIcon = (rankChange: number) => {
    if (rankChange > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rankChange < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getBestInCategory = (category: 'cleanliness' | 'water' | 'roads' | 'safety') => {
    if (selectedWards.length === 0) return null;
    const field = `${category}_score`;
    return selectedWards.reduce((best, ward) => 
      (ward[field] || 0) > (best[field] || 0) ? ward : best
    );
  };

  const categories = [
    { key: 'cleanliness' as const, label: 'Cleanliness', icon: '🗑️' },
    { key: 'water' as const, label: 'Water Supply', icon: '💧' },
    { key: 'roads' as const, label: 'Roads', icon: '🚗' },
    { key: 'safety' as const, label: 'Safety', icon: '🛡️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate("/rankings")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">Ward Comparison</h1>
            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Wards to Compare (2-3)</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleWardSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a ward..." />
              </SelectTrigger>
              <SelectContent>
                {allWards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.ward} - Rank #{ward.rank} ({ward.overall_score}/100)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedWards.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedWards.map((ward) => (
              <Badge key={ward.id} variant="secondary" className="text-sm px-3 py-1">
                {ward.ward}
                <button
                  onClick={() => removeWard(ward.id)}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        {selectedWards.length >= 2 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Overall Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {selectedWards.map((ward) => (
                    <div key={ward.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{ward.ward}</h4>
                          <p className="text-sm text-muted-foreground">Rank #{ward.rank}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${getScoreColor(ward.overall_score)}`}>
                              {ward.overall_score}
                            </span>
                            {getRankIcon(ward.rank_change)}
                            {ward.rank_change !== 0 && (
                              <span className="text-sm">{Math.abs(ward.rank_change)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Progress value={ward.overall_score} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category-wise Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categories.map((category) => {
                    const best = getBestInCategory(category.key);
                    return (
                      <div key={category.key}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.label}
                        </h4>
                        <div className="space-y-3">
                          {selectedWards.map((ward) => {
                            const score = ward[`${category.key}_score`] || 0;
                            const isBest = best?.id === ward.id;
                            return (
                              <div key={ward.id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>{ward.ward}</span>
                                    {isBest && (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                  <span className={`font-semibold ${getScoreColor(score)}`}>
                                    {score}/100
                                  </span>
                                </div>
                                <Progress 
                                  value={score} 
                                  className={`h-2 ${isBest ? 'bg-green-100' : ''}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {categories.map((category) => {
                    const best = getBestInCategory(category.key);
                    if (!best) return null;
                    const score = best[`${category.key}_score`] || 0;
                    return (
                      <div key={category.key} className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>
                          <strong>{best.ward}</strong> leads in {category.label.toLowerCase()} 
                          with a score of <strong>{score}/100</strong>
                        </span>
                      </div>
                    );
                  })}
                  
                  {selectedWards.length > 0 && (
                    <>
                      <div className="flex items-start gap-2">
                        <span>📊</span>
                        <span>
                          Highest overall score: <strong>{Math.max(...selectedWards.map(w => w.overall_score))}/100</strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>📉</span>
                        <span>
                          Lowest overall score: <strong>{Math.min(...selectedWards.map(w => w.overall_score))}/100</strong>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {selectedWards.length < 2 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Select at least 2 wards to start comparing</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
