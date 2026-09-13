import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GOLDEN_CASE_PATH = os.path.join(BASE_DIR, "Backend", "05_AI_MODULE", "KNEE_AI_FINAL_AI_HANDOFF", "INTEGRATION", "KNEE_AI_GOLDEN_CASE.json")

def test_golden_case_assertions():
    print("=== RUNNING GOLDEN CASE INTEGRATION ASSERTIONS ===")
    assert os.path.exists(GOLDEN_CASE_PATH), f"Golden case file missing at {GOLDEN_CASE_PATH}"

    with open(GOLDEN_CASE_PATH, "r") as f:
        gc_data = json.load(f)

    # 1. Assert patient details
    patient = gc_data["patient"]
    assert patient["patient_id"] == "DEMO-PATIENT-001"
    assert patient["display_id"] == "KNEE-DEMO-001"
    print("[PASS] Patient Context Assertion Verified")

    # 2. Assert MRI series and windows
    mri = gc_data["mri"]
    assert mri["series_evaluated"] == 3
    assert mri["windows_evaluated"] == 44
    print("[PASS] MRI Series & Window Counts Assertion Verified (Series: 3, Windows: 44)")

    # 3. Assert 12 AI Probabilities
    ai_probs = gc_data["ai"]["probabilities"]
    assert len(ai_probs) == 12
    expected_keys = ["ACL", "MCL", "Medial Meniscus", "Lateral Meniscus", "Medial OA", "Lateral OA", "PF OA", "Effusion", "Synovitis", "Baker's", "Contusion", "Fracture"]
    for key in expected_keys:
        assert key in ai_probs
    print("[PASS] 12 AI Finding Probabilities Assertion Verified")

    # 4. Assert Radiologist Review: 6 Approved, 6 Rejected
    rev = gc_data["radiologist_review"]
    assert len(rev["approved_findings"]) == 6
    assert len(rev["rejected_findings"]) == 6
    print("[PASS] Radiologist Review Decisions Assertion Verified (6 Approved, 6 Rejected)")

    # 5. Assert Draft Status before Final Approval
    draft = gc_data["draft_report"]
    assert draft["status"] == "DRAFT"
    assert draft["final_approval"]["status"] == "PENDING"
    print("[PASS] LLM Draft Report Status Assertion Verified (Status: DRAFT, Final Approval: PENDING)")

    # 6. Assert Integration Invariants
    invariants = gc_data["integration_invariants"]
    assert invariants["ai_output_count"] == 12
    assert invariants["approved_findings"] == 6
    assert invariants["rejected_findings"] == 6
    assert invariants["draft_status"] == "DRAFT"
    assert invariants["final_approval_status"] == "PENDING"
    print("[PASS] Safety & Integration Invariants Verified")

    print("\nALL GOLDEN CASE ASSERTIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_golden_case_assertions()
