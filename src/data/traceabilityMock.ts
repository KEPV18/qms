/**
 * ⚠️ MOCK DATA — FOR TESTING ONLY
 * This file contains fabricated test data and should NOT be used in production.
 * Real QMS records are stored in Google Drive / Supabase.
 */

/**
 * Mock Data for Traceability Testing
 * ISO 9001:2015 QMS — Relationship-Based Traceability
 * 
 * Test Case: ETH Customer Complaint (F/09-001) → Full Chain
 * Expected: ≤3 clicks, ≤5 minutes, 0 broken links
 */

import type { TraceableRecord, RecordRegistry } from "@/lib/traceability";

// ============================================================================
// A. ETH COMPLAINT CASE — COMPLETE TRACE CHAIN
// ============================================================================

/** 
 * F/09-001: Customer Complaint (ETH Client)
 * Actual historical case from Vezloo QMS
 * Date: 2026-01-10
 * Classification: MAJOR
 */
export const F09_001_ETH_Complaint: TraceableRecord = {
  id: "F/09-001",
  form: "F/09",
  number: "001",
  title: "ETH Client - Video Annotation Quality Complaint (MAJOR)",
  date: "2026-01-10",
  status: "CLOSED",
  isoClauses: ["8.7", "9.1.2", "10.2"],
  relatedRecords: [
    {
      form: "F/22",
      number: "001",
      relationship: "TRIGGERS",
      bidirectional: true,
      isoClause: "10.2",
      timestamp: "2026-01-10T14:30:00Z",
      createdBy: "Ahmed Khaled",
      notes: "MAJOR complaint requires CAPA per P/08",
      status: "ACTIVE",
    },
    {
      form: "F/50",
      number: "001",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "8.5.3",
      timestamp: "2026-01-10T14:35:00Z",
      createdBy: "Ahmed Khaled",
      notes: "Customer property damage documented",
      status: "ACTIVE",
    },
  ],
  auditTrail: [
    {
      timestamp: "2026-01-10T14:30:00Z",
      user: "Ahmed Khaled",
      action: "CREATED",
    },
    {
      timestamp: "2026-01-10T14:35:00Z",
      user: "Ahmed Khaled",
      action: "LINKED",
      field: "relatedRecords",
      newValue: "F/22-001 (CAPA)",
    },
    {
      timestamp: "2026-02-15T10:00:00Z",
      user: "Operations Director",
      action: "CLOSED",
    },
  ],
};

/**
 * F/22-001: Corrective Action (CAPA)
 * Triggered by F/09-001
 * Root Cause: Training Deficiency
 */
export const F22_001_CAPA: TraceableRecord = {
  id: "F/22-001",
  form: "F/22",
  number: "001",
  title: "ETH Quality Issue - Training Deficiency Correction",
  date: "2026-01-10",
  status: "CLOSED",
  isoClauses: ["10.2"],
  relatedRecords: [
    {
      form: "F/09",
      number: "001",
      relationship: "RESOLVES",
      bidirectional: true,
      isoClause: "10.2",
      timestamp: "2026-01-10T14:30:00Z",
      status: "ACTIVE",
    },
    {
      form: "F/28",
      number: "005",
      relationship: "REQUIRES_TRAINING",
      bidirectional: true,
      isoClause: "7.2",
      timestamp: "2026-01-15T09:00:00Z",
      createdBy: "Maria Magdy",
      notes: "Re-training required for 6 agents",
      status: "ACTIVE",
    },
    {
      form: "Risk",
      number: "R-012",
      relationship: "IDENTIFIES_RISK",
      bidirectional: true,
      isoClause: "6.1",
      timestamp: "2026-01-12T11:00:00Z",
      createdBy: "Quality Manager",
      notes: "Systemic training gap identified",
      status: "ACTIVE",
    },
    {
      form: "F/21",
      number: "002",
      relationship: "TRIGGERS_REVIEW",
      bidirectional: true,
      isoClause: "9.3.2",
      timestamp: "2026-02-01T00:00:00Z",
      status: "ACTIVE",
    },
    {
      form: "F/21",
      number: "003",
      relationship: "TRIGGERS_REVIEW",
      bidirectional: true,
      isoClause: "9.3.2",
      timestamp: "2026-03-01T00:00:00Z",
      status: "ACTIVE",
    },
  ],
  auditTrail: [
    {
      timestamp: "2026-01-10T14:30:00Z",
      user: "Ahmed Khaled",
      action: "CREATED",
    },
    {
      timestamp: "2026-01-12T11:00:00Z",
      user: "Quality Manager",
      action: "LINKED",
      field: "relatedRecords",
      newValue: "Risk-R-012",
    },
    {
      timestamp: "2026-01-15T09:00:00Z",
      user: "Maria Magdy",
      action: "LINKED",
      field: "relatedRecords",
      newValue: "F/28-005 (Training)",
    },
    {
      timestamp: "2026-02-28T16:00:00Z",
      user: "Operations Director",
      action: "CLOSED",
    },
  ],
};

/**
 * F/28-005: Training Record
 * 6 agents re-trained for ETH-Cedric project
 * Result of F/22-001 CAPA
 */
export const F28_005_Training: TraceableRecord = {
  id: "F/28-005",
  form: "F/28",
  number: "005",
  title: "Re-Training: Video Annotation Quality Standards (6 agents)",
  date: "2026-01-20",
  status: "CLOSED",
  isoClauses: ["7.2"],
  relatedRecords: [
    {
      form: "F/22",
      number: "001",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "10.2",
      timestamp: "2026-01-15T09:00:00Z",
      status: "ACTIVE",
    },
    {
      form: "Project",
      number: "ETH-Cedric",
      relationship: "IMPACTS",
      bidirectional: true,
      isoClause: "8.5",
      timestamp: "2026-01-20T10:00:00Z",
      status: "ACTIVE",
    },
    {
      form: "F/08",
      number: "004",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "7.2",
      timestamp: "2026-01-20T10:00:00Z",
      notes: "Agent qualification records",
      status: "ACTIVE",
    },
  ],
  auditTrail: [
    {
      timestamp: "2026-01-15T09:00:00Z",
      user: "Maria Magdy (Trainer)",
      action: "CREATED",
    },
    {
      timestamp: "2026-01-20T15:00:00Z",
      user: "Maria Magdy",
      action: "UPDATED",
      field: "competencyAssessment",
      newValue: "Passed - 6/6 agents",
    },
    {
      timestamp: "2026-01-20T16:00:00Z",
      user: "Maria Magdy",
      action: "CLOSED",
    },
  ],
};

/**
 * Risk-R-012: Systemic Training Gap
 * Identified through F/22-001 CAPA
 */
export const Risk_R012: TraceableRecord = {
  id: "Risk-R-012",
  form: "Risk",
  number: "R-012",
  title: "Training Deficiency in Video Annotation Quality Control",
  date: "2026-01-12",
  status: "CLOSED",
  isoClauses: ["6.1", "8.7"],
  relatedRecords: [
    {
      form: "F/22",
      number: "001",
      relationship: "MATERIALIZES_RISK",
      bidirectional: true,
      isoClause: "10.2",
      timestamp: "2026-01-12T11:00:00Z",
      status: "ACTIVE",
    },
    {
      form: "F/48",
      number: "005",
      relationship: "UPDATES_PROCEDURE",
      bidirectional: true,
      isoClause: "7.5",
      timestamp: "2026-01-15T14:00:00Z",
      notes: "Training checklist updated",
      status: "ACTIVE",
    },
  ],
  auditTrail: [
    {
      timestamp: "2026-01-12T11:00:00Z",
      user: "Quality Manager",
      action: "CREATED",
    },
    {
      timestamp: "2026-01-25T10:00:00Z",
      user: "Quality Manager",
      action: "UPDATED",
      field: "treatmentStatus",
      newValue: "Treatment Effective",
    },
    {
      timestamp: "2026-03-01T09:00:00Z",
      user: "Quality Manager",
      action: "CLOSED",
    },
  ],
};

/**
 * F/21-002: Management Review (February 2026)
 * Includes ETH complaint status
 */
export const F21_002_Review: TraceableRecord = {
  id: "F/21-002",
  form: "F/21",
  number: "002",
  title: "Management Review - February 2026",
  date: "2026-02-15",
  status: "CLOSED",
  isoClauses: ["9.3.2"],
  relatedRecords: [
    {
      form: "F/22",
      number: "001",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "10.2",
      timestamp: "2026-02-01T10:00:00Z",
      notes: "CAPA initiation reviewed",
      status: "ACTIVE",
    },
    {
      form: "F/09",
      number: "001",
      relationship: "REFERENCES",
      bidirectional: false,
      isoClause: "9.1.2",
      timestamp: "2026-02-01T10:30:00Z",
      notes: "Customer complaint register status",
      status: "ACTIVE",
    },
  ],
  auditTrail: [
    {
      timestamp: "2026-02-01T09:00:00Z",
      user: "Operations Director",
      action: "CREATED",
    },
    {
      timestamp: "2026-02-15T14:00:00Z",
      user: "Eman Farid",
      action: "CLOSED",
      notes: "Review completed with action items",
    },
  ],
};

/**
 * F/21-003: Management Review (March 2026)
 * CAPA closure reviewed
 */
export const F21_003_Review: TraceableRecord = {
  id: "F/21-003",
  form: "F/21",
  number: "003",
  title: "Management Review - March 2026",
  date: "2026-03-15",
  status: "CLOSED",
  isoClauses: ["9.3.2"],
  relatedRecords: [
    {
      form: "F/22",
      number: "001",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "10.2",
      timestamp: "2026-03-01T10:00:00Z",
      notes: "CAPA closure and effectiveness verified",
      status: "ACTIVE",
    },
    {
      form: "F/28",
      number: "005",
      relationship: "REFERENCES",
      bidirectional: false,
      isoClause: "7.2",
      timestamp: "2026-03-01T10:30:00Z",
      notes: "Training completion verified",
      status: "ACTIVE",
    },
  ],
  auditTrail: [
    {
      timestamp: "2026-03-01T09:00:00Z",
      user: "Operations Director",
      action: "CREATED",
    },
    {
      timestamp: "2026-03-15T14:00:00Z",
      user: "Eman Farid",
      action: "CLOSED",
    },
  ],
};

/**
 * F/50-001: Customer Property Damage
 * Customer property affected by ETH complaint
 */
export const F50_001_Property: TraceableRecord = {
  id: "F/50-001",
  form: "F/50",
  number: "001",
  title: "Customer Property Monitoring - ETH Damage Log",
  date: "2026-01-10",
  status: "CLOSED",
  isoClauses: ["8.5.3"],
  relatedRecords: [
    {
      form: "F/09",
      number: "001",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "8.7",
      timestamp: "2026-01-10T14:35:00Z",
      status: "ACTIVE",
    },
    {
      form: "Project",
      number: "ETH",
      relationship: "IMPACTS",
      bidirectional: true,
      isoClause: "8.5",
      timestamp: "2026-01-10T14:40:00Z",
      status: "ACTIVE",
    },
  ],
  auditTrail: [
    {
      timestamp: "2026-01-10T14:35:00Z",
      user: "Ahmed Khaled",
      action: "CREATED",
    },
    {
      timestamp: "2026-03-15T10:00:00Z",
      user: "Operations Director",
      action: "CLOSED",
      notes: "No further damage incidents",
    },
  ],
};

/**
 * Project-ETH: ETH Main Project
 */
export const Project_ETH: TraceableRecord = {
  id: "Project-ETH",
  form: "Project",
  number: "ETH",
  title: "ETH - AI Model Testing (15 agents)",
  date: "2026-02-01",
  status: "COMPLETED",
  isoClauses: ["8.1"],
  relatedRecords: [
    {
      form: "F/19",
      number: "007",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "8.2",
      timestamp: "2026-02-01T00:00:00Z",
      status: "ACTIVE",
    },
    {
      form: "F/50",
      number: "001",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "8.5.3",
      timestamp: "2026-01-10T14:40:00Z",
      status: "ACTIVE",
    },
  ],
  auditTrail: [
    {
      timestamp: "2026-02-01T00:00:00Z",
      user: "System",
      action: "CREATED",
    },
    {
      timestamp: "2026-03-05T12:00:00Z",
      user: "Operations Director",
      action: "CLOSED",
    },
  ],
};

/**
 * F/48-005: Customer Satisfaction (Monthly)
 * Updated after ETH complaint resolution
 */
export const F48_005_Satisfaction: TraceableRecord = {
  id: "F/48-005",
  form: "F/48",
  number: "005",
  title: "Customer Satisfaction Monitoring - March 2026",
  date: "2026-03-01",
  status: "CLOSED",
  isoClauses: ["9.1.2"],
  relatedRecords: [
    {
      form: "F/09",
      number: "001",
      relationship: "REFERENCES",
      bidirectional: false,
      isoClause: "9.1.2",
      timestamp: "2026-03-01T09:00:00Z",
      notes: "Complaint closure reflected in satisfaction",
      status: "ACTIVE",
    },
    {
      form: "F/21",
      number: "003",
      relationship: "TRIGGERS_REVIEW",
      bidirectional: true,
      isoClause: "9.3",
      timestamp: "2026-03-01T10:00:00Z",
      status: "ACTIVE",
    },
  ],
  auditTrail: [
    {
      timestamp: "2026-03-01T09:00:00Z",
      user: "Quality Manager",
      action: "CREATED",
    },
    {
      timestamp: "2026-03-15T14:00:00Z",
      user: "Quality Manager",
      action: "CLOSED",
    },
  ],
};

// ============================================================================
// B. REGISTRY ASSEMBLY
// ============================================================================

/** Complete record registry for ETH case testing */
export const ETH_CASE_REGISTRY: RecordRegistry = new Map([
  [F09_001_ETH_Complaint.id, F09_001_ETH_Complaint],
  [F22_001_CAPA.id, F22_001_CAPA],
  [F28_005_Training.id, F28_005_Training],
  [Risk_R012.id, Risk_R012],
  [F21_002_Review.id, F21_002_Review],
  [F21_003_Review.id, F21_003_Review],
  [F50_001_Property.id, F50_001_Property],
  [Project_ETH.id, Project_ETH],
  [F48_005_Satisfaction.id, F48_005_Satisfaction],
]);

// ============================================================================
// C. TEST EXPECTATIONS
// ============================================================================

/**
 * Expected Trace Chain Characteristics
 * 
 * Starting Point: F/09-001
 * Expected Chain:
 *   F/09-001 → F/22-001 → F/28-005
 *                         → Risk-R-012
 *                         → F/21-002
 *                         → F/21-003
 *            → F/50-001 → Project-ETH
 * 
 * Stats:
 * - Total Records: 9
 * - Max Depth: 2
 * - ISO Clauses Covered: 6.1, 7.2, 7.5, 8.5, 8.5.3, 8.7, 9.1.2, 9.3.2, 10.2
 * - Broken Links: 0
 * - Clicks to Full Chain: 1 (View Traceability)
 */

export const ETH_CASE_EXPECTATIONS = {
  totalRecords: 9,
  maxDepth: 2,
  expectedClauses: [
    "6.1",
    "7.2",
    "7.5",
    "8.1",
    "8.2",
    "8.5",
    "8.7",
    "9.1.2",
    "9.3.2",
    "10.2",
  ],
  brokenLinks: 0,
  clicksToView: 1, // Click "View Traceability" on F/09-001
  expectedClosureConditions: {
    F09_001: ["F/22-001 must be CLOSED"],
    F22_001: ["F/28-005 must be CLOSED", "F/21-003 must be CLOSED"],
    F28_005: [], // No dependencies
  },
};

// ============================================================================
// D. ADDITIONAL TEST CASES
// ============================================================================

/**
 * Test Case 2: BatFast Project - No Complaints
 * Expected: Clean trace with Project → F/19 → F/28
 */
export const BatFast_Case: TraceableRecord = {
  id: "Project-BatFast",
  form: "Project",
  number: "BatFast",
  title: "BatFast - Image/Video Annotation (5 agents)",
  date: "2026-02-01",
  status: "COMPLETED",
  isoClauses: ["8.1"],
  relatedRecords: [
    {
      form: "F/19",
      number: "001",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "8.2",
      timestamp: "2026-02-01T00:00:00Z",
      status: "ACTIVE",
    },
    {
      form: "F/28",
      number: "009",
      relationship: "REFERENCES",
      bidirectional: true,
      isoClause: "7.2",
      timestamp: "2026-02-01T00:00:00Z",
      status: "ACTIVE",
    },
  ],
  auditTrail: [],
};

/**
 * Test Case 3: Broken Link Scenarios
 * Purpose: Test orphan detection UI
 */
export const BrokenLink_Test: TraceableRecord = {
  id: "F/09-999",
  form: "F/09",
  number: "999",
  title: "Test Complaint with Broken Links",
  date: "2026-05-01",
  status: "OPEN",
  isoClauses: ["10.2"],
  relatedRecords: [
    {
      form: "F/22",
      number: "999", // This record does NOT exist in registry
      relationship: "TRIGGERS",
      bidirectional: true,
      isoClause: "10.2",
      timestamp: "2026-05-01T00:00:00Z",
      status: "PENDING", // Will be flagged as broken
    },
  ],
  auditTrail: [],
};
