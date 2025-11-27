import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      <h1 className="text-6xl font-display font-bold text-foreground tracking-tight animate-in fade-in duration-700">
        Meri Sarkar
      </h1>
    </div>
  );
};

export default Splash;
