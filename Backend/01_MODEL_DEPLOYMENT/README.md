# KNEE-AI 3.3 — MODEL DEPLOYMENT PACKAGE

BACKEND DEPLOYMENT BUNDLE
=========================

This package contains the frozen trained KNEE-AI 3.3 model
and the exact standalone inference module used to reproduce
the validated AI output.

------------------------------------------------------------
MODEL IDENTITY
------------------------------------------------------------

Model:
KNEE-AI 3.3

Architecture:
StandaloneFiveSliceEfficientNet

Backbone:
EfficientNet-B0

Input:
5 consecutive MRI slices

Input size:
224 x 224

Output:
12 abnormality probabilities

Study aggregation:
Mean probability across study windows

------------------------------------------------------------
CHECKPOINT
------------------------------------------------------------

File:
best_5slice_model.pth

SHA256:
ac59d8ce17a0b35c15189d691f7c6aa828f31a3dfe14601a02036a6c3b892a82

This checkpoint is the validated KNEE-AI 3.3 champion model.

DO NOT replace or modify the checkpoint without creating
a new model version and repeating the validation process.

------------------------------------------------------------
EXACT OUTPUT ORDER
------------------------------------------------------------

1. ACL
2. MCL
3. Medial Meniscus
4. Lateral Meniscus
5. Medial OA
6. Lateral OA
7. PF OA
8. Effusion
9. Synovitis
10. Baker's
11. Contusion
12. Fracture

DO NOT reorder, rename, add, or remove these outputs.

------------------------------------------------------------
MRI SERIES SELECTION
------------------------------------------------------------

Eligible series:

Fluid_Sensitive == 1
AND
Fat_Suppression == 1

------------------------------------------------------------
WINDOW GENERATION
------------------------------------------------------------

Slices are ordered by InstanceNumber ascending.

Five consecutive slices form one inference window.

Study-level prediction is the mean probability across
all evaluated windows.

------------------------------------------------------------
PREPROCESSING
------------------------------------------------------------

- DICOM pixel array -> float32
- MONOCHROME1 inversion when applicable
- 1st-99th percentile robust normalization
- clipping
- resize to 224 x 224
- bilinear interpolation
- 5-slice input
- learned 5 -> 3 slice projection
- EfficientNet-B0

------------------------------------------------------------
INFERENCE MODULE
------------------------------------------------------------

knee_ai_inference.py

The module contains the frozen inference implementation.

The backend should call this module rather than reimplementing
the preprocessing or model architecture independently.

------------------------------------------------------------
CLINICAL SAFETY
------------------------------------------------------------

The model provides AI-assisted abnormality identification.

It does NOT provide autonomous diagnosis.

There is NO validated clinical threshold.

0.50 must NOT be treated as a clinical diagnostic threshold.

Radiologist review is required.

AI probabilities must be preserved exactly by the backend.

The backend must not convert probabilities into diagnoses.

------------------------------------------------------------
BACKEND INTEGRATION
------------------------------------------------------------

Expected backend flow:

Backend
   |
   v
Load study
   |
   v
KNEE-AI 3.3 inference
   |
   v
12 probabilities
   |
   v
Radiologist review
   |
   v
Approved findings
   |
   v
LLM report generation

The backend integration contract is provided separately
in KNEE_AI_FINAL_TEAM_HANDOFF.zip.

------------------------------------------------------------
FILES
------------------------------------------------------------

best_5slice_model.pth
    Frozen trained model weights.

knee_ai_inference.py
    Exact standalone inference implementation.

README.md
    This deployment documentation.

------------------------------------------------------------
IMPORTANT
------------------------------------------------------------

This is a deployment package for the BACKEND/AI integration.

Frontend does NOT need this .pth file.

LLM does NOT need this .pth file.

Do not expose the checkpoint to the frontend.

Do not send the checkpoint or internal model files to the LLM.

------------------------------------------------------------
VERSION STATUS
------------------------------------------------------------

KNEE-AI 3.3
FROZEN FOR DEPLOYMENT

Checkpoint SHA256 verified:
YES

