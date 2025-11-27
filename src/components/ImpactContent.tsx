import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Heart,
  Home,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export const ImpactContent = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Home,
      title: "Housing Schemes",
      description: "Find subsidies for home purchase or construction",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Heart,
      title: "Healthcare Benefits",
      description: "Discover health insurance and medical schemes",
      color: "bg-red-500/10 text-red-600",
    },
    {
      icon: DollarSign,
      title: "Financial Support",
      description: "Access loans, pensions, and savings schemes",
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: GraduationCap,
      title: "Education Programs",
      description: "Get scholarships and education support",
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Personalized Impact Calculator
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Find out which government policies and subsidies you're eligible for
              based on your age, income, location, and occupation.
            </p>
            <Button
              onClick={() => navigate("/impact-calculator")}
              className="w-full gradient-primary"
            >
              Calculate My Benefits
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Card
              key={index}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate("/impact-calculator")}
            >
              <div
                className={`w-10 h-10 rounded-lg ${benefit.color} flex items-center justify-center mb-3`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
              <p className="text-xs text-muted-foreground leading-tight">
                {benefit.description}
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-sm mb-1 text-gray-900">
              Why Use the Calculator?
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Discover hidden benefits you might be missing</li>
              <li>• See exact eligibility requirements</li>
              <li>• Get direct links to application portals</li>
              <li>• Understand your potential savings</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
