# KNEE-AI 3.3 — FINAL AI TEAM HANDOFF

This is the frozen AI integration package for KNEE-AI.

============================================================
MODEL
============================================================

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

Outputs:
12 abnormality probabilities

Checkpoint SHA256:

ac59d8ce17a0b35c15189d691f7c6aa828f31a3dfe14601a02036a6c3b892a82


============================================================
EXACT CLASS ORDER
============================================================

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

DO NOT rename or reorder these classes.


============================================================
MRI INPUT PIPELINE
============================================================

Eligible series:

Fluid_Sensitive == 1
AND
Fat_Suppression == 1

Slices:
InstanceNumber ascending

Window:
5 consecutive slices

Study output:
Mean probability across study windows


============================================================
PREPROCESSING
============================================================

- DICOM pixel array -> float32
- MONOCHROME1 inversion when applicable
- 1st-99th percentile robust normalization
- clipping
- resize to 224x224
- bilinear interpolation
- learned 5 -> 3 slice projection
- EfficientNet-B0


============================================================
VALIDATED PERFORMANCE
============================================================

Validation studies:
9

Validation windows:
844

Validation series:
27

Study-level Macro AUROC:

0.713624338624339

See 02_PERFORMANCE for the complete evidence.


============================================================
CLINICAL SAFETY
============================================================

The model provides AI-assisted abnormality identification.

It does NOT provide autonomous diagnosis.

There is NO validated clinical threshold.

0.50 is exploratory display only.

Radiologist review is required.

The LLM receives only radiologist-approved findings.

Final reports require explicit radiologist approval.


============================================================
BACKEND
============================================================

Primary endpoint:

POST /api/v1/ai/analyze

See 04_BACKEND for the frozen backend contract.


============================================================
GOLDEN CASE
============================================================

Canonical integration case:

05_GOLDEN_CASE/KNEE_AI_GOLDEN_CASE.json

Expected:

3 eligible series
44 windows
12 AI outputs


============================================================
TEAM RULE
============================================================

Treat this package as the frozen AI contract.

Do not change:

- model outputs
- class names
- class order
- probability semantics
- clinical threshold assumptions
- radiologist review requirement
- approved-only LLM gate

If another component needs a new field,
discuss it with the AI/model owner before changing the contract.
