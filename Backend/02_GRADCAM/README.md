# KNEE-AI 3.3 — Grad-CAM Deployment

Validated class-specific Grad-CAM explainability layer.

Model: KNEE-AI 3.3
Architecture: StandaloneFiveSliceEfficientNet
Backbone: EfficientNet-B0
Input: [1,5,224,224]
Heatmap: [224,224]
Target layer: backbone.features.8.0

Grad-CAM does not modify model weights, probabilities,
preprocessing, architecture or study aggregation.

Grad-CAM is an explanation of model behavior.
It is not a diagnosis, segmentation, or proof of pathology.

Radiologist review remains mandatory.

The visualization examples contain one output for each
of the 12 KNEE-AI abnormalities.
