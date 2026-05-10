/**
 * KPI Review Page - HR ONLY ACCESS
 * 
 * ⚠️ RESTRICTED ACCESS: This page is intended for HR Department use only.
 * 
 * BUSINESS RULE:
 * - QMS Team: Defines KPIs and monitors trends via public dashboards
 * - HR Department: SOLE authority for entering actual performance data
 * - System: Calculates variance/status automatically from HR-provided actuals
 * 
 * WHY HIDDEN FROM NAVIGATION:
 * - Actual KPI values are HR data, not QMS team responsibility
 * - QMS team should not see or enter employee performance scores
 * - HR enters data → System calculates → QMS monitors trends
 * 
 * ACCESS METHOD:
 * - Direct URL only: /kpi/review (bookmark for HR)
 * - No navigation link in TopNav (removed per request)
 * 
 * ISO 9001:2015 Alignment:
 * - Clause 7.2: HR ensures competent personnel enter data
 * - Clause 9.1.1: System monitors KPIs (actuals from HR source of truth)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Link as LinkIcon,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Activity,
  Target,
}
from 'lucide-react';
import {
  OperationalKPI,
  KPIActualRecord,
  KPIManagementReview,
  getKPIsRequiringAttention,
  getKPISummary,
  getKPIsByCategory,
  addKPIActual,
  linkCAPAToKPI,
  addKPIReviewEntry,
  loadKPIsFromStorage,
}
from '@/data/operationalKPIData';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// ============================================================================
// ALERT COMPONENT
// ============================================================================

const KPIAlertPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<{ critical: OperationalKPI[]; warning: OperationalKPI[] }>({ critical: [], warning: [] });
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    const attention = getKPIsRequiringAttention();
    setAlerts(attention);
  }, []);
  
  const totalAlerts = alerts.critical.length + alerts.warning.length;
  if (totalAlerts === 0) return null;
  
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-destructive mr-2" />
          <span className="font-semibold text-destructive">
            {alerts.critical.length > 0 ? `${alerts.critical.length} Critical ` : ''}
            {alerts.warning.length > 0 ? `${alerts.warning.length} Warning ` : ''}
            KPI{totalAlerts > 1 ? 's' : ''} Requiring Attention
          </span>
        </div>
        <span className="text-sm text-destructive">{expanded ? '▲' : '▼'}</span>
      </div>
      
      {expanded && (
        <div className="mt-3 space-y-2">
          {alerts.critical.map(kpi => (
            <div key={kpi.id} className="bg-red-500/10 rounded p-3 flex justify-between items-center">
              <div>
                <span className="font-medium text-foreground">{kpi.name}</span>
                <span className="text-sm text-muted-foreground ml-2">Variance: {kpi.currentVariance.toFixed(1)}%</span>
              </div>
              <Button variant="link" size="sm" className="text-sm text-destructive">Initiate CAPA</Button>
            </div>
          ))}
          {alerts.warning.map(kpi => (
            <div key={kpi.id} className="bg-yellow-500/10 dark:bg-yellow-500/20 rounded p-3 flex justify-between items-center">
              <div>
                <span className="font-medium text-foreground">{kpi.name}</span>
                <span className="text-sm text-muted-foreground ml-2">Variance: {kpi.currentVariance.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

interface KPICardProps {
  kpi: OperationalKPI;
  onRecordActual: (kpi: OperationalKPI) => void;
  onLinkCAPA: (kpi: OperationalKPI) => void;
  onAddReview: (kpi: OperationalKPI) => void;
}

const KPICard: React.FC<KPICardProps> = ({ kpi, onRecordActual, onLinkCAPA, onAddReview }) => {
  const [showHistory, setShowHistory] = useState(false);
  
  const statusBadge = {
    "on-track": { color: "bg-green-500/10 text-green-600 dark:text-green-400", icon: CheckCircle, label: "On Track" },
    "warning": { color: "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400", icon: AlertTriangle, label: "Warning" },
    "critical": { color: "bg-red-500/10 text-destructive", icon: AlertCircle, label: "Critical" },
  }[kpi.currentStatus];
  
  const StatusIcon = statusBadge.icon;
  
  const latestActual = kpi.actuals[kpi.actuals.length - 1];
  
  return (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{kpi.category}</div>
          <h3 className="font-semibold text-lg text-foreground">{kpi.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{kpi.description}</p>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusBadge.label}
        </div>
      </div>
      
      {/* Current Performance */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-primary/10 rounded p-3">
          <div className="text-xs text-primary flex items-center">
            <Target className="h-3 w-3 mr-1" /> Target
          </div>
          <div className="text-lg font-bold text-foreground">{kpi.target}{kpi.unit}</div>
        </div>
        <div className="bg-muted/50 rounded p-3">
          <div className="text-xs text-muted-foreground flex items-center">
            <Activity className="h-3 w-3 mr-1" /> Current
          </div>
          <div className={`text-lg font-bold ${latestActual ? (latestActual.status === 'critical' ? 'text-destructive' : latestActual.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400') : 'text-muted-foreground'}`}>
            {latestActual ? `${latestActual.value}${kpi.unit}` : '—'}
          </div>
        </div>
        <div className="bg-muted/50 rounded p-3">
          <div className="text-xs text-muted-foreground flex items-center">
            <TrendingDown className="h-3 w-3 mr-1" /> Variance
          </div>
          <div className={`text-lg font-bold ${kpi.currentStatus === 'critical' ? 'text-destructive' : kpi.currentStatus === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
            {kpi.currentVariance !== 0 ? `${kpi.currentVariance > 0 ? '+' : ''}${kpi.currentVariance.toFixed(1)}%` : '—'}
          </div>
        </div>
      </div>
      
      {/* Last Recorded */}
      {latestActual && (
        <div className="text-xs text-muted-foreground mb-3 flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          Last recorded: {latestActual.period} by {latestActual.enteredBy}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => onRecordActual(kpi)}
          className="flex-1"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> Record Actual
        </Button>
        <Button
          onClick={() => onLinkCAPA(kpi)}
          variant={kpi.linkedCAPAs.length > 0 ? "secondary" : "outline"}
          size="sm"
          className={kpi.linkedCAPAs.length > 0 ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20" : ""}
        >
          <LinkIcon className="h-4 w-4" />
          {kpi.linkedCAPAs.length > 0 && <span className="ml-1">{kpi.linkedCAPAs.length}</span>}
        </Button>
        <Button
          onClick={() => onAddReview(kpi)}
          variant="outline"
          size="sm"
        >
          <FileText className="h-4 w-4" />
          {kpi.reviewHistory.length > 0 && <span className="ml-1">{kpi.reviewHistory.length}</span>}
        </Button>
      </div>
      
      {/* History Toggle */}
      {kpi.actuals.length > 0 && (
        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="link"
          size="sm"
          className="mt-3"
        >
          {showHistory ? 'Hide' : 'Show'} History ({kpi.actuals.length} records)
        </Button>
      )}
      
      {/* History Table */}
      {showHistory && kpi.actuals.length > 0 && (
        <div className="mt-3 border-t pt-3 border-border">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="text-left py-1">Period</th>
                <th className="text-right py-1">Actual</th>
                <th className="text-right py-1">Target</th>
                <th className="text-right py-1">Variance</th>
                <th className="text-center py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...kpi.actuals].reverse().map((record, idx) => (
                <tr key={idx} className="border-b last:border-b-0 border-border">
                  <td className="py-1 text-muted-foreground">{record.period}</td>
                  <td className="text-right text-foreground">{record.value}{kpi.unit}</td>
                  <td className="text-right text-foreground">{record.target}{kpi.unit}</td>
                  <td className={`text-right ${record.variance < 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}>
                    {record.variance > 0 ? '+' : ''}{record.variance.toFixed(1)}%
                  </td>
                  <td className="text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${record.status === 'on-track' ? 'bg-green-500' : record.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MODAL COMPONENTS (using shadcn Dialog)
// ============================================================================

const RecordActualModal: React.FC<{
  kpi: OperationalKPI;
  onClose: () => void;
  onSave: (kpiId: string, period: string, value: number) => void;
}> = ({ kpi, onClose, onSave }) => {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [value, setValue] = useState(kpi.target.toString());
  
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Actual for {kpi.name}</DialogTitle>
          <DialogDescription>
            Enter the actual KPI value for the selected period.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Period</label>
            <Input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Actual Value ({kpi.unit}) — Target: {kpi.target}
            </label>
            <Input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(kpi.id, period, parseFloat(value)); onClose(); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const LinkCAPAModal: React.FC<{
  kpi: OperationalKPI;
  onClose: () => void;
  onSave: (kpiId: string, capaId: string) => void;
}> = ({ kpi, onClose, onSave }) => {
  const [capaId, setCapaId] = useState('');
  const [linked, setLinked] = useState<string[]>(kpi.linkedCAPAs || []);
  
  const handleAdd = () => {
    if (capaId.trim()) {
      onSave(kpi.id, capaId.trim());
      setLinked([...linked, capaId.trim()]);
      setCapaId('');
    }
  };
  
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link CAPA to {kpi.name}</DialogTitle>
          <DialogDescription>
            Linking a CAPA allows tracking its effectiveness on this KPI. When the CAPA closes,
            you can verify if the KPI improved.
          </DialogDescription>
        </DialogHeader>
        
        {linked.length > 0 && (
          <div className="bg-green-500/10 dark:bg-green-500/20 rounded p-3 mb-4">
            <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Linked CAPAs:</div>
            <div className="flex flex-wrap gap-2">
              {linked.map((id, idx) => (
                <span key={idx} className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded text-sm">{id}</span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="e.g., F/22-003"
            value={capaId}
            onChange={(e) => setCapaId(e.target.value)}
          />
          <Button onClick={handleAdd}>Link</Button>
        </div>
        
        <DialogFooter>
          <Button variant="link" onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddReviewModal: React.FC<{
  kpi: OperationalKPI;
  onClose: () => void;
  onSave: (kpiId: string, f21Ref: string, decision: string, notes: string) => void;
}> = ({ kpi, onClose, onSave }) => {
  const [f21Ref, setF21Ref] = useState('F/21-');
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Management Review Entry</DialogTitle>
          <DialogDescription>{kpi.name}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">F/21 Reference</label>
            <Input
              type="text"
              value={f21Ref}
              onChange={(e) => setF21Ref(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Decision</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              <option value="Continue Monitoring">Continue Monitoring</option>
              <option value="Review Target">Review Target</option>
              <option value="CAPA Initiated">CAPA Initiated</option>
              <option value="Procedure Updated">Procedure Updated</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-20 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(kpi.id, f21Ref, decision, notes); onClose(); }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const KPIReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKPIs] = useState<OperationalKPI[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on-track' | 'warning' | 'critical'>('all');
  const [modalState, setModalState] = useState<{type: 'actual' | 'capa' | 'review' | null, kpi: OperationalKPI | null}>({ type: null, kpi: null });
  const [summary, setSummary] = useState({ total: 0, onTrack: 0, warning: 0, critical: 0, withLinkedCAPAs: 0 });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    const data = loadKPIsFromStorage();
    setKPIs(data);
    setSummary(getKPISummary());
  };
  
  const filteredKPIs = useMemo(() => {
    return kpis.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          kpi.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || kpi.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || kpi.currentStatus === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [kpis, searchQuery, categoryFilter, statusFilter]);
  
  const categories = useMemo(() => 
    Array.from(new Set(kpis.map(k => k.category))).sort(),
  [kpis]);
  
  const handleRecordActual = (kpiId: string, period: string, value: number) => {
    const enteredBy = "QMS System";
    addKPIActual(kpiId, period, value, enteredBy);
    loadData();
  };
  
  const handleLinkCAPA = (kpiId: string, capaId: string) => {
    linkCAPAToKPI(kpiId, capaId);
    loadData();
  };
  
  const handleAddReview = (kpiId: string, f21Ref: string, decision: string, notes: string) => {
    addKPIReviewEntry(kpiId, f21Ref, decision, notes);
    loadData();
  };
  
  return (
    <AppShell breadcrumbs={[{label: "Home", href: "/"}, {label: "KPI Review"}]}>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">KPI Management &amp; Review</h1>
                <p className="text-muted-foreground">Track Actual vs Target, Link to CAPAs, Manage Review History</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="text-3xl font-bold text-foreground">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Active KPIs</div>
            </div>
            <div className="bg-green-500/10 dark:bg-green-500/20 rounded-lg p-4 border border-green-500/30">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.onTrack}</div>
              <div className="text-sm text-green-600 dark:text-green-400">On Track</div>
            </div>
            <div className="bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{summary.warning}</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Warning</div>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
              <div className="text-3xl font-bold text-destructive">{summary.critical}</div>
              <div className="text-sm text-destructive">Critical</div>
            </div>
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
              <div className="text-3xl font-bold text-primary">{summary.withLinkedCAPAs}</div>
              <div className="text-sm text-primary">Linked to CAPAs</div>
            </div>
          </div>
          
          {/* Alert Panel */}
          <KPIAlertPanel />
          
          {/* Filters */}
          <div className="bg-card rounded-lg p-4 mb-6 border border-border">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search KPIs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'on-track' | 'warning' | 'critical')}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="on-track">On Track</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
              <Button
                variant="link"
                onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setStatusFilter('all'); }}
              >
                Reset
              </Button>
            </div>
          </div>
          
          {/* KPI Grid */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white rounded-full p-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">HR Data Source</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Actual performance values are provided and verified by the <strong>HR Department</strong>. 
                This system calculates variance and status based on HR-approved data. 
                For data entry inquiries, contact HR.
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                ISO 9001:2015 Clause 7.2 — HR ensures competent personnel enter performance data
              </p>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredKPIs.map(kpi => (
              <KPICard
                key={kpi.id}
                kpi={kpi}
                onRecordActual={(k) => setModalState({ type: 'actual', kpi: k })}
                onLinkCAPA={(k) => setModalState({ type: 'capa', kpi: k })}
                onAddReview={(k) => setModalState({ type: 'review', kpi: k })}
              />
            ))}
          </div>
          
          {filteredKPIs.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No KPIs found matching your filters</p>
            </div>
          )}
        </div>
        
        {/* Modals */}
        {modalState.type === 'actual' && modalState.kpi && (
          <RecordActualModal
            kpi={modalState.kpi}
            onClose={() => setModalState({ type: null, kpi: null })}
            onSave={handleRecordActual}
          />
        )}
        {modalState.type === 'capa' && modalState.kpi && (
          <LinkCAPAModal
            kpi={modalState.kpi}
            onClose={() => setModalState({ type: null, kpi: null })}
            onSave={handleLinkCAPA}
          />
        )}
        {modalState.type === 'review' && modalState.kpi && (
          <AddReviewModal
            kpi={modalState.kpi}
            onClose={() => setModalState({ type: null, kpi: null })}
            onSave={handleAddReview}
          />
        )}
      </div>
    </AppShell>
  );
};

export default KPIReviewPage;
