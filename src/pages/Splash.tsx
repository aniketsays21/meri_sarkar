import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Vote } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
          <Vote className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-display font-semibold text-foreground tracking-tight">
          Meri Sarkar
        </h1>
      </div>
    </div>
  );
};

export default Splash;
