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
        "bg-card rounded-lg border border-border p-5 hover:shadow-md transition-all duration-200 cursor-pointer group",
        moduleClass
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{isoClause}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      {/* Stats */}
      <div className="flex flex-col gap-2 pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-foreground">{stats.formsCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Forms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-success">{stats.recordsCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Records</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {stats.pendingCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-warning" />
              <span className="text-xs text-warning font-bold">{stats.pendingCount}</span>
              <span className="text-[10px] text-muted-foreground">Pending</span>
            </div>
          )}
          {stats.issuesCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
              <span className="text-xs text-destructive font-bold">{stats.issuesCount}</span>
              <span className="text-[10px] text-muted-foreground">Issues</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
