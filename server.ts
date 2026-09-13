import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory mock studies store
const GOLDEN_CASE_ID = "1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260";

const GOLDEN_CASE_PROBABILITIES: Record<string, number> = {
  ACL: 0.0768398568034172,
  MCL: 0.21053840219974518,
  "Medial Meniscus": 0.5337309241294861,
  "Lateral Meniscus": 0.9094741344451904,
  "Medial OA": 0.9076368808746338,
  "Lateral OA": 0.8252654671669006,
  "PF OA": 0.9420368075370789,
  Effusion: 0.35206925868988037,
  Synovitis: 0.6673381328582764,
  "Baker's": 0.471786767244339,
  Contusion: 0.05063483491539955,
  Fracture: 0.438851922750473,
};

const GRADCAM_DATA: Record<string, any> = {
  ACL: {
    class_index: 0,
    abnormality: "ACL",
    probability: 0.25464966893196106,
    plane: "Coronal",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.40734206102458723096154687147390476697",
    window_index: 0,
    instance_numbers: [1, 2, 3, 4, 5],
    overlay_url: "/visualizations/00_ACL_overlay.png",
  },
  MCL: {
    class_index: 1,
    abnormality: "MCL",
    probability: 0.7720101475715637,
    plane: "Sagittal",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.12343110195036213483454091715412333772",
    window_index: 7,
    instance_numbers: [8, 9, 10, 11, 12],
    overlay_url: "/visualizations/01_MCL_overlay.png",
  },
  "Medial Meniscus": {
    class_index: 2,
    abnormality: "Medial Meniscus",
    probability: 0.8420864343643188,
    plane: "Sagittal",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.12343110195036213483454091715412333772",
    window_index: 6,
    instance_numbers: [7, 8, 9, 10, 11],
    overlay_url: "/visualizations/02_Medial_Meniscus_overlay.png",
  },
  "Lateral Meniscus": {
    class_index: 3,
    abnormality: "Lateral Meniscus",
    probability: 0.9979598522186279,
    plane: "Axial",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.13821229744997220641575291927426543265",
    window_index: 3,
    instance_numbers: [4, 5, 6, 7, 8],
    overlay_url: "/visualizations/03_Lateral_Meniscus_overlay.png",
  },
  "Medial OA": {
    class_index: 4,
    abnormality: "Medial OA",
    probability: 0.998195230960846,
    plane: "Axial",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.13821229744997220641575291927426543265",
    window_index: 4,
    instance_numbers: [5, 6, 7, 8, 9],
    overlay_url: "/visualizations/04_Medial_OA_overlay.png",
  },
  "Lateral OA": {
    class_index: 5,
    abnormality: "Lateral OA",
    probability: 0.9984326958656311,
    plane: "Axial",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.13821229744997220641575291927426543265",
    window_index: 3,
    instance_numbers: [4, 5, 6, 7, 8],
    overlay_url: "/visualizations/05_Lateral_OA_overlay.png",
  },
  "PF OA": {
    class_index: 6,
    abnormality: "PF OA",
    probability: 0.998815655708313,
    plane: "Axial",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.13821229744997220641575291927426543265",
    window_index: 4,
    instance_numbers: [5, 6, 7, 8, 9],
    overlay_url: "/visualizations/06_PF_OA_overlay.png",
  },
  Effusion: {
    class_index: 7,
    abnormality: "Effusion",
    probability: 0.7456693649291992,
    plane: "Sagittal",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.12343110195036213483454091715412333772",
    window_index: 11,
    instance_numbers: [12, 13, 14, 15, 16],
    overlay_url: "/visualizations/07_Effusion_overlay.png",
  },
  Synovitis: {
    class_index: 8,
    abnormality: "Synovitis",
    probability: 0.963236391544342,
    plane: "Axial",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.13821229744997220641575291927426543265",
    window_index: 4,
    instance_numbers: [5, 6, 7, 8, 9],
    overlay_url: "/visualizations/08_Synovitis_overlay.png",
  },
  "Baker's": {
    class_index: 9,
    abnormality: "Baker's",
    probability: 0.9499605894088745,
    plane: "Sagittal",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.12343110195036213483454091715412333772",
    window_index: 16,
    instance_numbers: [17, 18, 19, 20, 21],
    overlay_url: "/visualizations/09_Bakers_overlay.png",
  },
  Contusion: {
    class_index: 10,
    abnormality: "Contusion",
    probability: 0.2505582869052887,
    plane: "Coronal",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.40734206102458723096154687147390476697",
    window_index: 11,
    instance_numbers: [12, 13, 14, 15, 16],
    overlay_url: "/visualizations/10_Contusion_overlay.png",
  },
  Fracture: {
    class_index: 11,
    abnormality: "Fracture",
    probability: 0.7609866261482239,
    plane: "Axial",
    series_instance_uid: "1.2.826.0.1.3680043.8.498.13821229744997220641575291927426543265",
    window_index: 11,
    instance_numbers: [12, 13, 14, 15, 16],
    overlay_url: "/visualizations/11_Fracture_overlay.png",
  },
};

const studiesStore = [
  {
    id: GOLDEN_CASE_ID,
    patient: {
      patient_id: "DEMO-PATIENT-001",
      display_id: "KNEE-DEMO-001",
      age: 42,
      sex: "Female",
      clinical_context: {
        symptoms: "Persistent knee pain with activity and intermittent stiffness.",
        medical_history: "No additional relevant history provided for this demonstration.",
        clinical_notes: "MRI requested for evaluation of persistent knee symptoms.",
      },
    },
    created_at: "2026-09-12T14:36:00Z",
    ai_status: "COMPLETED",
    review_status: "PENDING",
    report_status: null,
    series_count: 3,
    windows_count: 44,
  },
  {
    id: "STUDY-DEMO-002",
    patient: {
      patient_id: "DEMO-PATIENT-002",
      display_id: "KNEE-DEMO-002",
      age: 58,
      sex: "Male",
      clinical_context: {
        symptoms: "Knee swelling and restricted range of motion.",
        medical_history: "Previous meniscal surgery 5 years ago.",
        clinical_notes: "Follow-up MRI for post-surgical evaluation.",
      },
    },
    created_at: "2026-09-13T09:15:00Z",
    ai_status: "PENDING",
    review_status: "PENDING",
    report_status: null,
    series_count: 0,
    windows_count: 0,
  },
  {
    id: "STUDY-DEMO-003",
    patient: {
      patient_id: "DEMO-PATIENT-003",
      display_id: "KNEE-DEMO-003",
      age: 35,
      sex: "Female",
      clinical_context: {
        symptoms: "Acute knee injury during sports activity.",
        medical_history: "No prior knee conditions.",
        clinical_notes: "MRI to evaluate ligament integrity.",
      },
    },
    created_at: "2026-09-13T11:30:00Z",
    ai_status: "PENDING",
    review_status: "PENDING",
    report_status: null,
    series_count: 0,
    windows_count: 0,
  },
];

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "KNEE-AI 3.3 Backend" });
});

// GET /api/v1/studies
app.get("/api/v1/studies", (_req, res) => {
  res.json(studiesStore);
});

// GET /api/v1/studies/:studyId
app.get("/api/v1/studies/:studyId", (req, res) => {
  const { studyId } = req.params;
  const study = studiesStore.find((s) => s.id === studyId);
  if (study) {
    return res.json(study);
  }
  // If not found, synthesize a fallback study
  res.json({
    id: studyId,
    patient: {
      patient_id: `PATIENT-${studyId.slice(-6)}`,
      display_id: `KNEE-CASE-${studyId.slice(-4)}`,
      age: 45,
      sex: "Female",
      clinical_context: {
        symptoms: "Knee pain during weight bearing activity.",
        medical_history: "No previous surgical intervention.",
        clinical_notes: "MRI requested for structural evaluation.",
      },
    },
    created_at: new Date().toISOString(),
    review_status: "PENDING",
  });
});

// POST /api/v1/upload
app.post("/api/v1/upload", (req, res) => {
  res.json({
    success: true,
    message: "MRI series DICOM files uploaded successfully",
    study_id: req.body?.study_id || GOLDEN_CASE_ID,
  });
});

// POST /api/v1/ai/analyze
app.post("/api/v1/ai/analyze", (req, res) => {
  const studyId = req.body?.study_id || GOLDEN_CASE_ID;
  res.json({
    success: true,
    study_id: studyId,
    model_version: "KNEE-AI 3.3",
    architecture: "StandaloneFiveSliceEfficientNet",
    series_evaluated: 3,
    windows_evaluated: 44,
    probabilities: GOLDEN_CASE_PROBABILITIES,
    requires_radiologist_review: true,
  });
});

// POST /api/v1/radiologist/review
app.post("/api/v1/radiologist/review", (req, res) => {
  const { study_id, findings } = req.body || {};
  res.json({
    success: true,
    study_id: study_id || GOLDEN_CASE_ID,
    message: "Radiologist review decisions recorded",
    findings_count: Array.isArray(findings) ? findings.length : 0,
  });
});

// POST /api/v1/gradcam/explain
app.post("/api/v1/gradcam/explain", (req, res) => {
  const { abnormality, class_index } = req.body || {};
  const data = (abnormality && GRADCAM_DATA[abnormality]) ||
    Object.values(GRADCAM_DATA).find((d: any) => d.class_index === class_index) ||
    GRADCAM_DATA["ACL"];

  res.json({
    ...data,
    heatmap: null,
  });
});

// POST /api/v1/report/generate
app.post("/api/v1/report/generate", async (req, res) => {
  const { study_id, findings, clinical_context } = req.body || {};
  const approvedFindings = Array.isArray(findings)
    ? findings.filter((f: any) => f.status === "APPROVED" || f.status === "approved")
    : [];

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are a clinical report drafting assistant for the KNEE-AI 3.3 system.
Your role is ONLY to generate a structured DRAFT knee MRI report.
The information supplied to you has already been reviewed and approved by a radiologist.
You are NOT the diagnostic engine.

STUDY ID:
${study_id || GOLDEN_CASE_ID}

RADIOLOGIST-APPROVED FINDINGS:
${JSON.stringify(approvedFindings)}

AUTHORIZED CLINICAL CONTEXT:
${typeof clinical_context === "object" ? JSON.stringify(clinical_context) : clinical_context || "None provided"}

STRICT RULES:
1. Use ONLY the radiologist-approved findings provided above.
2. Do NOT include rejected findings.
3. Do NOT infer rejected findings from probabilities.
4. Do NOT interpret the raw MRI.
5. Do NOT independently decide whether an AI prediction is correct.
6. Do NOT create new abnormalities.
7. Do NOT invent clinical information.
8. Do NOT create a diagnosis that is not supported by the approved findings.
9. Do NOT provide treatment recommendations.
10. Do NOT recommend medicines, surgery, exercises, physiotherapy, or other treatment.
11. Preserve the meaning of the approved findings.
12. Clearly separate Findings and Impression.
13. The report MUST have status DRAFT.
14. The report MUST state that radiologist review and final approval are required.
15. Never present the report as a final clinical report.

OUTPUT: Return ONLY valid JSON with this schema:
{
  "title": "Knee MRI Report",
  "study_id": "${study_id || GOLDEN_CASE_ID}",
  "status": "DRAFT",
  "findings": ["..."],
  "impression": "...",
  "note": "This is an AI-generated draft based on radiologist-approved information and requires radiologist review and final approval."
}`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      const parsed = JSON.parse(text);
      return res.json({
        status: "DRAFT",
        report: parsed,
        final_approval: "PENDING",
      });
    } catch (err) {
      console.warn("Gemini generation failed, falling back to deterministic draft:", err);
    }
  }

  // Schema-compliant draft fallback
  const findingsList = approvedFindings.length > 0
    ? approvedFindings.map((f: any) => `${f.abnormality} abnormality identified and approved during radiologist review.`)
    : ["No abnormal findings approved for inclusion in this study."];

  const impression = approvedFindings.length > 0
    ? `The approved findings demonstrate abnormalities (${approvedFindings.map((f: any) => f.abnormality).join(", ")}) requiring clinical correlation.`
    : "No significant abnormalities confirmed upon radiologist review.";

  res.json({
    status: "DRAFT",
    report: {
      title: "Knee MRI Report",
      study_id: study_id || GOLDEN_CASE_ID,
      status: "DRAFT",
      findings: findingsList,
      impression: impression,
      note: "This is an AI-generated draft based on radiologist-approved information and requires radiologist review and final approval.",
      final_approval: "PENDING",
    },
    final_approval: "PENDING",
  });
});

// POST /api/v1/report/final-approval
app.post("/api/v1/report/final-approval", (req, res) => {
  const { study_id } = req.body || {};
  res.json({
    success: true,
    study_id: study_id || GOLDEN_CASE_ID,
    status: "FINAL",
    approval_timestamp: new Date().toISOString(),
    message: "Report approved and finalized by attending radiologist",
  });
});

// POST /api/v1/patient/explanation
app.post("/api/v1/patient/explanation", async (req, res) => {
  const { study_id, findings, clinical_context } = req.body || {};
  const approvedFindings = Array.isArray(findings)
    ? findings.filter((f: any) => f.status === "APPROVED" || f.status === "approved")
    : [];

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are a patient-friendly explanation assistant for the KNEE-AI 3.3 system.
Your task is to explain ONLY information that has already been approved by a radiologist.
You are NOT the diagnostic engine.

STUDY ID:
${study_id || GOLDEN_CASE_ID}

RADIOLOGIST-APPROVED FINDINGS:
${JSON.stringify(approvedFindings)}

AUTHORIZED CLINICAL CONTEXT:
${typeof clinical_context === "object" ? JSON.stringify(clinical_context) : clinical_context || "None provided"}

STRICT RULES:
1. Use ONLY the approved findings and authorized clinical context.
2. Do NOT mention rejected findings.
3. Do NOT infer or guess additional abnormalities.
4. Do NOT interpret the raw MRI.
5. Do NOT create a new diagnosis.
6. Do NOT provide treatment recommendations.
7. Explain medical terminology in simple language where appropriate.
8. Avoid unnecessary fear or alarm.
9. Clearly state that the explanation is based on radiologist-approved information.
10. Encourage the patient to discuss the results with their doctor.

OUTPUT: Return ONLY valid JSON:
{
  "title": "Patient-Friendly MRI Explanation",
  "study_id": "${study_id || GOLDEN_CASE_ID}",
  "approved_findings": "...",
  "what_this_means": "...",
  "important_note": "This explanation is based on radiologist-approved information. Please discuss your MRI results with your doctor for clinical interpretation and next steps."
}`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err) {
      console.warn("Gemini patient explanation failed, using fallback:", err);
    }
  }

  const findingNames = approvedFindings.map((f: any) => f.abnormality).join(", ") || "No abnormal findings";
  res.json({
    title: "Patient-Friendly MRI Explanation",
    study_id: study_id || GOLDEN_CASE_ID,
    approved_findings: findingNames,
    what_this_means: `Your knee MRI scan was reviewed by a radiologist. The scan showed signs related to ${findingNames}. This helps your healthcare team understand any swelling, wear, or tissue changes in your knee joint.`,
    important_note: "This explanation is based on radiologist-approved information. Please discuss your MRI results with your doctor for clinical interpretation and next steps.",
  });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE (DEV) / STATIC SERVING (PROD)
// -------------------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
