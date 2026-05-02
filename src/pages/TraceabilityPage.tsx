/**
 * ISO 9001:2015 Traceability Live Page
 * 
 * PRODUCTION-READY: Uses live data resolver exclusively
 * All mock/fabricated data has been removed.
 * 
 * ISO 9001:2015 Clause 10.2 & 7.5.3 - Traceability
 */

import React, { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { TraceView } from "@/components/traceability/TraceView";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  GitBranch,
  Clock,
  Search,
  FileText,
  Shield,
} from "lucide-react";
import { useTraceabilityResolver } from "@/hooks/useTraceabilityResolver";
import CAPAEvidenceDashboard from "@/components/traceability/CAPAEvidenceDashboard";

export default function TraceabilityPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<"live" | "capa-evidence">("live");
  
  const {
    registry,
    record: rootRecord,
    isLoading,
    brokenLinks,
  } = useTraceabilityResolver(recordId || undefined);
  
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
    return points.slice(0, 20);
  }, [registry]);
  
  const handleOpenRecord = (id: string) => {
    navigate(`/record/${id}`);
  };
  
  const handleSelectChange = (value: string) => {
    navigate(`/traceability/${value}`);
  };
  
  const hasBrokenLinks = brokenLinks.length > 0;
  const relationshipCount = rootRecord?.relatedRecords?.length || 0;
  
  if (activeTab === "capa-evidence") {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/traceability" className="text-sm text-slate-500 hover:text-slate-700 flex items-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Traceability
              </Link>
            </div>
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
          </div>
        </div>
      </div>
    );
  }
  
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

        {/* Tab Selector */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "live"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Live Traceability
          </button>
          <button
            onClick={() => setActiveTab("capa-evidence")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "capa-evidence"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            CAPA Evidence
          </button>
        </div>

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
                  Live QMS Registry
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Traceability chains are built client-side from {`relatedRecords[]`} arrays.
                  ISO Clause 7.5.3 compliant — no custom TRC-XXXX IDs required.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}