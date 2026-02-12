import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "destructive";
  isLoading?: boolean;
}

export function StatusCard({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  trend,
  variant = "default",
  isLoading = false,
}: StatusCardProps) {
  const variantStyles = {
    default: "bg-card border-border",
    success: "bg-success/5 border-success/20",
    warning: "bg-warning/5 border-warning/20",
    destructive: "bg-destructive/5 border-destructive/20",
  };

  const iconStyles = {
    default: "bg-muted text-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  if (isLoading) {
    return (
      <div className={cn(
        "rounded-lg border p-5 transition-all duration-200",
        variantStyles[variant]
      )}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border p-6 transition-all duration-300 hover:shadow-md hover:border-primary/30 group-hover:scale-105",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground tracking-wide">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground/80 font-medium">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-2 mt-3 text-sm font-semibold",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              <span className="flex items-center gap-1">
                <span className="text-lg">{trend.isPositive ? "↗" : "↘"}</span>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground/70 text-xs font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
          iconStyles[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
