/**
 * KNEE-AI 3.3 — Mock Data Service
 *
 * TEMPORARY: Isolated mock data for UI testing when backend is unavailable.
 * Source: Backend/04_GOLDEN_CASE/KNEE_AI_GOLDEN_CASE.json
 *
 * DO NOT use in production when real APIs exist.
 * DO NOT treat test probabilities as diagnoses.
 * All findings still require radiologist review in the UI.
 */

import { AI_FINDINGS, FINDING_STATUS, REPORT_STATUS, APPROVAL_STATUS } from '../utils/constants';

// Golden Case study ID — for testing only
const GOLDEN_CASE_STUDY_ID =
  '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

// Golden Case probabilities — from KNEE_AI_GOLDEN_CASE.json
const GOLDEN_CASE_PROBABILITIES = {
  'ACL': 0.0768398568034172,
  'MCL': 0.21053840219974518,
  'Medial Meniscus': 0.5337309241294861,
  'Lateral Meniscus': 0.9094741344451904,
  'Medial OA': 0.9076368808746338,
  'Lateral OA': 0.8252654671669006,
  'PF OA': 0.9420368075370789,
  'Effusion': 0.35206925868988037,
  'Synovitis': 0.6673381328582764,
  "Baker's": 0.471786767244339,
  'Contusion': 0.05063483491539955,
  'Fracture': 0.438851922750473,
};

// Golden Case patient — from KNEE_AI_GOLDEN_CASE.json
const GOLDEN_CASE_PATIENT = {
  patient_id: 'DEMO-PATIENT-001',
  display_id: 'KNEE-DEMO-001',
  age: 42,
  sex: 'Female',
  clinical_context: {
    symptoms: 'Persistent knee pain with activity and intermittent stiffness.',
    medical_history:
      'No additional relevant history provided for this demonstration.',
    clinical_notes:
      'MRI requested for evaluation of persistent knee symptoms.',
  },
};

// Mock study list
export const MOCK_STUDIES = [
  {
    id: GOLDEN_CASE_STUDY_ID,
    patient: GOLDEN_CASE_PATIENT,
    created_at: '2026-09-12T14:36:00Z',
    ai_status: 'COMPLETED',
    review_status: 'PENDING',
    report_status: null,
    series_count: 3,
    windows_count: 44,
  },
  {
    id: 'STUDY-DEMO-002',
    patient: {
      patient_id: 'DEMO-PATIENT-002',
      display_id: 'KNEE-DEMO-002',
      age: 58,
      sex: 'Male',
      clinical_context: {
        symptoms: 'Knee swelling and restricted range of motion.',
        medical_history: 'Previous meniscal surgery 5 years ago.',
        clinical_notes: 'Follow-up MRI for post-surgical evaluation.',
      },
    },
    created_at: '2026-09-13T09:15:00Z',
    ai_status: 'PENDING',
    review_status: 'PENDING',
    report_status: null,
    series_count: 0,
    windows_count: 0,
  },
  {
    id: 'STUDY-DEMO-003',
    patient: {
      patient_id: 'DEMO-PATIENT-003',
      display_id: 'KNEE-DEMO-003',
      age: 35,
      sex: 'Female',
      clinical_context: {
        symptoms: 'Acute knee injury during sports activity.',
        medical_history: 'No prior knee conditions.',
        clinical_notes: 'MRI to evaluate ligament integrity.',
      },
    },
    created_at: '2026-09-13T11:30:00Z',
    ai_status: 'PENDING',
    review_status: 'PENDING',
    report_status: null,
    series_count: 0,
    windows_count: 0,
  },
];

/**
 * Mock AI analysis response — matches frozen contract schema.
 */
export function getMockAnalysisResult(studyId) {
  return {
    success: true,
    study_id: studyId,
    model_version: 'KNEE-AI 3.3',
    architecture: 'StandaloneFiveSliceEfficientNet',
    series_evaluated: 3,
    windows_evaluated: 44,
    probabilities: { ...GOLDEN_CASE_PROBABILITIES },
    requires_radiologist_review: true,
  };
}

/**
 * Build initial findings array from AI probabilities.
 * All findings start as PENDING — no automatic approval.
 */
export function buildFindingsFromProbabilities(probabilities) {
  return AI_FINDINGS.map((name, index) => ({
    abnormality: name,
    probability: probabilities[name] ?? 0,
    status: FINDING_STATUS.PENDING,
    class_index: index,
  }));
}

/**
 * Mock draft report — matches LLM report schema.
 */
export function getMockDraftReport(studyId, approvedFindings, clinicalContext) {
  return {
    status: REPORT_STATUS.DRAFT,
    report: {
      title: 'Knee MRI Report',
      study_id: studyId,
      status: REPORT_STATUS.DRAFT,
      findings: approvedFindings.map(
        (f) => `${f.abnormality} abnormality identified.`
      ),
      impression:
        'The approved findings demonstrate abnormalities requiring clinical correlation.',
      note: 'This is an AI-generated draft based on radiologist-approved information and requires radiologist review and final approval.',
      final_approval: APPROVAL_STATUS.PENDING,
    },
    final_approval: APPROVAL_STATUS.PENDING,
  };
}

const GRADCAM_OVERLAYS = {
  'ACL': '/visualizations/00_ACL_overlay.png',
  'MCL': '/visualizations/01_MCL_overlay.png',
  'Medial Meniscus': '/visualizations/02_Medial_Meniscus_overlay.png',
  'Lateral Meniscus': '/visualizations/03_Lateral_Meniscus_overlay.png',
  'Medial OA': '/visualizations/04_Medial_OA_overlay.png',
  'Lateral OA': '/visualizations/05_Lateral_OA_overlay.png',
  'PF OA': '/visualizations/06_PF_OA_overlay.png',
  'Effusion': '/visualizations/07_Effusion_overlay.png',
  'Synovitis': '/visualizations/08_Synovitis_overlay.png',
  "Baker's": '/visualizations/09_Bakers_overlay.png',
  'Contusion': '/visualizations/10_Contusion_overlay.png',
  'Fracture': '/visualizations/11_Fracture_overlay.png',
};

/**
 * Mock Grad-CAM response — matches backend output schema.
 * Heatmap is null in mock (no actual Grad-CAM computation in frontend).
 */
export function getMockGradCAMResult(studyId, abnormality, classIndex) {
  return {
    abnormality: abnormality,
    class_index: classIndex,
    probability: GOLDEN_CASE_PROBABILITIES[abnormality] ?? 0,
    plane: 'Sagittal',
    series_instance_uid: 'mock-series-001',
    window_index: 0,
    instance_numbers: [1, 2, 3, 4, 5],
    heatmap: null,
    overlay_url: GRADCAM_OVERLAYS[abnormality] || null,
  };
}

/**
 * Check if we should use mock data.
 * Returns true when VITE_USE_MOCK is set or backend is unreachable.
 */
export function shouldUseMock() {
  return import.meta.env.VITE_USE_MOCK === 'true';
}
