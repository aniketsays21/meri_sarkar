import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Vote, MapPin, Phone, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = () => {
    if (phone.length === 10) {
      setStep(2);
    }
  };

  const handleOtpSubmit = () => {
    if (otp.length === 6) {
      setStep(3);
    }
  };

  const handleDetailsSubmit = () => {
    if (name && age && gender) {
      setStep(4);
    }
  };

  const handlePincodeSubmit = async () => {
    if (pincode.length !== 6) return;
    
    setLoading(true);
    try {
      // For now, we'll create an anonymous user session
      // In production, you'd use proper authentication with the phone/OTP
      const { data: { user }, error: authError } = await supabase.auth.signInAnonymously();
      
      if (authError) {
        toast.error("Failed to create session");
        console.error("Auth error:", authError);
        setLoading(false);
        return;
      }

      if (!user) {
        toast.error("No user created");
        setLoading(false);
        return;
      }

      // Save user profile to database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name,
          phone,
          age: parseInt(age),
          gender,
          pincode,
        });

      if (profileError) {
        toast.error("Failed to save profile");
        console.error("Profile error:", profileError);
        setLoading(false);
        return;
      }

      toast.success("Profile created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col">
      {/* Header */}
      <div className="gradient-hero p-6 pb-12 rounded-b-[2rem]">
        <div className="flex items-center justify-center gap-3 text-white mb-4">
          <Vote className="w-10 h-10" />
          <h1 className="text-3xl font-display font-bold">Neta Watch</h1>
        </div>
        <p className="text-white/90 text-center text-sm">
          Democracy in your pocket
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 py-6">
        {[1, 2, 3, 4].map((dot) => (
          <div
            key={dot}
            className={`h-2 rounded-full transition-smooth ${
              dot === step
                ? "w-8 bg-primary"
                : dot < step
                ? "w-2 bg-accent"
                : "w-2 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">
                Let's get started
              </h2>
              <p className="text-muted-foreground">
                Enter your phone number to continue
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  className="pl-12 h-14 text-lg rounded-2xl"
                />
              </div>

              <Button
                onClick={handlePhoneSubmit}
                disabled={phone.length !== 10}
                className="w-full h-14 text-lg rounded-2xl gradient-primary shadow-card-hover transition-smooth"
              >
                Send OTP
              </Button>
            </div>

            <div className="mt-8 p-4 bg-card rounded-2xl shadow-card">
              <p className="text-sm text-muted-foreground text-center">
                🔒 Your data is secure and never shared without your consent
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">
                Enter OTP
              </h2>
              <p className="text-muted-foreground">
                We've sent a code to {phone}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="h-14 text-center text-2xl tracking-widest rounded-2xl font-display"
              />

              <Button
                onClick={handleOtpSubmit}
                disabled={otp.length !== 6}
                className="w-full h-14 text-lg rounded-2xl gradient-primary shadow-card-hover transition-smooth"
              >
                Verify OTP
              </Button>

              <button className="w-full text-primary text-sm font-medium">
                Resend OTP
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">
                Tell us about yourself
              </h2>
              <p className="text-muted-foreground">
                Help us personalize your experience
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-2xl"
                />
              </div>

              <Input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="18"
                max="120"
                className="h-14 text-lg rounded-2xl"
              />

              <div className="space-y-3">
                <Label className="text-base text-foreground">Gender</Label>
                <RadioGroup value={gender} onValueChange={setGender}>
                  <div className="flex items-center space-x-3 p-4 rounded-2xl border border-input bg-background hover:bg-accent/5 transition-smooth">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="flex-1 cursor-pointer text-base">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-2xl border border-input bg-background hover:bg-accent/5 transition-smooth">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="flex-1 cursor-pointer text-base">
                      Female
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-2xl border border-input bg-background hover:bg-accent/5 transition-smooth">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="flex-1 cursor-pointer text-base">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                onClick={handleDetailsSubmit}
                disabled={!name || !age || !gender}
                className="w-full h-14 text-lg rounded-2xl gradient-primary shadow-card-hover transition-smooth"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right duration-300">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold mb-2">
                Where do you live?
              </h2>
              <p className="text-muted-foreground">
                This helps us find your leaders
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                  className="pl-12 h-14 text-lg rounded-2xl"
                />
              </div>

              <Button
                onClick={handlePincodeSubmit}
                disabled={pincode.length !== 6 || loading}
                className="w-full h-14 text-lg rounded-2xl gradient-primary shadow-card-hover transition-smooth"
              >
                {loading ? "Setting up..." : "Find My Leaders"}
              </Button>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Vote className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">
                    What you'll discover
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Meet your 5 leaders who control ₹250+ crores of your area's
                    budget. Track their work, hold them accountable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
