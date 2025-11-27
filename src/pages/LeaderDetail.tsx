import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Share2,
  TrendingUp,
  Users,
  DollarSign,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
} from "lucide-react";

const LeaderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app this would come from API
  const leader = {
    id: 1,
    name: "Rajesh Kumar",
    position: "MP - Lok Sabha",
    party: "ABC Party",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    score: 8.5,
    attendance: 92,
    fundsUtilized: 78,
    questionsRaised: 145,
    constituency: "Mumbai North",
    education: "MBA, IIM Ahmedabad",
    age: 52,
    assets: "₹12.5 Cr",
    criminal: 0,
  };

  const promises = [
    {
      id: 1,
      text: "Build 5 new public schools in the constituency",
      status: "completed",
      progress: 100,
    },
    {
      id: 2,
      text: "Upgrade metro connectivity",
      status: "in-progress",
      progress: 65,
    },
    {
      id: 3,
      text: "Improve healthcare infrastructure",
      status: "in-progress",
      progress: 45,
    },
    {
      id: 4,
      text: "Reduce air pollution by 30%",
      status: "delayed",
      progress: 15,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-score-excellent";
    if (score >= 6.5) return "text-score-good";
    if (score >= 5) return "text-score-average";
    return "text-score-poor";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-score-excellent" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-score-average" />;
      case "delayed":
        return <AlertTriangle className="w-5 h-5 text-score-poor" />;
      default:
        return null;
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-8">
      {/* Header with Image */}
      <div className="relative">
        <div className="gradient-hero h-48 rounded-b-[2rem]" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
          <Share2 className="w-5 h-5" />
        </button>

        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <img
            src={leader.image}
            alt={leader.name}
            className="w-24 h-24 rounded-3xl bg-card border-4 border-card shadow-lg"
          />
        </div>
      </div>

      {/* Leader Info */}
      <div className="px-6 pt-16 text-center mb-6">
        <h1 className="text-2xl font-display font-bold mb-1">{leader.name}</h1>
        <p className="text-muted-foreground mb-2">{leader.position}</p>
        <div className="flex items-center justify-center gap-3">
          <Badge variant="secondary">{leader.party}</Badge>
          <div
            className={`px-4 py-1 rounded-full font-display font-bold text-lg bg-score-excellent text-white`}
          >
            {leader.score}/10
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mb-6">
        <Card className="p-5 shadow-card">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-display font-bold text-primary">
                {leader.attendance}%
              </p>
              <p className="text-xs text-muted-foreground">Attendance</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl font-display font-bold text-accent">
                {leader.fundsUtilized}%
              </p>
              <p className="text-xs text-muted-foreground">Funds</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-2xl font-display font-bold text-secondary">
                {leader.questionsRaised}
              </p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-score-excellent/10 flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6 text-score-excellent" />
              </div>
              <p className="text-2xl font-display font-bold text-score-excellent">
                {leader.criminal}
              </p>
              <p className="text-xs text-muted-foreground">Cases</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Background */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-display font-bold mb-3">Background</h2>
        <Card className="p-4 shadow-card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Education</p>
              <p className="font-medium">{leader.education}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Age</p>
              <p className="font-medium">{leader.age} years</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Assets</p>
              <p className="font-medium">{leader.assets}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Criminal Cases</p>
              <p className="font-medium text-score-excellent">
                {leader.criminal} cases
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Promise Tracker */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-display font-bold mb-3">Promise Tracker</h2>
        <div className="space-y-3">
          {promises.map((promise) => (
            <Card key={promise.id} className="p-4 shadow-card">
              <div className="flex items-start gap-3 mb-3">
                {getStatusIcon(promise.status)}
                <p className="flex-1 text-sm font-medium">{promise.text}</p>
              </div>
              <Progress value={promise.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {promise.progress}% complete
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() => navigate("/compare")}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Compare
        </Button>
        <Button className="h-12 rounded-xl gradient-primary">
          <Share2 className="w-4 h-4 mr-2" />
          Share Report Card
        </Button>
      </div>
    </div>
  );
};

export default LeaderDetail;
