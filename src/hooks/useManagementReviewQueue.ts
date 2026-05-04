/**
 * useManagementReviewQueue Hook
 * 
 * ISO 9001:2015 Clause 9.3.2 Compliance
 * Auto-generates draft F/21 items when critical conditions detected
 */

import { useEffect, useState, useCallback } from 'react';
import { OperationalKPI, getKPIsRequiringAttention } from '@/data/operationalKPIData';

// ============================================================================
// TYPES
// ============================================================================

export interface ManagementReviewQueueItem {
  id: string;
  sourceType: 'KPI_CRITICAL' | 'CAPA_REJECTED_EVIDENCE' | 'MAJOR_COMPLAINT';
  sourceId: string; // KPI ID, CAPA ID, or F/09 ID
  title: string;
  description: string;
  generatedAt: string;
  status: 'pending' | 'acknowledged' | 'skipped';
  relatedF21?: string; // Link to actual F/21 once created
}

// ============================================================================
// STORAGE KEY
// ============================================================================

const QUEUE_STORAGE_KEY = 'qms_management_review_queue';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function loadQueueFromStorage(): ManagementReviewQueueItem[] {
  try {
    const data = localStorage.getItem(QUEUE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveQueueToStorage(queue: ManagementReviewQueueItem[]): void {
  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

function generateItemId(sourceType: string, sourceId: string): string {
  return `MRQ-${sourceType}-${sourceId}-${Date.now()}`;
}

function isItemDuplicate(existing: ManagementReviewQueueItem[], sourceId: string, month: string): boolean {
  return existing.some(item => 
    item.sourceId === sourceId && 
    item.generatedAt.startsWith(month) &&
    item.status !== 'skipped'
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useManagementReviewQueue() {
  const [queue, setQueue] = useState<ManagementReviewQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load queue on mount
  useEffect(() => {
    const data = loadQueueFromStorage();
    setQueue(data);
    setIsLoading(false);
  }, []);

  // Auto-generate queue items from critical KPIs
  const generateFromCriticalKPIs = useCallback(() => {
    const criticalKPIs = getKPIsRequiringAttention().critical;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const existingQueue = loadQueueFromStorage();
    const newItems: ManagementReviewQueueItem[] = [];

    criticalKPIs.forEach(kpi => {
      // Dedup: Only one item per KPI per month
      if (!isItemDuplicate(existingQueue, kpi.id, currentMonth)) {
        const item: ManagementReviewQueueItem = {
          id: generateItemId('KPI_CRITICAL', kpi.id),
          sourceType: 'KPI_CRITICAL',
          sourceId: kpi.id,
          title: `Critical KPI Alert: ${kpi.name}`,
          description: `KPI ${kpi.name} (${kpi.id}) has variance of ${kpi.currentVariance.toFixed(1)}%. Requires Management Review per Clause 9.3.2.`,
          generatedAt: new Date().toISOString(),
          status: 'pending',
        };
        newItems.push(item);
      }
    });

    if (newItems.length > 0) {
      const updated = [...existingQueue, ...newItems];
      saveQueueToStorage(updated);
      setQueue(updated);
    }

    return newItems.length;
  }, []);

  // Manual trigger: Force create F/21 agenda item
  const createF21Draft = useCallback((itemId: string, f21Ref: string) => {
    setQueue(prev => {
      const updated = prev.map(item => 
        item.id === itemId 
          ? { ...item, status: 'acknowledged' as const, relatedF21: f21Ref }
          : item
      );
      saveQueueToStorage(updated);
      return updated;
    });
  }, []);

  // Skip queue item (e.g., if handled outside system)
  const skipItem = useCallback((itemId: string, reason?: string) => {
    setQueue(prev => {
      const updated = prev.map(item => 
        item.id === itemId 
          ? { ...item, status: 'skipped' as const }
          : item
      );
      saveQueueToStorage(updated);
      return updated;
    });
  }, []);

  // Get pending items
  const pendingItems = queue.filter(item => item.status === 'pending');

  // Get statistics
  const stats = {
    total: queue.length,
    pending: pendingItems.length,
    acknowledged: queue.filter(item => item.status === 'acknowledged').length,
    skipped: queue.filter(item => item.status === 'skipped').length,
  };

  return {
    queue,
    pendingItems,
    stats,
    isLoading,
    generateFromCriticalKPIs,
    createF21Draft,
    skipItem,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default useManagementReviewQueue;
