import axios from 'axios';
import { AI_ACTION } from '../utils/constants';

/**
 * KNEE-AI 3.3 — API Service Layer
 *
 * Central Axios instance and service functions.
 * All backend communication goes through this module.
 *
 * Source of truth for endpoints:
 * - Backend/03_BACKEND_CONTRACTS/KNEE_AI_BACKEND_ADAPTER_CONTRACT.json
 * - Backend/README_FIRST.md
 * - LLM/api.py
 */

// Central Axios instance — uses VITE_API_URL from .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 min — AI analysis can be slow
});

// Request interceptor: attach auth token if present
api.interceptors.request.use((config) => {
  const user = sessionStorage.getItem('kneeai_user');
  if (user) {
    // TODO: Replace with real JWT token when backend auth is implemented
    config.headers['X-User-Role'] = JSON.parse(user).role;
  }
  return config;
});

// Response interceptor: handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not expose raw stack traces to UI
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

/* ============================================================
   AUTH — TODO: Backend auth endpoint unknown
   ============================================================ */

/**
 * TODO: Integrate with real backend authentication.
 * Endpoint and payload not documented in current contracts.
 */
export async function loginUser(credentials) {
  // TODO: POST /api/v1/auth/login — endpoint not documented
  // For now, return mock success for demo
  return {
    success: true,
    user: {
      id: 'demo-radiologist',
      name: credentials.name || 'Dr. Radiologist',
      role: credentials.role || 'radiologist',
      email: credentials.email || '',
    },
  };
}

/* ============================================================
   STUDIES — TODO: Backend study list endpoint unknown
   ============================================================ */

/**
 * TODO: GET /api/v1/studies — endpoint not documented.
 * Expected to return list of studies for the current user.
 */
export async function fetchStudies() {
  // TODO: Replace with real endpoint when backend provides it
  const response = await api.get('/api/v1/studies');
  return response.data;
}

/**
 * TODO: GET /api/v1/studies/:studyId — endpoint not documented.
 * Expected to return full study details including patient info.
 */
export async function fetchStudyDetails(studyId) {
  // TODO: Replace with real endpoint when backend provides it
  const response = await api.get(`/api/v1/studies/${studyId}`);
  return response.data;
}

/* ============================================================
   MRI UPLOAD — TODO: Backend upload endpoint unknown
   ============================================================ */

/**
 * TODO: POST /api/v1/upload — endpoint not documented.
 * Frontend handles only file selection and upload UI.
 * Backend handles all DICOM processing.
 */
export async function uploadMRI(studyId, files, onProgress) {
  const formData = new FormData();
  formData.append('study_id', studyId);
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post('/api/v1/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percent);
      }
    },
  });
  return response.data;
}

/* ============================================================
   AI ANALYSIS — Confirmed contract
   POST /api/v1/ai/analyze
   Source: KNEE_AI_BACKEND_ADAPTER_CONTRACT.json
   ============================================================ */

/**
 * Request AI analysis from backend.
 *
 * Request: { study_id: string, action: "ANALYZE_KNEE_MRI" }
 * Response: { success, study_id, model_version, architecture,
 *             series_evaluated, windows_evaluated, probabilities,
 *             requires_radiologist_review }
 */
export async function analyzeStudy(studyId) {
  const response = await api.post('/api/v1/ai/analyze', {
    study_id: studyId,
    action: AI_ACTION,
  });
  return response.data;
}

/* ============================================================
   RADIOLOGIST REVIEW
   POST /api/v1/radiologist/review
   Source: README_FIRST.md (listed, exact payload unknown)
   ============================================================ */

/**
 * Submit radiologist review decisions for all 12 findings.
 *
 * TODO: Exact request/response schema not documented.
 * Using reasonable structure based on contract patterns.
 * Adapter to be updated when backend contract is confirmed.
 */
export async function submitRadiologistReview(studyId, findings) {
  // TODO: Confirm exact payload with backend team
  const response = await api.post('/api/v1/radiologist/review', {
    study_id: studyId,
    findings: findings.map((f) => ({
      abnormality: f.abnormality,
      probability: f.probability,
      status: f.status,
    })),
  });
  return response.data;
}

/* ============================================================
   REPORT GENERATION — Confirmed contract
   POST /api/v1/report/generate
   Source: LLM/api.py
   ============================================================ */

/**
 * Request draft report generation.
 *
 * Request: { study_id, findings: [{abnormality, probability, status}],
 *            clinical_context }
 * Response: { status: "DRAFT", report: {...}, final_approval: "PENDING" }
 */
export async function generateReport(studyId, findings, clinicalContext) {
  const response = await api.post('/api/v1/report/generate', {
    study_id: studyId,
    findings: findings,
    clinical_context: clinicalContext,
  });
  return response.data;
}

/* ============================================================
   FINAL APPROVAL
   POST /api/v1/report/final-approval
   Source: README_FIRST.md (listed, exact payload unknown)
   ============================================================ */

/**
 * Request final approval for a draft report.
 *
 * TODO: Exact request/response schema not documented.
 * Frontend requests approval; backend controls DRAFT→FINAL.
 */
export async function approveFinalReport(studyId) {
  // TODO: Confirm exact payload with backend team
  const response = await api.post('/api/v1/report/final-approval', {
    study_id: studyId,
    action: 'APPROVE',
  });
  return response.data;
}

/* ============================================================
   GRAD-CAM — Output schema confirmed, endpoint unknown
   Source: Backend/02_GRADCAM/KNEE_AI_GRADCAM_CONTRACT.json
   ============================================================ */

/**
 * Request Grad-CAM explanation for a specific abnormality.
 *
 * TODO: Exact endpoint path not documented.
 * Output schema confirmed: { abnormality, class_index, probability,
 *   plane, series_instance_uid, window_index, instance_numbers, heatmap }
 */
export async function fetchGradCAM(studyId, abnormality, classIndex) {
  // TODO: Confirm exact endpoint path with backend team
  const response = await api.post('/api/v1/gradcam/explain', {
    study_id: studyId,
    abnormality: abnormality,
    class_index: classIndex,
  });
  return response.data;
}

/* ============================================================
   PATIENT EXPLANATION — Confirmed contract
   POST /api/v1/patient/explanation
   Source: LLM/api.py
   ============================================================ */

/**
 * Request patient-friendly explanation.
 */
export async function fetchPatientExplanation(studyId, findings, clinicalContext) {
  const response = await api.post('/api/v1/patient/explanation', {
    study_id: studyId,
    findings: findings,
    clinical_context: clinicalContext,
  });
  return response.data;
}

export default api;
