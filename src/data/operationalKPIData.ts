/**
 * KPI Data Model - Enhanced for ISO 9001:2015 with CAPA Integration
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Actual vs Target tracking with alerting
 * - Variance calculation (auto-calculated)
 * - Linked CAPAs (for effectiveness verification)
 * - Management Review history
 * - Status: on-track | warning | critical (auto-calculated)
 */

// ============================================================================
// A. CORE INTERFACES
// ============================================================================

export interface KPIActualRecord {
  period: string;           // "2026-03", "2026-Q1"
  value: number;            // Actual achievement
  target: number;           // Target value
  variance: number;         // Calculated: (actual - target) / target * 100
  status: "on-track" | "warning" | "critical"; // Auto-calculated
  source: string;           // "IPM-Sheet-A", "Manual Entry", "System"
  enteredBy: string;
  enteredAt: string;        // ISO 8601 timestamp
}

export interface KPIManagementReview {
  date: string;
  f21Ref: string;           // e.g., "F/21-002"
  decision: string;         // "Continue Monitoring", "Review Target", "CAPA Initiated"
  notes?: string;
}

export interface OperationalKPI {
  id: string;               // e.g., "KPI-PROD-01"
  name: string;             // Display name
  description: string;
  category: string;         // "Production", "Quality", "HR", "Finance"
  role: string;             // Owner role
  target: number;           // Target value (e.g., 95.0 for 95%)
  unit: string;             // "%", "days", "count", "hours"
  frequency: "monthly" | "quarterly" | "annual";
  
  // Actuals array (historical data)
  actuals: KPIActualRecord[];
  
  // Variance (auto-calculated from latest actual)
  currentVariance: number;
  currentStatus: "on-track" | "warning" | "critical";
  
  // CAPA Integration
  linkedCAPAs: string[];      // Array of F/22-XXX or trace IDs
  
  // Management Review tracking
  reviewHistory: KPIManagementReview[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// ============================================================================
// B. KPI REGISTRY STORAGE
// ============================================================================

const KPI_STORAGE_KEY = "qms_operational_kpis";

// Pre-populated operational KPIs aligned with company structure
export const DEFAULT_KPIs: OperationalKPI[] = [
  // Production KPIs
  {
    id: "KPI-PROD-01",
    name: "Annotation Accuracy",
    description: "Percentage of correctly annotated images/videos",
    category: "Production",
    role: "Team Leader",
    target: 98.5,
    unit: "%",
    frequency: "monthly",
    actuals: [
      { period: "2026-01", value: 97.8, target: 98.5, variance: -0.71, status: "warning", source: "QC Review", enteredBy: "Ahmed Khaled", enteredAt: "2026-02-01T10:00:00Z" },
      { period: "2026-02", value: 98.2, target: 98.5, variance: -0.30, status: "on-track", source: "QC Review", enteredBy: "Ahmed Khaled", enteredAt: "2026-03-01T10:00:00Z" },
      { period: "2026-03", value: 98.9, target: 98.5, variance: 0.41, status: "on-track", source: "QC Review", enteredBy: "Ahmed Khaled", enteredAt: "2026-04-01T10:00:00Z" },
      { period: "2026-04", value: 99.1, target: 98.5, variance: 0.61, status: "on-track", source: "QC Review", enteredBy: "Ahmed Khaled", enteredAt: "2026-05-01T10:00:00Z" },
    ],
    currentVariance: 0.61,
    currentStatus: "on-track",
    linkedCAPAs: [],
    reviewHistory: [{ date: "2026-03-15", f21Ref: "F/21-002", decision: "Continue Monitoring", notes: "Improving trend since January" }],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-01T10:00:00Z",
    isActive: true,
  },
  {
    id: "KPI-PROD-02",
    name: "Production Output",
    description: "Units completed per agent per day",
    category: "Production",
    role: "Operations Director",
    target: 250,
    unit: "count",
    frequency: "monthly",
    actuals: [
      { period: "2026-01", value: 235, target: 250, variance: -6.0, status: "warning", source: "IPM-Sheet-A", enteredBy: "Andrew Maged", enteredAt: "2026-02-01T10:00:00Z" },
      { period: "2026-02", value: 248, target: 250, variance: -0.8, status: "on-track", source: "IPM-Sheet-A", enteredBy: "Andrew Maged", enteredAt: "2026-03-01T10:00:00Z" },
      { period: "2026-03", value: 261, target: 250, variance: 4.4, status: "on-track", source: "IPM-Sheet-A", enteredBy: "Andrew Maged", enteredAt: "2026-04-01T10:00:00Z" },
      { period: "2026-04", value: 270, target: 250, variance: 8.0, status: "on-track", source: "IPM-Sheet-A", enteredBy: "Andrew Maged", enteredAt: "2026-05-01T10:00:00Z" },
    ],
    currentVariance: 8.0,
    currentStatus: "on-track",
    linkedCAPAs: [],
    reviewHistory: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-01T10:00:00Z",
    isActive: true,
  },
  
  // Quality KPIs
  {
    id: "KPI-QUAL-01",
    name: "Customer Complaint Rate",
    description: "Number of complaints per 1000 units delivered",
    category: "Quality",
    role: "Quality Manager",
    target: 0.5,
    unit: "%",
    frequency: "monthly",
    actuals: [
      { period: "2026-01", value: 0.3, target: 0.5, variance: -40.0, status: "on-track", source: "F/09 Log", enteredBy: "Ahmed Khaled", enteredAt: "2026-02-01T10:00:00Z" },
      { period: "2026-02", value: 0.2, target: 0.5, variance: -60.0, status: "on-track", source: "F/09 Log", enteredBy: "Ahmed Khaled", enteredAt: "2026-03-01T10:00:00Z" },
      { period: "2026-03", value: 0.4, target: 0.5, variance: -20.0, status: "on-track", source: "F/09 Log", enteredBy: "Ahmed Khaled", enteredAt: "2026-04-01T10:00:00Z" },
      { period: "2026-04", value: 0.1, target: 0.5, variance: -80.0, status: "on-track", source: "F/09 Log", enteredBy: "Ahmed Khaled", enteredAt: "2026-05-01T10:00:00Z" },
    ],
    currentVariance: -80.0,
    currentStatus: "on-track",
    linkedCAPAs: ["F/22-001"],
    reviewHistory: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-01T10:00:00Z",
    isActive: true,
  },
  {
    id: "KPI-QUAL-02",
    name: "CAPA Effectiveness Rate",
    description: "Percentage of CAPAs with verified effectiveness",
    category: "Quality",
    role: "Quality Manager",
    target: 95.0,
    unit: "%",
    frequency: "quarterly",
    actuals: [
      { period: "2026-Q1", value: 100.0, target: 95.0, variance: 5.26, status: "on-track", source: "F/22 Review", enteredBy: "Ahmed Khaled", enteredAt: "2026-04-01T10:00:00Z" },
    ],
    currentVariance: 5.26,
    currentStatus: "on-track",
    linkedCAPAs: ["F/22-001", "F/22-002"],
    reviewHistory: [{ date: "2026-04-15", f21Ref: "F/21-002", decision: "Continue Monitoring", notes: "Both CAPAs verified effective" }],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T10:00:00Z",
    isActive: true,
  },
  
  // HR KPIs
  {
    id: "KPI-HR-01",
    name: "Training Completion Rate",
    description: "Percentage of required training completed on time",
    category: "HR",
    role: "HR Manager",
    target: 100.0,
    unit: "%",
    frequency: "monthly",
    actuals: [
      { period: "2026-01", value: 100.0, target: 100.0, variance: 0.0, status: "on-track", source: "F/28 Training Log", enteredBy: "Youssef Hamada", enteredAt: "2026-02-01T10:00:00Z" },
      { period: "2026-02", value: 98.4, target: 100.0, variance: -1.6, status: "on-track", source: "F/28 Training Log", enteredBy: "Youssef Hamada", enteredAt: "2026-03-01T10:00:00Z" },
      { period: "2026-03", value: 100.0, target: 100.0, variance: 0.0, status: "on-track", source: "F/28 Training Log", enteredBy: "Youssef Hamada", enteredAt: "2026-04-01T10:00:00Z" },
      { period: "2026-04", value: 100.0, target: 100.0, variance: 0.0, status: "on-track", source: "F/28 Training Log", enteredBy: "Youssef Hamada", enteredAt: "2026-05-01T10:00:00Z" },
    ],
    currentVariance: 0.0,
    currentStatus: "on-track",
    linkedCAPAs: [],
    reviewHistory: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-01T10:00:00Z",
    isActive: true,
  },
  {
    id: "KPI-HR-02",
    name: "Agent Turnover Rate",
    description: "Percentage of agents terminated/resigned per quarter",
    category: "HR",
    role: "HR Manager",
    target: 8.0,
    unit: "%",
    frequency: "quarterly",
    actuals: [
      { period: "2026-Q1", value: 4.8, target: 8.0, variance: -40.0, status: "on-track", source: "HR Records", enteredBy: "Youssef Hamada", enteredAt: "2026-04-01T10:00:00Z" },
    ],
    currentVariance: -40.0,
    currentStatus: "on-track",
    linkedCAPAs: [],
    reviewHistory: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T10:00:00Z",
    isActive: true,
  },
  
  // Client KPIs
  {
    id: "KPI-CLIENT-01",
    name: "Client Satisfaction Score",
    description: "Average client satisfaction rating (1-10)",
    category: "Client",
    role: "Operations Director",
    target: 9.0,
    unit: "score",
    frequency: "quarterly",
    actuals: [
      { period: "2026-Q1", value: 8.7, target: 9.0, variance: -3.33, status: "on-track", source: "Client Feedback F/09", enteredBy: "Ahmed Khaled", enteredAt: "2026-04-01T10:00:00Z" },
    ],
    currentVariance: -3.33,
    currentStatus: "on-track",
    linkedCAPAs: [],
    reviewHistory: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-04-01T10:00:00Z",
    isActive: true,
  },
  {
    id: "KPI-CLIENT-02",
    name: "On-Time Delivery Rate",
    description: "Percentage of projects delivered on or before deadline",
    category: "Client",
    role: "Operations Director",
    target: 98.0,
    unit: "%",
    frequency: "monthly",
    actuals: [
      { period: "2026-01", value: 97.2, target: 98.0, variance: -0.82, status: "warning", source: "F/08 Orders", enteredBy: "Andrew Maged", enteredAt: "2026-02-01T10:00:00Z" },
      { period: "2026-02", value: 98.5, target: 98.0, variance: 0.51, status: "on-track", source: "F/08 Orders", enteredBy: "Andrew Maged", enteredAt: "2026-03-01T10:00:00Z" },
      { period: "2026-03", value: 99.0, target: 98.0, variance: 1.02, status: "on-track", source: "F/08 Orders", enteredBy: "Andrew Maged", enteredAt: "2026-04-01T10:00:00Z" },
      { period: "2026-04", value: 98.3, target: 98.0, variance: 0.31, status: "on-track", source: "F/08 Orders", enteredBy: "Andrew Maged", enteredAt: "2026-05-01T10:00:00Z" },
    ],
    currentVariance: 0.31,
    currentStatus: "on-track",
    linkedCAPAs: [],
    reviewHistory: [],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-05-01T10:00:00Z",
    isActive: true,
  },
];

// ============================================================================
// C. STORAGE FUNCTIONS
// ============================================================================

export function loadKPIsFromStorage(): OperationalKPI[] {
  try {
    const data = localStorage.getItem(KPI_STORAGE_KEY);
    if (!data) {
      // Initialize with defaults
      saveKPIsToStorage(DEFAULT_KPIs);
      return DEFAULT_KPIs;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_KPIs;
  }
}

export function saveKPIsToStorage(kpis: OperationalKPI[]): void {
  localStorage.setItem(KPI_STORAGE_KEY, JSON.stringify(kpis));
}

// ============================================================================
// D. CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate variance and status from actual vs target
 */
export function calculateKPIStatus(
  actual: number, 
  target: number, 
  isLowerBetter: boolean = false
): { variance: number; status: "on-track" | "warning" | "critical" } {
  if (target === 0) return { variance: 0, status: "on-track" };
  
  const variance = ((actual - target) / target) * 100;
  
  // For metrics where lower is better (e.g., complaints, defects)
  if (isLowerBetter) {
    if (variance <= -10) return { variance, status: "critical" }; // 10% better than target
    if (variance <= -5) return { variance, status: "warning" };
    return { variance, status: "on-track" };
  }
  
  // For metrics where higher is better (e.g., accuracy, completion)
  if (variance >= -5) return { variance, status: "on-track" }; // Within 5% of target
  if (variance >= -10) return { variance, status: "warning" };
  return { variance, status: "critical" };
}

/**
 * Add actual value to KPI
 */
export function addKPIActual(
  kpiId: string,
  period: string,
  value: number,
  enteredBy: string
): OperationalKPI | null {
  const kpis = loadKPIsFromStorage();
  const kpi = kpis.find(k => k.id === kpiId);
  if (!kpi) return null;
  
  const isLowerBetter = kpi.unit === "%" && kpi.name.toLowerCase().includes("complaint");
  const { variance, status } = calculateKPIStatus(value, kpi.target, isLowerBetter);
  
  const actualRecord: KPIActualRecord = {
    period,
    value,
    target: kpi.target,
    variance,
    status,
    source: "Manual Entry",
    enteredBy,
    enteredAt: new Date().toISOString(),
  };
  
  kpi.actuals.push(actualRecord);
  kpi.currentVariance = variance;
  kpi.currentStatus = status;
  kpi.updatedAt = new Date().toISOString();
  
  saveKPIsToStorage(kpis);
  return kpi;
}

/**
 * Link CAPA to KPI (for effectiveness tracking)
 */
export function linkCAPAToKPI(kpiId: string, capaId: string): OperationalKPI | null {
  const kpis = loadKPIsFromStorage();
  const kpi = kpis.find(k => k.id === kpiId);
  if (!kpi) return null;
  
  if (!kpi.linkedCAPAs.includes(capaId)) {
    kpi.linkedCAPAs.push(capaId);
    kpi.updatedAt = new Date().toISOString();
    saveKPIsToStorage(kpis);
  }
  
  return kpi;
}

/**
 * Get KPIs by category
 */
export function getKPIsByCategory(category: string): OperationalKPI[] {
  const kpis = loadKPIsFromStorage();
  return kpis.filter(k => k.category === category && k.isActive);
}

/**
 * Get KPIs by status (for alerting)
 */
export function getKPIsByStatus(status: "on-track" | "warning" | "critical"): OperationalKPI[] {
  const kpis = loadKPIsFromStorage();
  return kpis.filter(k => k.currentStatus === status && k.isActive);
}

/**
 * Get KPIs with linked CAPAs
 */
export function getKPIsWithLinkedCAPAs(): OperationalKPI[] {
  const kpis = loadKPIsFromStorage();
  return kpis.filter(k => k.linkedCAPAs.length > 0);
}

/**
 * Add management review entry
 */
export function addKPIReviewEntry(
  kpiId: string,
  f21Ref: string,
  decision: string,
  notes?: string
): OperationalKPI | null {
  const kpis = loadKPIsFromStorage();
  const kpi = kpis.find(k => k.id === kpiId);
  if (!kpi) return null;
  
  const review: KPIManagementReview = {
    date: new Date().toISOString(),
    f21Ref,
    decision,
    notes,
  };
  
  kpi.reviewHistory.push(review);
  kpi.updatedAt = new Date().toISOString();
  saveKPIsToStorage(kpis);
  
  return kpi;
}

// ============================================================================
// E. ALERT FUNCTIONS
// ============================================================================

/**
 * Get all KPIs requiring attention (warning or critical)
 */
export function getKPIsRequiringAttention(): { critical: OperationalKPI[]; warning: OperationalKPI[] } {
  const kpis = loadKPIsFromStorage();
  return {
    critical: kpis.filter(k => k.currentStatus === "critical" && k.isActive),
    warning: kpis.filter(k => k.currentStatus === "warning" && k.isActive),
  };
}

/**
 * Get summary statistics
 */
export function getKPISummary(): {
  total: number;
  onTrack: number;
  warning: number;
  critical: number;
  withLinkedCAPAs: number;
} {
  const kpis = loadKPIsFromStorage();
  return {
    total: kpis.filter(k => k.isActive).length,
    onTrack: kpis.filter(k => k.currentStatus === "on-track" && k.isActive).length,
    warning: kpis.filter(k => k.currentStatus === "warning" && k.isActive).length,
    critical: kpis.filter(k => k.currentStatus === "critical" && k.isActive).length,
    withLinkedCAPAs: kpis.filter(k => k.linkedCAPAs.length > 0 && k.isActive).length,
  };
}

// ============================================================================
// F. EXPORT
// ============================================================================

// Export singleton for immediate use
export const KPI_REGISTRY = {
  load: loadKPIsFromStorage,
  save: saveKPIsToStorage,
  addActual: addKPIActual,
  linkCAPA: linkCAPAToKPI,
  getByCategory: getKPIsByCategory,
  getByStatus: getKPIsByStatus,
  getRequiringAttention: getKPIsRequiringAttention,
  addReview: addKPIReviewEntry,
  getSummary: getKPISummary,
};
