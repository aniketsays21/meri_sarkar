import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Vote,
  Building2,
  Twitter,
  Facebook,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface LeaderData {
  id: string;
  name: string;
  designation: string;
  party: string | null;
  constituency: string | null;
  state: string | null;
  image_url: string | null;
  bio: string | null;
  education: string | any[] | null;
  current_work: string | null;
  attendance: number | null;
  funds_utilized: number | null;
  total_funds_allocated: number | null;
  questions_raised: number | null;
  bills_passed: number | null;
  assets: number | null;
  office_email: string | null;
  office_phone: string | null;
  office_address: string | null;
  professional_history: any;
  election_history: any;
  ongoing_projects: any;
  completed_projects: any;
  social_media: any;
}

const LeaderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leader, setLeader] = useState<LeaderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchLeaderDetail();
  }, [id]);

  const fetchLeaderDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("leaders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setLeader(data);
    } catch (error) {
      console.error("Error fetching leader:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mobile-container min-h-screen bg-background pb-8">
        <div className="relative">
          <Skeleton className="h-48 rounded-b-[2rem]" />
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <Skeleton className="w-24 h-24 rounded-3xl" />
          </div>
        </div>
        <div className="px-6 pt-16 space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="mobile-container min-h-screen bg-background pb-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Leader not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const calculateScore = () => {
    const attendance = leader.attendance || 0;
    const funds = leader.funds_utilized || 0;
    const questions = Math.min((leader.questions_raised || 0) / 10, 100);
    return ((attendance + funds + questions) / 30).toFixed(1);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "₹0";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusIcon = (progress: number) => {
    if (progress === 100) return <CheckCircle2 className="w-5 h-5 text-score-excellent" />;
    if (progress >= 50) return <Clock className="w-5 h-5 text-score-average" />;
    return <AlertTriangle className="w-5 h-5 text-score-poor" />;
  };

  const score = parseFloat(calculateScore());

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
            src={leader.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.name}`}
            alt={leader.name}
            className="w-24 h-24 rounded-3xl bg-card border-4 border-card shadow-lg"
          />
        </div>
      </div>

      {/* Leader Info */}
      <div className="px-6 pt-16 text-center mb-6">
        <h1 className="text-2xl font-display font-bold mb-1">{leader.name}</h1>
        <p className="text-muted-foreground mb-2">{leader.designation}</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {leader.party && <Badge variant="secondary">{leader.party}</Badge>}
          {leader.constituency && (
            <Badge variant="outline">{leader.constituency}</Badge>
          )}
          <div className="px-4 py-1 rounded-full font-display font-bold text-lg bg-score-excellent text-white">
            {score}/10
          </div>
        </div>
      </div>

      {/* About Section */}
      {leader.bio && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-display font-bold mb-3">About</h2>
          <Card className="p-4 shadow-card">
            <p className="text-sm leading-relaxed">{leader.bio}</p>
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      <div className="px-6 mb-6">
        <Card className="p-5 shadow-card">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-display font-bold text-primary">
                {leader.attendance || 0}%
              </p>
              <p className="text-xs text-muted-foreground">Attendance</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-accent" />
              </div>
              <p className="text-2xl font-display font-bold text-accent">
                {leader.funds_utilized || 0}%
              </p>
              <p className="text-xs text-muted-foreground">Funds Used</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Contact & Connect */}
      {(leader.office_email || leader.office_phone || leader.office_address) && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-display font-bold mb-3">Contact & Connect</h2>
          <Card className="p-4 shadow-card space-y-3">
            {leader.office_email && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Office Email</p>
                  <p className="text-sm font-medium break-all">{leader.office_email}</p>
                </div>
              </div>
            )}
            {leader.office_phone && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Office Phone</p>
                  <p className="text-sm font-medium">{leader.office_phone}</p>
                </div>
              </div>
            )}
            {leader.office_address && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Office Address</p>
                  <p className="text-sm font-medium">{leader.office_address}</p>
                </div>
              </div>
            )}
            {leader.social_media && Object.keys(leader.social_media).length > 0 && (
              <div className="pt-3 border-t flex gap-2 flex-wrap">
                {leader.social_media.twitter && (
                  <a
                    href={`https://twitter.com/${leader.social_media.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-xs font-medium">{leader.social_media.twitter}</span>
                  </a>
                )}
                {leader.social_media.facebook && (
                  <a
                    href={`https://facebook.com/${leader.social_media.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                    <span className="text-xs font-medium">Facebook</span>
                  </a>
                )}
                {leader.social_media.website && (
                  <a
                    href={`https://${leader.social_media.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-medium">Website</span>
                  </a>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Professional History */}
      {leader.professional_history && Array.isArray(leader.professional_history) && leader.professional_history.length > 0 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Professional History
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[0.875rem] top-2 bottom-2 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {leader.professional_history.map((position: any, index: number) => {
                const isExpanded = expandedItems.has(index);
                const hasDetails = position.achievements || position.responsibilities || position.description;
                
                return (
                  <div key={index} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-base mb-1.5 leading-tight">
                            {position.designation || position.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2.5">
                            {position.government || position.organization}
                          </p>
                          <div className="inline-block px-3 py-1.5 rounded-md bg-primary/10">
                            <p className="text-sm font-semibold text-primary">
                              {position.start_year} - {position.end_year || "Present"}
                            </p>
                          </div>
                        </div>
                        
                        {hasDetails && (
                          <button
                            onClick={() => toggleExpand(index)}
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Expandable content */}
                      {hasDetails && isExpanded && (
                        <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                          {position.description && (
                            <div className="p-3 rounded-lg bg-muted/50">
                              <p className="text-sm text-foreground">{position.description}</p>
                            </div>
                          )}
                          
                          {position.achievements && Array.isArray(position.achievements) && position.achievements.length > 0 && (
                            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                              <h4 className="font-semibold text-sm mb-2 text-accent">Key Achievements</h4>
                              <ul className="space-y-1.5">
                                {position.achievements.map((achievement: string, i: number) => (
                                  <li key={i} className="text-sm text-foreground flex gap-2">
                                    <span className="text-accent mt-0.5">•</span>
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {position.responsibilities && Array.isArray(position.responsibilities) && position.responsibilities.length > 0 && (
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <h4 className="font-semibold text-sm mb-2 text-primary">Key Responsibilities</h4>
                              <ul className="space-y-1.5">
                                {position.responsibilities.map((responsibility: string, i: number) => (
                                  <li key={i} className="text-sm text-foreground flex gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>{responsibility}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Educational Background */}
      {leader.education && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Educational Background
          </h2>
          <Card className="p-4 shadow-card">
            {typeof leader.education === 'string' ? (
              <p className="text-sm leading-relaxed">{leader.education}</p>
            ) : Array.isArray(leader.education) && leader.education.length > 0 ? (
              <div className="space-y-4">
                {leader.education.map((edu: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{edu.degree}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{edu.university}</p>
                      <p className="text-xs text-primary mt-1">
                        {edu.start_year} - {edu.end_year || "Present"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{JSON.stringify(leader.education)}</p>
            )}
          </Card>
        </div>
      )}

      {/* Election Track Record */}
      {leader.election_history && Array.isArray(leader.election_history) && leader.election_history.length > 0 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Election Track Record
          </h2>
          <div className="space-y-3">
            {leader.election_history.map((election: any, index: number) => (
              <Card key={index} className="p-4 shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{election.constituency}</h3>
                    <p className="text-xs text-muted-foreground">Year: {election.year}</p>
                  </div>
                  <Badge variant={election.result === "Won" ? "default" : "secondary"}>
                    {election.result}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Votes Received</p>
                    <p className="text-sm font-semibold">{election.votes_received.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Votes</p>
                    <p className="text-sm font-semibold">{election.total_votes.toLocaleString()}</p>
                  </div>
                </div>
                <Progress 
                  value={(election.votes_received / election.total_votes) * 100} 
                  className="h-2 mt-2"
                />
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ongoing Projects */}
      {leader.ongoing_projects && Array.isArray(leader.ongoing_projects) && leader.ongoing_projects.length > 0 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-display font-bold mb-3">Ongoing Projects</h2>
          <div className="space-y-3">
            {leader.ongoing_projects.map((project: any, index: number) => (
              <Card key={index} className="p-4 shadow-card">
                <div className="flex items-start gap-3 mb-3">
                  {getStatusIcon(project.progress)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{project.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{project.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Started: {new Date(project.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Progress value={project.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {project.progress}% complete
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Projects */}
      {leader.completed_projects && Array.isArray(leader.completed_projects) && leader.completed_projects.length > 0 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-display font-bold mb-3">Completed Projects</h2>
          <div className="space-y-3">
            {leader.completed_projects.map((project: any, index: number) => (
              <Card key={index} className="p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-score-excellent flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{project.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{project.description}</p>
                    <p className="text-xs text-score-excellent">
                      Completed: {new Date(project.completion_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Funds Utilization */}
      {leader.total_funds_allocated && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-display font-bold mb-3">Funds Utilization</h2>
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Allocated</p>
                <p className="text-lg font-display font-bold">{formatCurrency(leader.total_funds_allocated)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Utilized</p>
                <p className="text-lg font-display font-bold text-accent">
                  {formatCurrency(leader.total_funds_allocated * ((leader.funds_utilized || 0) / 100))}
                </p>
              </div>
            </div>
            <Progress value={leader.funds_utilized || 0} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {leader.funds_utilized || 0}% of allocated funds utilized
            </p>
          </Card>
        </div>
      )}

      {/* Background Info */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-display font-bold mb-3">Additional Information</h2>
        <Card className="p-4 shadow-card">
          <div className="grid grid-cols-2 gap-4">
            {leader.assets && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Assets</p>
                <p className="font-semibold">{formatCurrency(leader.assets)}</p>
              </div>
            )}
            {leader.bills_passed !== null && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bills Passed</p>
                <p className="font-semibold">{leader.bills_passed}</p>
              </div>
            )}
            {leader.current_work && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Current Work</p>
                <p className="text-sm">{leader.current_work}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-6">
        <Button
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button className="h-12 rounded-xl gradient-primary">
          <Share2 className="w-4 h-4 mr-2" />
          Share Profile
        </Button>
      </div>
    </div>
  );
};

export default LeaderDetail;
