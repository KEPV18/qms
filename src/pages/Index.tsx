import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AuditReadiness } from "@/components/dashboard/AuditReadiness";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  useQMSData,
  useModuleStats,
  useAuditSummary,
  useReviewSummary,
  useMonthlyComparison,
  useRecentActivity,
} from "@/hooks/useQMSData";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  Settings,
  ClipboardCheck,
  ShoppingCart,
  GraduationCap,
  Lightbulb,
  Building2,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const moduleIcons: Record<string, LucideIcon> = {
  sales: Users,
  operations: Settings,
  quality: ClipboardCheck,
  procurement: ShoppingCart,
  hr: GraduationCap,
  rnd: Lightbulb,
  management: Building2,
};

const moduleDescriptions: Record<string, { description: string; isoClause: string }> = {
  sales: {
    description: "Manage customer lifecycle from requirements capture to post-delivery feedback and satisfaction tracking.",
    isoClause: "Clause 8.2, 9.1.2",
  },
  operations: {
    description: "Plan, control, and execute operational activities with project timelines and resource scheduling.",
    isoClause: "Clause 8.1, 8.5",
  },
  quality: {
    description: "Core module for quality control, nonconformity handling, internal audits, and corrective actions.",
    isoClause: "Clause 9, 10",
  },
  procurement: {
    description: "Ensure all purchased items and vendors meet quality requirements with approval workflows.",
    isoClause: "Clause 8.4",
  },
  hr: {
    description: "Track personnel competence, training records, and performance appraisals.",
    isoClause: "Clause 7.2, 7.3",
  },
  rnd: {
    description: "Manage innovation, development requests, and technical validation processes.",
    isoClause: "Clause 8.3",
  },
  management: {
    description: "Control governance, documentation, KPI tracking, and leadership decisions.",
    isoClause: "Clause 5, 6, 7.5",
  },
};

import { PendingActions } from "@/components/dashboard/PendingActions";

export default function Index() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(localStorage.getItem('sidebarCollapsed') === 'true');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Listen for sidebar collapse changes
  useEffect(() => {
    const handleStorageChange = () => {
      setSidebarCollapsed(localStorage.getItem('sidebarCollapsed') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch live data from Google Sheets
  const { data: records, isLoading, isError, refetch, dataUpdatedAt } = useQMSData();

  // Derived data
  const moduleStats = useModuleStats(records);
  const auditSummary = useAuditSummary(records);
  const reviewSummary = useReviewSummary(records);
  const monthlyComparison = useMonthlyComparison(records);
  const activity = useRecentActivity(records);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["qms-data"] });
    refetch();
  };

  if (isError) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load QMS Data</h2>
          <p className="text-muted-foreground mb-4">Could not connect to Google Sheets data source.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const complianceRate = auditSummary?.complianceRate || 0;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
    : null;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ml-0",
        sidebarCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        <Header />

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Enhanced Page Header */}
            <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-xl p-6 mb-8 border border-border/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                    QMS Dashboard
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">
                    ISO 9001:2015 Quality Management System Overview
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {lastUpdated && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card/80 px-3 py-2 rounded-lg border">
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Last synced: {lastUpdated}</span>
                    </div>
                  )}
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    className="border-primary/20 hover:border-primary/40"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

           

          {/* Enhanced Status Cards Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">System Overview</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 animate-fade-in">
              <div onClick={() => navigate("/audit")} className="cursor-pointer group">
                <StatusCard
                  title="Form Templates"
                  value={auditSummary.total}
                  subtitle="Available forms"
                  icon={FileText}
                  isLoading={isLoading}
                />
              </div>
              <div onClick={() => navigate("/audit?tab=pending")} className="cursor-pointer group">
                <StatusCard
                  title="Filled Records"
                  value={records?.reduce((sum, r) => sum + (r.actualRecordCount || 0), 0) || 0}
                  subtitle="Files in Drive"
                  icon={CheckCircle}
                  variant="success"
                  trend={monthlyComparison.percentageChange > 0 ? {
                    value: monthlyComparison.percentageChange,
                    isPositive: monthlyComparison.isPositive,
                  } : undefined}
                  isLoading={isLoading}
                />
              </div>
              <div onClick={() => navigate("/audit")} className="cursor-pointer group">
                <StatusCard
                  title="Never Filled"
                  value={records?.filter(r => (r.actualRecordCount || 0) === 0).length || 0}
                  subtitle="Empty forms"
                  icon={AlertTriangle}
                  variant="warning"
                  isLoading={isLoading}
                />
              </div>
              <div onClick={() => navigate("/audit?tab=pending")} className="cursor-pointer group">
                <StatusCard
                  title="Pending Review"
                  value={reviewSummary.pending}
                  subtitle="Awaiting approval"
                  icon={Clock}
                  variant="warning"
                  isLoading={isLoading}
                />
              </div>
              <div onClick={() => navigate("/audit?tab=compliant")} className="cursor-pointer group">
                <StatusCard
                  title="Approved"
                  value={reviewSummary.completed}
                  subtitle="Reviewed & approved"
                  icon={CheckCircle}
                  variant="success"
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Enhanced Modules Grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-1">
                    Quality Management Modules
                  </h2>
                  <p className="text-muted-foreground">
                    Navigate through ISO 9001:2015 compliant system modules
                  </p>
                </div>
                {!isLoading && records && (
                  <div className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-full border">
                    {auditSummary.total} total forms
                  </div>
                )}
              </div>
              
              <div className="grid gap-4">
                {!isLoading &&
                  moduleStats.map((module) => {
                    const Icon = moduleIcons[module.id] || FileText;
                    const meta = moduleDescriptions[module.id] || {
                      description: "QMS module records and documentation.",
                      isoClause: "ISO 9001:2015",
                    };
   
                    return (
                      <div
                        key={module.id}
                        onClick={() => navigate(`/module/${module.id}`)}
                        className="cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      >
                        <ModuleCard
                          title={module.name}
                          description={meta.description}
                          icon={Icon}
                          moduleClass={`module-${module.id}`}
                          stats={{
                            formsCount: module.formsCount,
                            recordsCount: module.recordsCount,
                            pendingCount: module.pendingCount,
                            issuesCount: module.issuesCount,
                          }}
                          isoClause={meta.isoClause}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
              <div className="space-y-6">
                <QuickActions />
                <AuditReadiness
                  moduleStats={moduleStats}
                  complianceRate={auditSummary.complianceRate}
                  isLoading={isLoading}
                  onRefresh={handleRefresh}
                  emptyFormsCount={records?.filter(r => (r.actualRecordCount || 0) === 0).length || 0}
                />
                <PendingActions records={records ?? []} isLoading={isLoading} />
              </div>
            </div>
      </div>

      {/* Enhanced Recent Activity & Stats */}
          <div className="max-w-7xl mx-auto mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Activity & Insights</h2>
              <p className="text-muted-foreground">Recent system activity and review status overview</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentActivity records={activity} isLoading={isLoading} />
 
              {/* Enhanced Review Status */}
              <div className="bg-gradient-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">Review Status</h3>
                      <p className="text-sm text-muted-foreground">Document review completion overview</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                          <div className="h-6 w-12 bg-muted animate-pulse rounded" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20 cursor-pointer hover:bg-success/15 transition-all duration-200 group"
                        onClick={() => navigate("/audit?tab=compliant")}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Approved Records</div>
                            <div className="text-xs text-success/70">Reviewed and compliant</div>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-success">{reviewSummary.completed}</span>
                      </div>
                      
                      <div
                        className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/20 cursor-pointer hover:bg-warning/15 transition-all duration-200 group"
                        onClick={() => navigate("/audit?tab=pending")}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5 text-warning" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Pending Review</div>
                            <div className="text-xs text-warning/70">Awaiting approval</div>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-warning">{reviewSummary.pending}</span>
                      </div>
                      
                      <div
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/40 transition-all duration-200 group"
                        onClick={() => navigate("/audit")}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">Form Templates</div>
                            <div className="text-xs text-muted-foreground">Available forms</div>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-foreground">{auditSummary.total}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-5 border-t border-border/50 bg-gradient-to-r from-muted/30 to-accent/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">Monthly Activity</div>
                        <div className="text-xs text-muted-foreground">{monthlyComparison.currentMonth} updates this month</div>
                      </div>
                    </div>
                    {monthlyComparison.percentageChange > 0 && (
                      <div className={cn(
                        "flex items-center gap-1 text-sm font-semibold",
                        monthlyComparison.isPositive ? "text-success" : "text-destructive"
                      )}>
                        <span>{monthlyComparison.isPositive ? "↗" : "↘"}</span>
                        <span>{monthlyComparison.isPositive ? "+" : "-"}{monthlyComparison.percentageChange}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
