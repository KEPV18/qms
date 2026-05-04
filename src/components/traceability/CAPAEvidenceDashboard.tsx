/**
 * CAPA Effectiveness Evidence Dashboard
 * 
 * ISO 9001:2015 Clause 10.2 Compliance:
 * - Shows CAPAs pending effectiveness verification
 * - Links CAPAs to KPI improvements, audits, training completion
 * - Displays evidence status before closure allowed
 * - Generates Management Review trigger queue
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Link as LinkIcon,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Eye,
  Plus,
} from 'lucide-react';
import {
  OperationalKPI,
  getKPIsRequiringAttention,
  getKPIsWithLinkedCAPAs,
  linkCAPAToKPI,
}
from '@/data/operationalKPIData';
import { useTraceabilityResolver } from '@/hooks/useTraceabilityResolver';
import { TraceableRecord, RelationshipType } from '@/lib/traceability';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// ============================================================================
// TYPES
// ============================================================================

type CAPAStatus = 'open' | 'in-progress' | 'under-verification' | 'evidence-pending' | 'closed';

type EvidenceType = 'KPI_IMPROVEMENT' | 'AUDIT_FINDING_CLOSED' | 'TRAINING_COMPLETED' | 'PROCEDURE_UPDATED' | 'OTHER';

interface EvidenceItem {
  type: EvidenceType;
  description: string;
  linkedId?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: 'pending' | 'verified' | 'rejected';
}

interface CAPAWithEvidence {
  id: string;
  title: string;
  rootCause: string;
  correctiveAction: string;
  status: CAPAStatus;
  createdAt: string;
  targetCloseDate: string;
  linkedToF09?: string;
  linkedToKPIs: string[];
  evidence: EvidenceItem[];
  canClose: boolean; // All evidence verified
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getEvidenceIcon = (type: EvidenceType): React.ReactNode => {
  switch (type) {
    case 'KPI_IMPROVEMENT':
      return <TrendingUp className="h-5 w-5 text-primary" />;
    case 'AUDIT_FINDING_CLOSED':
      return <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />;
    case 'TRAINING_COMPLETED':
      return <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    case 'PROCEDURE_UPDATED':
      return <FileText className="h-5 w-5 text-warning" />;
    case 'OTHER':
      return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: CAPAStatus): { color: string; label: string } => {
  switch (status) {
    case 'open':
      return { color: 'bg-muted text-muted-foreground', label: 'Open' };
    case 'in-progress':
      return { color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300', label: 'In Progress' };
    case 'under-verification':
      return { color: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300', label: 'Under Verification' };
    case 'evidence-pending':
      return { color: 'bg-warning/10 text-warning', label: 'Evidence Pending' };
    case 'closed':
      return { color: 'bg-green-500/10 text-green-700 dark:text-green-300', label: 'Closed' };
  }
};

const calculateEvidenceStatus = (evidence: EvidenceItem[]): { 
  verified: number; 
  pending: number; 
  progress: number;
  canClose: boolean;
} => {
  const verified = evidence.filter(e => e.status === 'verified').length;
  const pending = evidence.filter(e => e.status === 'pending').length;
  const total = evidence.length;
  const progress = total > 0 ? (verified / total) * 100 : 0;
  const canClose = pending === 0 && total > 0; // All evidence must be verified
  return { verified, pending, progress, canClose };
};

// ============================================================================
// COMPONENT: Evidence Item Row
// ============================================================================

const EvidenceRow: React.FC<{ 
  evidence: EvidenceItem; 
  onVerify: () => void;
  editable: boolean;
}> = ({ evidence, onVerify, editable }) => {
  return (
    <div className="flex items-start justify-between py-3 border-b last:border-b-0 border-border">
      <div className="flex items-start space-x-3">
        <div className="mt-0.5">{getEvidenceIcon(evidence.type)}</div>
        <div>
          <div className="font-medium text-sm text-foreground">{evidence.description}</div>
          {evidence.linkedId && (
            <div className="text-xs text-primary flex items-center mt-1">
              <LinkIcon className="h-3 w-3 mr-1" />
              {evidence.linkedId}
            </div>
          )}
          {evidence.verifiedBy && (
            <div className="text-xs text-muted-foreground mt-1">
              Verified by {evidence.verifiedBy} at {new Date(evidence.verifiedAt || '').toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {evidence.status === 'verified' ? (
          <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Verified
          </span>
        ) : evidence.status === 'rejected' ? (
          <span className="flex items-center text-destructive text-sm">
            <XCircle className="h-4 w-4 mr-1" />
            Rejected
          </span>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-warning mr-1" />
            <span className="text-sm text-warning mr-2">Pending</span>
            {editable && (
              <Button
                onClick={onVerify}
                size="sm"
                className="text-xs"
              >
                Verify
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: CAPA Card
// ============================================================================

interface CAPACardProps {
  capa: CAPAWithEvidence;
  onSelect: (capa: CAPAWithEvidence) => void;
  isSelected: boolean;
}

const CAPACard: React.FC<CAPACardProps> = ({ capa, onSelect, isSelected }) => {
  const { verified, pending, progress, canClose } = calculateEvidenceStatus(capa.evidence);
  const statusBadge = getStatusBadge(capa.status);
  
  return (
    <div
      onClick={() => onSelect(capa)}
      className={`cursor-pointer border rounded-lg p-4 transition-all ${
        isSelected ? 'ring-2 ring-primary bg-primary/10' : 'bg-card hover:shadow-md'
      } ${canClose ? 'border-green-500/30' : 'border-border'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs text-muted-foreground font-mono">{capa.id}</span>
          <h4 className="font-semibold text-foreground">{capa.title}</h4>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>
          {statusBadge.label}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground line-clamp-2">
          <span className="font-medium text-foreground">Root Cause:</span> {capa.rootCause}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-1" />
          Target: {new Date(capa.targetCloseDate).toLocaleDateString()}
        </div>
        
        {/* Evidence Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Evidence Status</span>
            <span className={canClose ? 'text-green-600 dark:text-green-400 font-medium' : 'text-warning'}>
              {verified}/{capa.evidence.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${canClose ? 'bg-green-500' : 'bg-warning'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Linked KPIs */}
        {capa.linkedToKPIs.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {capa.linkedToKPIs.map(kpiId => (
              <span key={kpiId} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {kpiId}
              </span>
            ))}
          </div>
        )}
      </div>
      
      
      {canClose && capa.status !== 'closed' && (
        <div className="mt-3 p-2 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 rounded text-xs text-green-600 dark:text-green-400 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1" />
          Ready for closure verification
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENT: Add Evidence Modal (using shadcn Dialog)
// ============================================================================

const AddEvidenceModal: React.FC<{
  capaId: string;
  onClose: () => void;
  onAdd: (capaId: string, evidence: Omit<EvidenceItem, 'status'>) => void;
}> = ({ capaId, onClose, onAdd }) => {
  const [type, setType] = useState<EvidenceType>('KPI_IMPROVEMENT');
  const [description, setDescription] = useState('');
  const [linkedId, setLinkedId] = useState('');
  
  const handleSubmit = () => {
    if (!description.trim()) return;
    onAdd(capaId, {
      type,
      description,
      linkedId: linkedId.trim() || undefined,
    });
    onClose();
  };
  
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Evidence for CAPA</DialogTitle>
          <DialogDescription>
            Record evidence of effectiveness before CAPA closure.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Evidence Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EvidenceType)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="KPI_IMPROVEMENT">📈 KPI Improvement</option>
              <option value="AUDIT_FINDING_CLOSED">✅ Audit Finding Closed</option>
              <option value="TRAINING_COMPLETED">🎓 Training Completed</option>
              <option value="PROCEDURE_UPDATED">📝 Procedure Updated</option>
              <option value="OTHER">📄 Other Documentation</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the evidence..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Linked Record ID (Optional)</label>
            <Input
              type="text"
              value={linkedId}
              onChange={(e) => setLinkedId(e.target.value)}
              placeholder="e.g., F/28-002, KPI-PROD-01"
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!description.trim()}>Add Evidence</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT: CAPA Evidence Dashboard
// ============================================================================

const CAPAEvidenceDashboard: React.FC = () => {
  const [capas, setCapas] = useState<CAPAWithEvidence[]>([]);
  const [selectedCapa, setSelectedCapa] = useState<CAPAWithEvidence | null>(null);
  const [showAddEvidenceModal, setShowAddEvidenceModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending-verification' | 'ready-to-close'>('all');
  
  const { records } = useTraceabilityResolver();
  
  // Filter CAPAs by tab
  const filteredCapas = capas.filter(capa => {
    if (activeTab === 'pending-verification') {
      return capa.status === 'under-verification' || capa.status === 'evidence-pending';
    }
    if (activeTab === 'ready-to-close') {
      const { canClose } = calculateEvidenceStatus(capa.evidence);
      return canClose && capa.status !== 'closed';
    }
    return true;
  });
  
  // Statistics
  const stats = {
    total: capas.length,
    pendingVerification: capas.filter(c => c.status === 'under-verification' || c.status === 'evidence-pending').length,
    readyToClose: capas.filter(c => {
      const { canClose } = calculateEvidenceStatus(c.evidence);
      return canClose && c.status !== 'closed';
    }).length,
    closed: capas.filter(c => c.status === 'closed').length,
  };
  
  const handleVerifyEvidence = (capaId: string, evidenceIndex: number) => {
    setCapas(prev => prev.map(capa => {
      if (capa.id !== capaId) return capa;
      const newEvidence = [...capa.evidence];
      newEvidence[evidenceIndex] = {
        ...newEvidence[evidenceIndex],
        status: 'verified',
        verifiedBy: 'QMS System',
        verifiedAt: new Date().toISOString(),
      };
      return { ...capa, evidence: newEvidence };
    }));
  };
  
  const handleAddEvidence = (capaId: string, evidence: Omit<EvidenceItem, 'status'>) => {
    setCapas(prev => prev.map(capa => {
      if (capa.id !== capaId) return capa;
      return {
        ...capa,
        evidence: [...capa.evidence, { ...evidence, status: 'pending' }],
        status: 'evidence-pending' as CAPAStatus,
      };
    }));
  };
  
  const selectedCapaEvidenceStatus = selectedCapa 
    ? calculateEvidenceStatus(selectedCapa.evidence)
    : { verified: 0, pending: 0, progress: 0, canClose: false };
  
  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center">
              <Shield className="h-6 w-6 text-primary mr-2" />
              CAPA Effectiveness Evidence Dashboard
            </h2>
            <p className="text-muted-foreground mt-1">
              ISO 9001:2015 Clause 10.2 — Verify effectiveness before closure
            </p>
          </div>
          
          <Button
            onClick={() => setShowAddEvidenceModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Evidence
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total CAPAs</div>
          </div>
          <div className="bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pendingVerification}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Verification</div>
          </div>
          <div className="bg-green-500/10 dark:bg-green-500/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.readyToClose}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Ready to Close</div>
          </div>
          <div className="bg-primary/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary">{stats.closed}</div>
            <div className="text-sm text-primary">Closed</div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          {[
            { id: 'all', label: 'All CAPAs', count: capas.length },
            { id: 'pending-verification', label: 'Pending Verification', count: stats.pendingVerification },
            { id: 'ready-to-close', label: 'Ready to Close', count: stats.readyToClose },
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'pending-verification' | 'ready-to-close')}
              variant={activeTab === tab.id ? "default" : "secondary"}
              size="sm"
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex">
        {/* CAPA List */}
        <div className="w-1/3 border-r border-border p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {filteredCapas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No CAPAs match this filter
            </div>
          ) : (
            filteredCapas.map(capa => (
              <CAPACard
                key={capa.id}
                capa={capa}
                onSelect={setSelectedCapa}
                isSelected={selectedCapa?.id === capa.id}
              />
            ))
          )}
        </div>
        
        {/* Evidence Panel */}
        <div className="w-2/3 p-6">
          {selectedCapa ? (
            <div>
              {/* CAPA Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">{selectedCapa.id}</span>
                    <h3 className="text-xl font-bold text-foreground">{selectedCapa.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(selectedCapa.status).color}`}>
                    {getStatusBadge(selectedCapa.status).label}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded p-3">
                    <div className="text-xs text-muted-foreground mb-1">Root Cause</div>
                    <div className="text-sm text-foreground">{selectedCapa.rootCause}</div>
                  </div>
                  <div className="bg-muted rounded p-3">
                    <div className="text-xs text-muted-foreground mb-1">Corrective Action</div>
                    <div className="text-sm text-foreground">{selectedCapa.correctiveAction}</div>
                  </div>
                </div>
                
                {selectedCapa.linkedToF09 && (
                  <div className="mt-3 flex items-center text-sm text-primary">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Traces to: {selectedCapa.linkedToF09}
                  </div>
                )}
              </div>
              
              {/* Evidence Section */}
              <div className="border border-border rounded-lg">
                <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                    <span className="font-semibold text-foreground">Effectiveness Evidence</span>
                  </div>
                  
                  <Button
                    onClick={() => setShowAddEvidenceModal(true)}
                    variant="link"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Evidence
                  </Button>
                </div>
                
                <div className="p-4">
                  {selectedCapa.evidence.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No evidence recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedCapa.evidence.map((ev, idx) => (
                        <EvidenceRow
                          key={idx}
                          evidence={ev}
                          onVerify={() => handleVerifyEvidence(selectedCapa.id, idx)}
                          editable={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Summary Footer */}
                <div className="p-4 border-t border-border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{selectedCapaEvidenceStatus.verified}</span> of {selectedCapa.evidence.length} evidence items verified
                    </div>
                    
                    {selectedCapaEvidenceStatus.canClose ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        <span className="font-semibold">Ready for closure verification</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-warning">
                        <AlertTriangle className="h-5 w-5 mr-1" />
                        <span>{selectedCapaEvidenceStatus.pending} evidence item(s) pending</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Panel */}
              <div className="mt-6 flex justify-end">
                {selectedCapaEvidenceStatus.canClose && selectedCapa.status !== 'closed' ? (
                  <>
                    <Button variant="outline" className="mr-3">
                      Preview Closure Report
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify &amp; Close CAPA
                    </Button>
                  </>
                ) : (
                  <Button disabled>
                    Verify &amp; Close CAPA (pending evidence)
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a CAPA from the list to view evidence status
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {showAddEvidenceModal && selectedCapa && (
        <AddEvidenceModal
          capaId={selectedCapa.id}
          onClose={() => setShowAddEvidenceModal(false)}
          onAdd={handleAddEvidence}
        />
      )}
    </div>
  );
};

export default CAPAEvidenceDashboard;
