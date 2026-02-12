import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  moduleClass: string;
  stats: {
    formsCount: number;
    recordsCount: number;
    pendingCount: number;
    issuesCount: number;
  };
  isoClause: string;
  isLoading?: boolean;
}

export function ModuleCard({
  title,
  description,
  icon: Icon,
  moduleClass,
  stats,
  isoClause,
  isLoading = false,
}: ModuleCardProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border border-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-primary/30 hover:scale-[1.02]",
        moduleClass
      )}
    >
      {/* Enhanced Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm">
            <Icon className="w-7 h-7 text-foreground group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground font-medium">{isoClause}</p>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Enhanced Description */}
      <p className="text-base text-muted-foreground mb-6 leading-relaxed">
        {description}
      </p>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-2 gap-4 pt-5 border-t border-border/50">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-foreground mb-1">{stats.formsCount}</div>
          <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Forms</div>
        </div>
        <div className="bg-success/5 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-success mb-1">{stats.recordsCount}</div>
          <div className="text-xs text-success/70 font-semibold uppercase tracking-wide">Records</div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center gap-3 mt-4">
        {stats.pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-warning/10 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-xs font-bold text-warning">{stats.pendingCount} Pending</span>
          </div>
        )}
        {stats.issuesCount > 0 && (
          <div className="flex items-center gap-2 bg-destructive/10 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-xs font-bold text-destructive">{stats.issuesCount} Issues</span>
          </div>
        )}
        {stats.pendingCount === 0 && stats.issuesCount === 0 && (
          <div className="flex items-center gap-2 bg-success/10 rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs font-bold text-success">All Clear</span>
          </div>
        )}
      </div>
    </div>
  );
}
