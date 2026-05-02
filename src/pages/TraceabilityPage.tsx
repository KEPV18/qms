/**
 * ISO 9001:2015 Traceability Live Page
 * 
 * PRODUCTION-READY: Uses live data resolver
 * NO MOCK DATA in production builds
 * 
 * ISO 9001:2015 Clause 10.2 & 7.5.3 - Traceability
 */

import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { TraceView } from "@/components/traceability/TraceView";
import { RelationshipPicker } from "@/components/traceability/RelationshipPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  FileText,
  Clock,
  Search,
  Shield,
} from "lucide-react";
import { useTraceabilityResolver, useRecordSuggestions } from "@/hooks/useTraceabilityResolver";
import { type TraceableRecord } from "@/lib/traceability";
import CAPAEvidenceDashboard from "@/components/traceability/CAPAEvidenceDashboard";

// ============================================================================
// A. ENVIRONMENT CONFIGURATION
// ============================================================================

const IS_DEV = import.meta.env.DEV;

// ============================================================================
// B. MOCK DATA IMPORT (DEVELOPMENT ONLY)
// ============================================================================

let mockData: { registry: Map<string, TraceableRecord> } | null = null;

if (IS_DEV) {
  // Dynamic import to tree-shake in production
  import("@/data/traceabilityMock").then((mod) => {
    mockData = { registry: mod.ETH_CASE_REGISTRY };
  });
}

// ============================================================================
// C. MAIN COMPONENT
// ============================================================================

export default function TraceabilityPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("live");
  
  // Live data resolver
  const {
    registry: liveRegistry,
    record: liveRecord,
    chain: liveChain,
    isLoading,
    isError,
    brokenLinks,
  } = useTraceabilityResolver(recordId || undefined);
  
  // Determine which registry/record to use
  const useMock = IS_DEV && activeTab === "demo";
  const registry = useMock ? mockData?.registry || liveRegistry : liveRegistry;
  const rootRecord = useMock ? mockData?.registry.get(recordId || "F/09-001") || liveRecord : liveRecord;
  
  // Query for starting points
  const startingPoints = useMemo(() => {
    const points: { id: string; label: string; form: string }[] = [];
    registry.forEach((r) => {
      if (r.form === "F/09" || r.form === "F/22" || r.form === "Risk") {
        points.push({
          id: r.id,
          label: `${r.id}: ${r.title}`,
          form: r.form,
        });
      }
    });
    return points.slice(0, 20); // Limit to 20
  }, [registry]);
  
  const handleOpenRecord = (id: string) => {
    navigate(`/record/${id}`);
  };
  
  const handleSelectChange = (value: string) => {
    navigate(`/traceability/${value}`);
  };
  
  // Calculate stats
  const hasBrokenLinks = brokenLinks.length > 0;
  const relationshipCount = rootRecord?.relatedRecords?.length || 0;
  
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              to="/dashboard"
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">ISO 9001:2015 Traceability</h1>
                  <p className="text-slate-500">Relationship-Based Record Linking System</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                ISO Clause 7.5.3 Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>
        </div>

        {/* Data Source Tabs */}
        {IS_DEV && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="live">Live Data</TabsTrigger>
              <TabsTrigger value="demo">Demo (Mock)</TabsTrigger>
              <TabsTrigger value="capa-evidence">CAPA Evidence</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {/* CAPA Evidence Dashboard Tab */}
        {activeTab === "capa-evidence" && (
          <>
            <CAPAEvidenceDashboard />
            <Card className="mt-8 print:hidden">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <div>
                    <p>
                      <strong>ISO 9001:2015 Clause 10.2:</strong> CAPA effectiveness shall be verified before closure.
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      This dashboard tracks evidence (KPI improvement, audit closures, training completion, procedure updates)
                      required to verify corrective actions are effective.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        
        {/* Traceability Content (non-CAPA tabs) */}
        {activeTab !== "capa-evidence" && (
          <>
            {/* Record Selector */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <label className="text-sm font-medium text-slate-700">
                      Select Record:
                    </label>
                  </div>
                  <Select
                    value={recordId || ""}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="w-[500px]">
                      <SelectValue placeholder="Search for a record..." />
                    </SelectTrigger>
                    <SelectContent>
                      {startingPoints.map((point) => (
                        <SelectItem key={point.id} value={point.id}>
                          {point.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {isLoading && (
                    <div className="flex items-center text-slate-500">
                      <Clock className="w-4 h-4 animate-spin mr-2" />
                      Loading...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Panel */}
            {rootRecord ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500">Record ID</p>
                    <p className="text-2xl font-mono font-bold">{rootRecord.id}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="text-2xl font-bold">{rootRecord.status}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500">Linked Records</p>
                    <p className="text-2xl font-bold">{relationshipCount}</p>
                  </CardContent>
                </Card>
                
                <Card className={hasBrokenLinks ? "border-amber-400" : "border-green-400"}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500">Link Health</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{hasBrokenLinks ? brokenLinks.length : "✓"}</p>
                      <p className="text-sm">{hasBrokenLinks ? "Broken" : "Valid"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="mb-6">
                <CardContent className="pt-6 text-center py-12">
                  <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">No record selected</p>
                  <p className="text-sm text-slate-400 mt-2">
                    Select a record from the dropdown above to view its traceability chain
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Main Trace View */}
            {rootRecord && (
              <TraceView
                rootRecord={rootRecord}
                registry={registry}
                onOpenRecord={handleOpenRecord}
              />
            )}

            {/* Documentation */}
            <Card className="mt-8 print:hidden">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <p>
                      <strong>Data Source:</strong>{" "}
                      {activeTab === "demo" ? "Demo Mode (Mock Data)" : "Live QMS Registry"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Traceability chains are built client-side from {`relatedRecords[]`} arrays.
                      ISO Clause 7.5.3 compliant — no custom TRC-XXXX IDs required.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
