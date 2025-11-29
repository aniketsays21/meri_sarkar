import { AlertTriangle, CheckCircle2, Info, AlertCircle } from "lucide-react";

interface DailyUpdateProps {
  type: string;
  text: string;
  severity: 'positive' | 'warning' | 'alert' | 'info';
}

export const DailyUpdate = ({ type, text, severity }: DailyUpdateProps) => {
  const getIcon = () => {
    switch (severity) {
      case 'positive':
        return <CheckCircle2 className="text-green-500" size={18} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={18} />;
      case 'alert':
        return <AlertTriangle className="text-red-500" size={18} />;
      default:
        return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="flex items-start gap-2 py-2">
      <div className="mt-0.5">{getIcon()}</div>
      <p className="text-sm text-foreground flex-1">{text}</p>
    </div>
  );
};