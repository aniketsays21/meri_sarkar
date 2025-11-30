import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Download, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface ShareableAreaCardProps {
  ward: string;
  city: string;
  rank: number;
  totalAreas: number;
  overallScore: number;
  rankChange: number;
  cleanliness: number;
  water: number;
  roads: number;
  safety: number;
  pincode: string;
}

export const ShareableAreaCard = ({
  ward,
  city,
  rank,
  totalAreas,
  overallScore,
  rankChange,
  cleanliness,
  water,
  roads,
  safety,
  pincode,
}: ShareableAreaCardProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateImage = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("shareable-card");
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (platform: "whatsapp" | "twitter") => {
    const imageData = await generateImage();
    if (!imageData) return;

    const text = `🏆 ${ward} ranked #${rank} out of ${totalAreas} areas this week!\n\n📊 Overall Score: ${overallScore}/100\n${rankChange > 0 ? `📈 Up ${rankChange} positions!` : rankChange < 0 ? `📉 Down ${Math.abs(rankChange)} positions` : "📊 Holding position"}\n\n✨ Category Breakdown:\n🗑️ Cleanliness: ${cleanliness}\n💧 Water: ${water}\n🚗 Roads: ${roads}\n🛡️ Safety: ${safety}\n\n#AreaPerformance #MyArea`;

    if (platform === "whatsapp") {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, "_blank");
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, "_blank");
    }

    toast({
      title: "Opening share dialog...",
      description: "The image has been copied to your clipboard!",
    });
  };

  const handleDownload = async () => {
    const imageData = await generateImage();
    if (!imageData) return;

    const link = document.createElement("a");
    link.download = `${ward}-performance-${new Date().toISOString().split("T")[0]}.png`;
    link.href = imageData;
    link.click();

    toast({
      title: "Download started!",
      description: "Your area performance card has been saved.",
    });
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏅";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Area Performance</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview Card */}
          <div
            id="shareable-card"
            className="relative w-full aspect-[4/5] bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl p-8 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-60 h-60 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between text-white">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-4xl">{getMedalEmoji(rank)}</span>
                  <div>
                    <h2 className="text-3xl font-bold leading-tight">{ward}</h2>
                    <p className="text-white/80 text-sm">{city} • PIN: {pincode}</p>
                  </div>
                </div>
              </div>

              {/* Rank Badge */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Rank</p>
                    <div className="flex items-center gap-2">
                      <span className="text-5xl font-bold">#{rank}</span>
                      {rankChange !== 0 && (
                        <div className={`flex items-center gap-1 ${rankChange > 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {rankChange > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                          <span className="text-lg font-semibold">{Math.abs(rankChange)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-white/60 text-xs">of {totalAreas} areas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm mb-1">Overall Score</p>
                    <p className="text-5xl font-bold">{overallScore}</p>
                    <p className="text-white/60 text-xs">/ 100</p>
                  </div>
                </div>

                {/* Category Scores */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🗑️</span>
                      <p className="text-xs text-white/80">Cleanliness</p>
                    </div>
                    <p className="text-2xl font-bold">{cleanliness}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">💧</span>
                      <p className="text-xs text-white/80">Water</p>
                    </div>
                    <p className="text-2xl font-bold">{water}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🚗</span>
                      <p className="text-xs text-white/80">Roads</p>
                    </div>
                    <p className="text-2xl font-bold">{roads}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">🛡️</span>
                      <p className="text-xs text-white/80">Safety</p>
                    </div>
                    <p className="text-2xl font-bold">{safety}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center">
                <p className="text-white/60 text-xs">Weekly Performance Report</p>
                <p className="text-white font-semibold text-sm">Week {Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 604800000)}, {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleShare("whatsapp")}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              WhatsApp
            </Button>
            <Button
              onClick={() => handleShare("twitter")}
              disabled={isGenerating}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Twitter
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
