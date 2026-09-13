# KNEE-AI 3.3 — COMPLETE BACKEND AI PACKAGE

This is the complete AI-side package for the Backend developer.

It contains the frozen KNEE-AI 3.3 model, exact inference module,
live Grad-CAM engine, backend contracts, golden case, validation
evidence and integration documentation.

## Model

KNEE-AI 3.3
StandaloneFiveSliceEfficientNet
EfficientNet-B0
5-slice context
224 x 224 input
12 abnormality outputs

The checkpoint is the authoritative trained model.

Do not modify model weights, preprocessing, architecture,
slice context, class order or study-level aggregation.

## AI endpoint

POST /api/v1/ai/analyze

The Backend must preserve all 12 probability values.

AI probabilities are not final diagnoses.

There is no validated clinical threshold.

Do not introduce a 0.50 automatic diagnostic rule.

## Grad-CAM

Live implementation:

02_GRADCAM/knee_ai_gradcam.py

Target layer:

backbone.features.8.0

Input:

[1,5,224,224]

Output:

[224,224]

Grad-CAM is class-specific and supports all 12 abnormalities.

Grad-CAM is an explanation only. It does not prove pathology,
replace radiologist review, or create a diagnosis.

## Clinical workflow

MRI
-> KNEE-AI 3.3
-> 12 probabilities
-> Radiologist review
-> Optional Grad-CAM
-> Approved findings
-> LLM draft report
-> Radiologist final approval

## Backend endpoints

POST /api/v1/ai/analyze
POST /api/v1/radiologist/review
POST /api/v1/report/generate
POST /api/v1/report/final-approval

All 12 AI findings require explicit radiologist review.

Only approved findings proceed to the LLM.

Final reports require explicit radiologist approval.

## Golden case

The canonical integration case expects:

3 eligible series
44 inference windows
12 AI outputs
6 approved findings
6 rejected findings

## Package rule

This package is the complete AI-side Backend handoff.

After receiving this package, Backend does not need the separate
model deployment ZIP or separate Grad-CAM ZIP.

The Backend developer builds the application/API around these
frozen components.
