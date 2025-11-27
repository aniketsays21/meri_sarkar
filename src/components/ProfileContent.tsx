import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Phone, Briefcase, Heart, Baby, IndianRupee, LogOut, Edit } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export const ProfileContent = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/onboarding");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
      navigate("/onboarding");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile?.name || "User"}</h2>
              <p className="text-sm text-gray-600">Active Citizen</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Edit className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-3">
          {profile?.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{profile.phone}</p>
              </div>
            </div>
          )}
          {profile?.pincode && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Pincode</p>
                <p className="text-sm text-gray-900">{profile.pincode}</p>
              </div>
            </div>
          )}
          {profile?.constituency && (
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Constituency</p>
                <p className="text-sm text-gray-900">{profile.constituency}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Details */}
      {(profile?.age || profile?.gender || profile?.occupation || profile?.marital_status) && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Additional Details</h3>
          <div className="grid grid-cols-2 gap-4">
            {profile?.age && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="text-sm text-gray-900">{profile.age} years</p>
                </div>
              </div>
            )}
            {profile?.gender && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm text-gray-900">{profile.gender}</p>
                </div>
              </div>
            )}
            {profile?.occupation && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Occupation</p>
                  <p className="text-sm text-gray-900">{profile.occupation}</p>
                </div>
              </div>
            )}
            {profile?.marital_status && (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Marital Status</p>
                  <p className="text-sm text-gray-900">{profile.marital_status}</p>
                </div>
              </div>
            )}
            {profile?.kids !== null && (
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Children</p>
                  <p className="text-sm text-gray-900">{profile.kids}</p>
                </div>
              </div>
            )}
            {profile?.income && (
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Annual Income</p>
                  <p className="text-sm text-gray-900">₹{profile.income.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <Button 
        onClick={handleLogout}
        variant="outline"
        className="w-full flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
};
