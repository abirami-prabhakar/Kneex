/**
 * KNEE-AI 3.3 — Frozen Constants
 *
 * These constants are derived from the frozen AI contract.
 * DO NOT rename, reorder, or modify the AI_FINDINGS array.
 * Source: Backend/03_BACKEND_CONTRACTS/KNEE_AI_BACKEND_ADAPTER_CONTRACT.json
 */

// Exact class order from KNEE-AI 3.3 contract — DO NOT MODIFY
export const AI_FINDINGS = [
  'ACL',
  'MCL',
  'Medial Meniscus',
  'Lateral Meniscus',
  'Medial OA',
  'Lateral OA',
  'PF OA',
  'Effusion',
  'Synovitis',
  "Baker's",
  'Contusion',
  'Fracture',
];

// Finding review statuses
export const FINDING_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Report statuses
export const REPORT_STATUS = {
  DRAFT: 'DRAFT',
  FINAL: 'FINAL',
};

// Final approval statuses
export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
};

// AI analysis action (from frozen contract)
export const AI_ACTION = 'ANALYZE_KNEE_MRI';

// Model metadata (from contract — display only)
export const MODEL_INFO = {
  name: 'KNEE-AI',
  version: '3.3',
  architecture: 'StandaloneFiveSliceEfficientNet',
  backbone: 'EfficientNet-B0',
};

// Patient sex options (from patient schema)
export const SEX_OPTIONS = ['Female', 'Male', 'Other', 'Unknown'];

// User roles
export const ROLES = {
  RADIOLOGIST: 'radiologist',
  ORTHOPEDICIAN: 'orthopedician',
  PATIENT: 'patient',
};

// Total findings count
export const TOTAL_FINDINGS = 12;
