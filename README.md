Kneex

Kneex is an AI-assisted knee MRI analysis and radiologist review platform using KNEE-AI 3.3, Grad-CAM, and AI-assisted report generation.

Overview

Kneex processes eligible knee MRI studies, generates 12 independent abnormality probabilities, provides class-specific Grad-CAM explanations, supports radiologist review, and generates draft reports using approved findings.

Features

Knee MRI/DICOM study management

KNEE-AI 3.3 inference

12 abnormality predictions

Class-specific Grad-CAM

Patient and clinical context

Radiologist review workflow

AI-assisted draft reports

Draft/final report lifecycle

Authentication and database persistence

Architecture

Kneex Frontend
      ↓
Backend API
      ├── Database / MRI Storage
      ├── KNEE-AI 3.3 → 12 Probabilities
      ├── Grad-CAM
      └── LLM → Draft Report
                ↓
        Radiologist Review
                ↓
          Final Approval
                ↓
          Final Report

Tech Stack

React + Vite

JavaScript/CSS

Python/PyTorch

EfficientNet-B0

KNEE-AI 3.3

Grad-CAM

REST API

Project database

Project LLM/report service

KNEE-AI 3.3

Architecture: StandaloneFiveSliceEfficientNet

Backbone: EfficientNet-B0

Input: 5 consecutive MRI slices

Size: 224 × 224

Output: 12 independent probabilities

Aggregation: mean probability across all study windows

Checkpoint: best_5slice_model.pth

Findings

ACL

MCL

Medial Meniscus

Lateral Meniscus

Medial OA

Lateral OA

PF OA

Effusion

Synovitis

Baker's

Contusion

Fracture

MRI Pipeline

DICOM
→ MONOCHROME1 handling
→ 1st–99th percentile normalization
→ 224×224 resize
→ Fluid_Sensitive=1 AND Fat_Suppression=1
→ InstanceNumber ascending
→ 5-slice windows, stride 1
→ learned 5→3 projection
→ EfficientNet-B0
→ 12 probabilities
→ study-level mean

The frontend does not perform MRI preprocessing or model inference. The backend executes the model.

Grad-CAM

Grad-CAM provides class-specific AI explanations from the actual inference window.

Model: KNEE-AI 3.3

Target layer: backbone.features.8.0

Heatmap: 224 × 224

Normalization: 0–1

Grad-CAM is an AI explanation, not ground truth or a diagnosis.

Workflow

Login
→ Study
→ Patient + Clinical Context
→ MRI
→ AI Analysis
→ 12 Findings
→ Grad-CAM
→ Radiologist Review
→ Save Review
→ LLM Draft
→ Draft Review
→ Final Approval
→ Final Report

Finding status: PENDING / APPROVED / REJECTED

Report status: DRAFT / FINAL

Only approved findings are sent to report generation.

API

Method

Endpoint

Purpose

POST

/api/v1/ai/analyze

Run MRI AI analysis

POST

/api/v1/radiologist/review

Save review

POST

/api/v1/report/generate

Generate draft

POST

/api/v1/report/final-approval

Final approval

The frontend uses the actual backend contracts and does not duplicate AI or workflow logic.

Installation

git clone <repository-url>
cd <project-directory>

Frontend

cd frontend
npm install
npm run dev

Backend

pip install -r requirements.txt

Start the backend using the repository's configured entry point.

Environment Variables

Use the variables required by the repository. Example:

VITE_API_URL=
DATABASE_URL=
LLM_API_KEY=

Never commit secrets or API keys.

Real Integration

Kneex uses runtime data throughout the clinical workflow.

MRI
→ Backend
→ KNEE-AI 3.3
→ Real probabilities
→ Grad-CAM
→ Radiologist review
→ Approved findings
→ LLM
→ DRAFT
→ Backend approval
→ FINAL

Clinical results must never be hardcoded or silently replaced with mock data.

Testing

Integration testing covers:

MRI and series selection

5-slice windows

KNEE-AI inference

12 outputs

Study aggregation

Grad-CAM

Review persistence

Approved-finding filtering

LLM report generation

Final approval

Golden Case

Used for validation only:

Eligible series: 3

Windows: 44

Outputs: 12

Review: 6 APPROVED + 6 REJECTED

Report initially: DRAFT

Final approval initially: PENDING

Grad-CAM must not change prediction

Golden Case results must not be hardcoded into production.

Screenshots

Add screenshots under:

docs/screenshots/
├── dashboard.png
├── study-details.png
├── mri-analysis.png
├── gradcam.png
├── radiologist-review.png
└── report.png

Limitations

Kneex is an AI-assisted clinical support application. AI probabilities and Grad-CAM explanations should be reviewed by qualified clinicians and should not replace clinical judgment.

Contributors

Add project contributors and responsibilities here.

License

Add the project's chosen license here.
