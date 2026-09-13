/**
 * KNEE-AI 3.3 — Display Labels
 *
 * Separate display labels from API keys.
 * API keys in constants.js must never be modified.
 * Display labels here can be adjusted for UI presentation.
 */

// Display-friendly names for the 12 findings
export const FINDING_DISPLAY_LABELS = {
  'ACL': 'ACL (Anterior Cruciate Ligament)',
  'MCL': 'MCL (Medial Collateral Ligament)',
  'Medial Meniscus': 'Medial Meniscus',
  'Lateral Meniscus': 'Lateral Meniscus',
  'Medial OA': 'Medial Osteoarthritis',
  'Lateral OA': 'Lateral Osteoarthritis',
  'PF OA': 'Patellofemoral Osteoarthritis',
  'Effusion': 'Joint Effusion',
  'Synovitis': 'Synovitis',
  "Baker's": "Baker's Cyst",
  'Contusion': 'Bone Contusion',
  'Fracture': 'Fracture',
};

// Short labels for compact UI
export const FINDING_SHORT_LABELS = {
  'ACL': 'ACL',
  'MCL': 'MCL',
  'Medial Meniscus': 'Med. Meniscus',
  'Lateral Meniscus': 'Lat. Meniscus',
  'Medial OA': 'Med. OA',
  'Lateral OA': 'Lat. OA',
  'PF OA': 'PF OA',
  'Effusion': 'Effusion',
  'Synovitis': 'Synovitis',
  "Baker's": "Baker's",
  'Contusion': 'Contusion',
  'Fracture': 'Fracture',
};

// Status display labels
export const STATUS_LABELS = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DRAFT: 'Draft',
  FINAL: 'Final',
};

// Format probability for display (0.8231 → "82.31%")
export function formatProbability(probability) {
  if (probability == null || isNaN(probability)) return '—';
  return `${(probability * 100).toFixed(2)}%`;
}
