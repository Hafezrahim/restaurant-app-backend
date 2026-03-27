import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBg: string;
}

export const StatsCard = ({ title, value, change, changeType, icon: Icon, iconBg }: StatsCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-elevated transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              changeType === "positive" && "text-accent",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </span>
            <span className="text-xs text-muted-foreground">من الأمس</span>
          </div>
        </div>
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", iconBg)}>
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};
