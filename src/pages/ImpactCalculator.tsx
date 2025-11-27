import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  TrendingUp,
  Heart,
  DollarSign,
  Home,
  Briefcase,
  GraduationCap,
  Users,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  benefit_amount: number | null;
  benefit_description: string | null;
  eligibility_criteria: any;
  how_to_apply: string | null;
  application_link: string | null;
  state: string | null;
  impact_score: number;
  departments: string[];
}

interface UserProfile {
  age: number | null;
  income: number | null;
  occupation: string | null;
  gender: string | null;
  marital_status: string | null;
  kids: number | null;
  pincode: string | null;
}

const ImpactCalculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matchedPolicies, setMatchedPolicies] = useState<Policy[]>([]);
  const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
  const [totalBenefit, setTotalBenefit] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to view personalized benefits",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("age, income, occupation, gender, marital_status, kids, pincode")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch all active policies
      const { data: policiesData, error: policiesError } = await supabase
        .from("policies_subsidies")
        .select("*")
        .eq("is_active", true)
        .order("impact_score", { ascending: false });

      if (policiesError) throw policiesError;
      setAllPolicies(policiesData || []);

      // Match policies with user profile
      const matched = matchPolicies(profileData, policiesData || []);
      setMatchedPolicies(matched);

      // Calculate total benefit
      const total = matched.reduce((sum, policy) => {
        return sum + (policy.benefit_amount || 0);
      }, 0);
      setTotalBenefit(total);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load your personalized benefits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const matchPolicies = (
    userProfile: UserProfile,
    policies: Policy[]
  ): Policy[] => {
    return policies.filter((policy) => {
      const criteria = policy.eligibility_criteria;
      if (!criteria) return false;

      // Check age
      if (criteria.min_age && userProfile.age && userProfile.age < criteria.min_age)
        return false;
      if (criteria.max_age && userProfile.age && userProfile.age > criteria.max_age)
        return false;

      // Check income
      if (
        criteria.min_income &&
        userProfile.income &&
        userProfile.income < criteria.min_income
      )
        return false;
      if (
        criteria.max_income &&
        userProfile.income &&
        userProfile.income > criteria.max_income
      )
        return false;

      // Check occupation
      if (
        criteria.occupation &&
        Array.isArray(criteria.occupation) &&
        userProfile.occupation
      ) {
        if (!criteria.occupation.includes(userProfile.occupation)) return false;
      }

      // Check gender
      if (criteria.gender && userProfile.gender) {
        if (criteria.gender !== userProfile.gender) return false;
      }

      // Check marital status
      if (
        criteria.marital_status &&
        Array.isArray(criteria.marital_status) &&
        userProfile.marital_status
      ) {
        if (
          !criteria.marital_status.includes(userProfile.marital_status) &&
          !criteria.marital_status.includes("any")
        )
          return false;
      }

      // Check kids
      if (criteria.kids && userProfile.kids !== null) {
        if (userProfile.kids < criteria.kids) return false;
      }

      return true;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "housing":
        return Home;
      case "healthcare":
        return Heart;
      case "finance":
      case "business":
        return DollarSign;
      case "education":
        return GraduationCap;
      case "agriculture":
        return Briefcase;
      default:
        return Users;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "housing":
        return "bg-blue-500/10 text-blue-600";
      case "healthcare":
        return "bg-red-500/10 text-red-600";
      case "finance":
      case "business":
        return "bg-green-500/10 text-green-600";
      case "education":
        return "bg-purple-500/10 text-purple-600";
      case "agriculture":
        return "bg-yellow-500/10 text-yellow-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Variable";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="mobile-container min-h-screen bg-background pb-8">
        <div className="px-6 pt-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mobile-container min-h-screen bg-background pb-8 flex items-center justify-center px-6">
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Complete Your Profile</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Please complete your profile to see personalized benefits
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold">Your Impact Calculator</h1>
            <p className="text-sm text-muted-foreground">
              Personalized benefits & schemes
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {/* Summary Card */}
        <Card className="p-6 gradient-primary text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Potential Benefits</p>
              <h2 className="text-3xl font-display font-bold">
                {formatCurrency(totalBenefit)}
              </h2>
            </div>
            <TrendingUp className="w-8 h-8 text-white/80" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-white/80 text-xs mb-1">Eligible For</p>
              <p className="text-2xl font-display font-bold">
                {matchedPolicies.length}
              </p>
              <p className="text-white/80 text-xs">schemes</p>
            </div>
            <div>
              <p className="text-white/80 text-xs mb-1">Match Rate</p>
              <p className="text-2xl font-display font-bold">
                {allPolicies.length > 0
                  ? Math.round((matchedPolicies.length / allPolicies.length) * 100)
                  : 0}
                %
              </p>
              <p className="text-white/80 text-xs">of all schemes</p>
            </div>
          </div>
        </Card>

        {/* Profile Summary */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Profile
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {profile.age && (
              <div>
                <span className="text-muted-foreground">Age:</span>
                <span className="ml-2 font-medium">{profile.age} years</span>
              </div>
            )}
            {profile.income && (
              <div>
                <span className="text-muted-foreground">Income:</span>
                <span className="ml-2 font-medium">
                  {formatCurrency(profile.income)}/year
                </span>
              </div>
            )}
            {profile.occupation && (
              <div>
                <span className="text-muted-foreground">Occupation:</span>
                <span className="ml-2 font-medium">{profile.occupation}</span>
              </div>
            )}
            {profile.marital_status && (
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 font-medium capitalize">
                  {profile.marital_status}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Matched Policies */}
        {matchedPolicies.length > 0 ? (
          <>
            <h2 className="text-lg font-display font-bold">
              Benefits You Qualify For
            </h2>
            <div className="space-y-4">
              {matchedPolicies.map((policy) => {
                const Icon = getCategoryIcon(policy.category);
                const colorClass = getCategoryColor(policy.category);

                return (
                  <Card key={policy.id} className="p-4 shadow-card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm leading-tight">
                            {policy.title}
                          </h3>
                          {policy.impact_score && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {policy.impact_score}% impact
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {policy.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {policy.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {policy.type}
                          </Badge>
                          {policy.state && (
                            <Badge variant="outline" className="text-xs">
                              {policy.state}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {policy.benefit_description && (
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold">Benefit</span>
                        </div>
                        <p className="text-sm">{policy.benefit_description}</p>
                        {policy.benefit_amount && (
                          <p className="text-lg font-display font-bold text-primary mt-1">
                            {formatCurrency(policy.benefit_amount)}
                          </p>
                        )}
                      </div>
                    )}

                    {policy.how_to_apply && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-secondary" />
                          <span className="text-xs font-semibold">How to Apply</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {policy.how_to_apply}
                        </p>
                      </div>
                    )}

                    {policy.application_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(policy.application_link!, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Matches Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't find any schemes matching your current profile. Try
              updating your profile information or check back later.
            </p>
            <Button onClick={() => navigate("/dashboard")}>Update Profile</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImpactCalculator;
