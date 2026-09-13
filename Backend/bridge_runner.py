import os
import sys
import json
import torch
import numpy as np
import pandas as pd

# Add directories to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "Backend", "01_MODEL_DEPLOYMENT")
GRADCAM_DIR = os.path.join(BASE_DIR, "Backend", "02_GRADCAM")

sys.path.insert(0, MODEL_DIR)
sys.path.insert(0, GRADCAM_DIR)

from knee_ai_inference import analyze_study, StandaloneFiveSliceEfficientNet, ABNORMALITIES
from knee_ai_gradcam import KneeAIGradCAM

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No action specified"}))
        sys.exit(1)

    action = sys.argv[1]

    checkpoint_path = os.path.join(BASE_DIR, "Model", "best_5slice_model.pth")

    if action == "ANALYZE":
        study_id = sys.argv[2] if len(sys.argv) > 2 else ""
        study_root = sys.argv[3] if len(sys.argv) > 3 else ""
        csv_path = sys.argv[4] if len(sys.argv) > 4 else os.path.join(BASE_DIR, "Model", "five_slice_validation_index.csv")

        if not os.path.exists(checkpoint_path):
            print(json.dumps({"error": f"Model checkpoint not found at {checkpoint_path}"}))
            sys.exit(1)

        try:
            train_series_df = pd.read_csv(csv_path)
            result = analyze_study(
                study_id=study_id,
                study_root=study_root,
                train_series_df=train_series_df,
                checkpoint_path=checkpoint_path,
                device="cpu"
            )
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

    elif action == "GRADCAM":
        abnormality = sys.argv[2] if len(sys.argv) > 2 else "ACL"
        class_index = int(sys.argv[3]) if len(sys.argv) > 3 else 0
        
        # Load model and run sample gradcam check
        try:
            model = StandaloneFiveSliceEfficientNet(num_classes=12)
            checkpoint = torch.load(checkpoint_path, map_location="cpu")
            state_dict = checkpoint["state_dict"] if isinstance(checkpoint, dict) and "state_dict" in checkpoint else checkpoint
            model.load_state_dict(state_dict)
            model.eval()

            # Dummy slice tensor [1, 5, 224, 224] to verify Grad-CAM execution
            dummy_input = torch.randn(1, 5, 224, 224)
            cam_obj = KneeAIGradCAM(model)
            heatmap, prob = cam_obj.generate(dummy_input, class_index)
            cam_obj.close()

            result = {
                "success": True,
                "abnormality": abnormality,
                "class_index": class_index,
                "probability": float(prob),
                "cam_shape": list(heatmap.shape),
                "cam_min": float(heatmap.min()),
                "cam_max": float(heatmap.max())
            }
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)

if __name__ == "__main__":
    main()
