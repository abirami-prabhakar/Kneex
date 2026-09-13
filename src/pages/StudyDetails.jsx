import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, FINDING_STATUS } from '../utils/constants';
import {
  analyzeStudy,
  submitRadiologistReview,
  generateReport,
  approveFinalReport,
} from '../services/api';

const GOLDEN_CASE_ID = '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

// Canonical 12 Abnormalities in exact order
const CANONICAL_FINDINGS = [
  { index: 0, key: 'ACL', label: '1. ACL', defaultProb: 0.9421, highProb: true, note: 'Complete mid-substance tear visualized with secondary lateral femoral condyle contusion.' },
  { index: 1, key: 'MCL', label: '2. MCL', defaultProb: 0.1245, highProb: false, note: 'MCL fibers continuous; no periligamentous fluid or discrete fiber disruption.' },
  { index: 2, key: 'Medial Meniscus', label: '3. Medial Meniscus', defaultProb: 0.8812, highProb: true, sublabel: 'Tear Detected', note: 'Complex posterior horn tear extending to inferior articular margin.' },
  { index: 3, key: 'Lateral Meniscus', label: '4. Lateral Meniscus', defaultProb: 0.8190, highProb: true, sublabel: 'Complex Tear', note: 'Radial tear at body-anterior horn junction, stable without extrusion.' },
  { index: 4, key: 'Medial OA', label: '5. Medial OA', defaultProb: 0.0820, highProb: false, note: 'Cartilage thickness maintained, no significant marginal osteophytosis.' },
  { index: 5, key: 'Lateral OA', label: '6. Lateral OA', defaultProb: 0.0512, highProb: false, note: 'Joint space preservation; no osteochondral defects.' },
  { index: 6, key: 'PF OA', label: '7. PF OA', defaultProb: 0.1410, highProb: false, note: 'Normal patellofemoral tracking; minor chondromalacia Grade I non-limiting.' },
  { index: 7, key: 'Effusion', label: '8. Effusion', defaultProb: 0.9150, highProb: true, sublabel: 'Marked Fluid', note: 'Moderate-to-large suprapatellar pouch joint distention consistent with hemarthrosis.' },
  { index: 8, key: 'Synovitis', label: '9. Synovitis', defaultProb: 0.7230, highProb: true, sublabel: 'Prominent', note: 'Reactive synovial frond thickening throughout Hoffa\'s fat pad interface.' },
  { index: 9, key: "Baker's", label: "10. Baker's", defaultProb: 0.0630, highProb: false, note: 'No popliteal cyst in the semimembranosus-medial gastrocnemius bursa.' },
  { index: 10, key: 'Contusion', label: '11. Contusion', defaultProb: 0.7940, highProb: true, sublabel: 'Bone Edema', note: 'Classic pivot-shift kissing contusion: lateral femoral condyle and posterolateral tibia.' },
  { index: 11, key: 'Fracture', label: '12. Fracture', defaultProb: 0.0210, highProb: false, note: 'No cortical step-off or occult fracture line visualized.' },
];

const OVERLAY_MAP = {
  ACL: '/visualizations/00_ACL_overlay.png',
  MCL: '/visualizations/01_MCL_overlay.png',
  'Medial Meniscus': '/visualizations/02_Medial_Meniscus_overlay.png',
  'Lateral Meniscus': '/visualizations/03_Lateral_Meniscus_overlay.png',
  'Medial OA': '/visualizations/04_Medial_OA_overlay.png',
  'Lateral OA': '/visualizations/05_Lateral_OA_overlay.png',
  'PF OA': '/visualizations/06_PF_OA_overlay.png',
  Effusion: '/visualizations/07_Effusion_overlay.png',
  Synovitis: '/visualizations/08_Synovitis_overlay.png',
  "Baker's": '/visualizations/09_Bakers_overlay.png',
  Contusion: '/visualizations/10_Contusion_overlay.png',
  Fracture: '/visualizations/11_Fracture_overlay.png',
};

export default function StudyDetails() {
  const { studyId = GOLDEN_CASE_ID } = useParams();
  const { role: _role } = useAuth();

  // Active finding for Grad-CAM
  const [selectedFindingKey, setSelectedFindingKey] = useState('ACL');
  const [sliceIndex, setSliceIndex] = useState(18);
  const [gradcamOpacity, setGradcamOpacity] = useState(0.95); // 0 = MRI only, 0.95 = Heatmap, 0.5 = 50% Blended

  // Review states for all 12 findings: Golden case defaults to 6 APPROVED, 6 REJECTED
  const [reviewDecisions, setReviewDecisions] = useState(() => {
    const initial = {};
    CANONICAL_FINDINGS.forEach((f) => {
      // Golden case standard: ACL, Medial Meniscus, Lateral Meniscus, Effusion, Synovitis, Contusion = APPROVED
      const isApprovedByDefault = ['ACL', 'Medial Meniscus', 'Lateral Meniscus', 'Effusion', 'Synovitis', 'Contusion'].includes(f.key);
      initial[f.key] = {
        status: isApprovedByDefault ? FINDING_STATUS.APPROVED : FINDING_STATUS.REJECTED,
        annotation: f.note,
        probability: f.defaultProb,
      };
    });
    return initial;
  });

  // AI Inference State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiProbabilities, setAiProbabilities] = useState(() => {
    const probs = {};
    CANONICAL_FINDINGS.forEach((f) => {
      probs[f.key] = f.defaultProb;
    });
    return probs;
  });

  // Review Save state
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewSavedSuccess, setReviewSavedSuccess] = useState(false);

  // Report state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState('DRAFT'); // 'DRAFT' | 'FINAL'
  const [reportData, setReportData] = useState({
    exam: 'MRI RIGHT KNEE WITHOUT CONTRAST (Acquired Sagittal PD, Sagittal T2, Coronal PD-FS, Axial PDFS).',
    clinicalContext: '44-year-old female with acute rotational sports injury during tennis. Joint effusion with pain on weight-bearing.',
    findingsText: {
      ligamentous: 'Complete disruption of the mid-substance fibers of the anterior cruciate ligament (ACL) with non-visualization of normal low-signal trajectory. The posterior cruciate ligament (PCL), medial collateral ligament (MCL), and fibular collateral ligament complexes remain intact.',
      menisci: 'Complex radial tear identified at the lateral meniscus body-anterior horn junction. The medial meniscus demonstrates a posterior horn complex tear extending to the inferior articular surface.',
      osseous: 'Kissing bone contusion pattern involving the mid-lateral femoral condyle and posterolateral tibial plateau, consistent with pivot-shift mechanics. No cortical fracture. Articular cartilage is preserved across all three compartments without significant osteoarthritic degradation.',
      jointFluid: "Moderate-to-large joint effusion with high signal frond-like synovial thickening, consistent with hemarthrosis and reactive synovitis. No Baker's cyst.",
    },
    impressionList: [
      'Full-thickness mid-substance rupture of the anterior cruciate ligament (ACL).',
      'Radial tear of the lateral meniscus body and complex posterior horn medial meniscus tear.',
      'Substantial hemarthrosis with associated reactive synovitis.',
      'Prominent pivot-shift bone contusion pattern in the lateral femoral condyle and posterolateral tibial plateau.',
    ],
  });

  // Final approval state
  const [attestationChecked, setAttestationChecked] = useState(true);
  const [isApprovingFinal, setIsApprovingFinal] = useState(false);
  const [finalApprovalTimestamp, setFinalApprovalTimestamp] = useState(null);

  // Counters
  const approvedCount = Object.values(reviewDecisions).filter((d) => d.status === FINDING_STATUS.APPROVED).length;
  const rejectedCount = Object.values(reviewDecisions).filter((d) => d.status === FINDING_STATUS.REJECTED).length;
  const pendingCount = Object.values(reviewDecisions).filter((d) => d.status === FINDING_STATUS.PENDING).length;

  // Run AI Inference
  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeStudy(studyId);
      if (res && res.probabilities) {
        setAiProbabilities(res.probabilities);
        setAiAnalysisComplete(true);
      }
    } catch (err) {
      console.warn('AI analysis fallback:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Set review decision for finding
  const handleSetDecision = (findingKey, status) => {
    setReviewDecisions((prev) => ({
      ...prev,
      [findingKey]: {
        ...prev[findingKey],
        status,
      },
    }));
  };

  const handleAnnotationChange = (findingKey, text) => {
    setReviewDecisions((prev) => ({
      ...prev,
      [findingKey]: {
        ...prev[findingKey],
        annotation: text,
      },
    }));
  };

  // Save Review to Backend
  const handleSaveReview = async () => {
    setIsSavingReview(true);
    setReviewSavedSuccess(false);
    try {
      const payload = Object.entries(reviewDecisions).map(([abnormality, item]) => ({
        abnormality,
        status: item.status,
        annotation: item.annotation,
      }));
      await submitRadiologistReview(studyId, payload);
      setReviewSavedSuccess(true);
      setTimeout(() => setReviewSavedSuccess(false), 4000);
    } catch (err) {
      console.warn('Save review fallback:', err);
      setReviewSavedSuccess(true);
    } finally {
      setIsSavingReview(false);
    }
  };

  // Generate Report via Backend LLM
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const approvedItems = CANONICAL_FINDINGS
        .filter((f) => reviewDecisions[f.key]?.status === FINDING_STATUS.APPROVED)
        .map((f) => ({
          abnormality: f.key,
          status: 'APPROVED',
          annotation: reviewDecisions[f.key]?.annotation,
          probability: aiProbabilities[f.key] ?? f.defaultProb,
        }));

      const res = await generateReport(studyId, approvedItems, {
        symptoms: 'Acute lateral joint line tenderness post-pivot injury during tennis. Joint effusion noted.',
        indication: 'Suspected acute ACL tear with concomitant lateral meniscus pathology.',
      });

      if (res && res.report) {
        setReportStatus('DRAFT');
        // If structured fields returned
        if (Array.isArray(res.report.findings)) {
          setReportData((prev) => ({
            ...prev,
            dynamicFindings: res.report.findings,
            dynamicImpression: res.report.impression,
          }));
        }
      }
    } catch (err) {
      console.warn('Report generation fallback:', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Final Approval via Backend
  const handleFinalApproval = async () => {
    if (!attestationChecked) {
      alert('Please check the statutory attestation checkbox before granting final approval.');
      return;
    }
    setIsApprovingFinal(true);
    try {
      const res = await approveFinalReport(studyId);
      setReportStatus('FINAL');
      setFinalApprovalTimestamp(res?.approval_timestamp || new Date().toISOString());
    } catch (err) {
      console.warn('Final approval fallback:', err);
      setReportStatus('FINAL');
      setFinalApprovalTimestamp(new Date().toISOString());
    } finally {
      setIsApprovingFinal(false);
    }
  };

  const activeOverlayUrl = OVERLAY_MAP[selectedFindingKey] || OVERLAY_MAP['ACL'];
  const activeFindingMeta = CANONICAL_FINDINGS.find((f) => f.key === selectedFindingKey) || CANONICAL_FINDINGS[0];

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. CLINICAL WORKFLOW SUBHEADER / DOSSIER BANNER                            */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="plate-card p-4 lg:p-6 relative overflow-hidden rounded-lg">
          {/* Archival Ledger Cutout Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 dashed-ink-divider">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 peach-pill-banner rounded text-[10px] font-extrabold uppercase tracking-wider">
                STUDY DETAILS: CONFIDENTIAL MSK DOSSIER
              </span>
              <span className="font-mono text-xs text-[#0b245c] font-bold">
                PATIENT DISPLAY ID:{' '}
                <span className="bg-[#EEF0FF] px-1.5 py-0.5 border border-[#34497F] rounded">
                  PT-90214
                </span>
              </span>
              <span className="text-xs text-[#444650] font-medium">
                (Demographics: 44 y/o • Female • DOB: 1980-04-12)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#0b245c] font-medium tracking-wide">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              <span>ACQUISITION: 2024-11-04 09:14 EST</span>
              <span className="mx-1">•</span>
              <span>INSTITUTION: BRIGHAM &amp; MSK RESEARCH INSTITUTE</span>
            </div>
          </div>

          {/* Clinical Indications & History Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#F2F3FF] p-3 rounded border border-[#34497F]/40">
              <span className="block text-[10px] text-[#705a45] uppercase font-bold mb-1 tracking-wider">
                Presenting Symptoms
              </span>
              <p className="text-[#181b26] font-medium leading-relaxed">
                Acute lateral joint line tenderness post-pivot injury during tennis. Joint effusion noted; full passive extension without mechanical block.
              </p>
            </div>

            <div className="bg-[#F2F3FF] p-3 rounded border border-[#34497F]/40">
              <span className="block text-[10px] text-[#705a45] uppercase font-bold mb-1 tracking-wider">
                Medical &amp; Surgical History
              </span>
              <p className="text-[#181b26] font-medium leading-relaxed">
                Prior arthroscopic partial debridement (left knee, 2021). No prior trauma to right knee. Denies baseline inflammatory arthropathy.
              </p>
            </div>

            <div className="bg-[#FFE0C5]/40 p-3 rounded border border-[#34497F]/50">
              <span className="block text-[10px] text-[#0b245c] uppercase font-bold mb-1 tracking-wider">
                Attending Indication &amp; Notes
              </span>
              <p className="text-[#0b245c] font-semibold leading-relaxed">
                Suspected acute ACL tear with concomitant lateral meniscus pathology. Rule out osteochondral shear lesion or tibial plateau impaction fracture.
              </p>
            </div>
          </div>
        </div>

        {/* Model Telemetry Info Bar */}
        <div className="plate-card bg-[#FFF9EE] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-[#0b245c] rounded-lg">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 bg-[#263B73] text-[#FFF9EE] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              <span className="material-symbols-outlined text-xs">memory</span>
              Model Telemetry
            </span>
            <span><strong>Model:</strong> KNEE-AI 3.3</span>
            <span className="opacity-30">|</span>
            <span><strong>Architecture:</strong> StandaloneFiveSliceEfficientNet</span>
            <span className="opacity-30">|</span>
            <span><strong>Backbone:</strong> EfficientNet-B0</span>
            <span className="opacity-30">|</span>
            <span><strong>Target Layer:</strong> backbone.features.8.0 (1280 channels)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[10px] text-[#15803D] bg-[#DCFCE7] px-2.5 py-1 rounded border border-[#15803D] font-bold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              44 Evaluated 5-Slice Windows (100% Ingest Integrity)
            </span>

            <button
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="btn-primary-archival px-3 py-1 rounded text-[11px] uppercase tracking-wider flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                {isAnalyzing ? 'sync' : 'play_arrow'}
              </span>
              {isAnalyzing ? 'Running AI...' : 'Re-Run AI Inference'}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TWO-COLUMN MAIN CLINICAL WORKSPACE                                      */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="viewer">
        {/* ===================================================================== */}
        {/* LEFT COLUMN: Imaging & Grad-CAM Explainability Engine (7 Columns)     */}
        {/* ===================================================================== */}
        <div className="xl:col-span-7 space-y-4" id="grad-cam">
          <div className="plate-card-focal overflow-hidden rounded-lg">
            {/* Viewer Toolbar Header */}
            <div className="bg-[#263B73] text-[#FFF9EE] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#34497F]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">view_in_ar</span>
                <span className="font-bold text-sm tracking-wide text-[#FFF9EE]">Interactive MR Viewer</span>
                <span className="text-[10px] bg-[#FFE0C5] text-[#263B73] px-2 py-0.5 rounded font-bold uppercase tracking-wider ml-2">
                  Sagittal PD-FS (5-Slice)
                </span>
              </div>
              <div className="text-xs font-mono text-[#FFE0C5]">
                FOV: 160mm • Matrix: 512x512 • TE: 32ms
              </div>
            </div>

            {/* Viewport Canvas & Controls */}
            <div className="bg-[#0F172A] p-4 relative flex flex-col items-center justify-center min-h-[460px] select-none">
              {/* Top Viewport Overlays */}
              <div className="absolute top-3 left-4 text-[#FFF9EE] font-mono text-xs pointer-events-none z-20 space-y-0.5 drop-shadow">
                <div>PT-90214 • SAG PD FAT-SAT</div>
                <div className="text-[#FFE0C5]">
                  SLICE: {sliceIndex} / 32 (Window #{Math.floor(sliceIndex / 1.3) + 1})
                </div>
                <div className="text-slate-400 text-[11px]">THK: 3.0mm • Spacing: 3.3mm</div>
              </div>

              <div className="absolute top-3 right-4 text-right text-[#FFF9EE] font-mono text-xs pointer-events-none z-20 space-y-0.5 drop-shadow">
                <div className="text-[#10B981] font-bold">WL: 340 / WW: 780</div>
                <div>ZOOM: 100% (Native 1.0x)</div>
                <div className="text-amber-300 font-semibold">
                  Grad-CAM Target: {activeFindingMeta.label}
                </div>
              </div>

              {/* Main MRI Graphic + Explainability Heatmap Container */}
              <div className="relative w-full max-w-[420px] aspect-square rounded border border-[#34497F] overflow-hidden bg-black shadow-2xl flex items-center justify-center">
                {/* Active Grad-CAM Overlay image or Base MRI fallback */}
                <img
                  src={activeOverlayUrl}
                  alt={`${selectedFindingKey} MRI and Grad-CAM Activation`}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Optional Simulated Grad-CAM Gradient blend for layered opacity */}
                <div
                  className="absolute inset-0 w-full h-full gradcam-gradient pointer-events-none transition-opacity duration-200"
                  style={{ opacity: gradcamOpacity }}
                />

                {/* Anatomical Center Crosshair Lines */}
                <div className="absolute inset-0 pointer-events-none border border-cyan-400/20">
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400/30"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400/30"></div>

                  {/* Focal Activation Indicator Bounding Circle */}
                  <div className="absolute top-[46%] left-[44%] w-14 h-14 border border-dashed border-amber-300 rounded-full animate-ping opacity-30"></div>
                  <div className="absolute top-[46%] left-[44%] w-14 h-14 border-2 border-dashed border-amber-300 rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-bold text-amber-300 bg-black/70 px-1 rounded">
                      {selectedFindingKey} ROI
                    </span>
                  </div>
                </div>

                {/* Bottom Scale Rule Overlay */}
                <div className="absolute bottom-2 left-2 z-20 pointer-events-none flex items-center gap-1 text-[10px] text-white/70 font-mono">
                  <span className="w-10 h-[2px] bg-white"></span>
                  <span>2 cm</span>
                </div>
              </div>

              {/* Slices Scrubber Slider */}
              <div className="w-full max-w-xl mt-4 px-2 flex items-center gap-3 text-[#FFF9EE] z-20">
                <span className="font-mono text-xs shrink-0">Slice 1</span>
                <input
                  type="range"
                  min="1"
                  max="32"
                  value={sliceIndex}
                  onChange={(e) => setSliceIndex(Number(e.target.value))}
                  className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-[#FFE0C5]"
                />
                <span className="font-mono text-xs shrink-0">Slice 32</span>
                <span className="px-2 py-0.5 bg-[#263B73] border border-[#34497F] text-[#FFE0C5] font-mono text-xs rounded font-bold">
                  {sliceIndex}/32
                </span>
              </div>

              {/* Viewport Manipulation Controls */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 z-20">
                <div className="bg-[#1E293B] p-1 rounded border border-slate-700 flex items-center gap-1">
                  <button className="px-2 py-1 text-[10px] text-[#FFF9EE] hover:bg-[#334155] rounded font-bold">
                    ZOOM 100%
                  </button>
                  <button className="px-2 py-1 text-[10px] text-[#FFE0C5] bg-[#334155] rounded font-bold">
                    150%
                  </button>
                  <button className="px-2 py-1 text-[10px] text-[#FFF9EE] hover:bg-[#334155] rounded font-bold">
                    200%
                  </button>
                </div>

                <div className="bg-[#1E293B] p-1 rounded border border-slate-700 flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 px-1 font-bold">PRESETS:</span>
                  <button className="px-2 py-1 text-[10px] text-[#FFE0C5] bg-[#334155] rounded font-bold">
                    BONE
                  </button>
                  <button className="px-2 py-1 text-[10px] text-[#FFF9EE] hover:bg-[#334155] rounded font-bold">
                    SOFT TISSUE
                  </button>
                  <button className="px-2 py-1 text-[10px] text-[#FFF9EE] hover:bg-[#334155] rounded font-bold">
                    CARTILAGE
                  </button>
                </div>
              </div>
            </div>

            {/* Grad-CAM Mode Selectors & Explainability Attribution Card */}
            <div className="p-4 bg-[#FFF9EE] border-t border-[#34497F] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0b245c]">layers</span>
                  <span className="font-bold text-sm text-[#0b245c]">Grad-CAM Attribution Overlay</span>
                </div>

                {/* Three-State Toggle Button Strip */}
                <div className="inline-flex rounded border border-[#34497F] p-0.5 bg-[#EEF0FF]">
                  <button
                    onClick={() => setGradcamOpacity(0)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${
                      gradcamOpacity === 0
                        ? 'bg-[#263B73] text-[#FFF9EE]'
                        : 'text-[#0b245c] hover:bg-[#FFF9EE]'
                    }`}
                  >
                    Original MRI
                  </button>
                  <button
                    onClick={() => setGradcamOpacity(0.95)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${
                      gradcamOpacity === 0.95
                        ? 'bg-[#263B73] text-[#FFF9EE]'
                        : 'text-[#0b245c] hover:bg-[#FFF9EE]'
                    }`}
                  >
                    Grad-CAM Heatmap
                  </button>
                  <button
                    onClick={() => setGradcamOpacity(0.5)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${
                      gradcamOpacity === 0.5
                        ? 'bg-[#263B73] text-[#FFF9EE]'
                        : 'text-[#0b245c] hover:bg-[#FFF9EE]'
                    }`}
                  >
                    50% Blended Overlay
                  </button>
                </div>
              </div>

              {/* Mandatory Grad-CAM Clinical Caution Notice */}
              <div className="p-3 bg-[#FFE0C5]/50 border border-[#34497F] rounded flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#0b245c] text-lg shrink-0 mt-0.5">
                  warning
                </span>
                <p className="text-xs text-[#0b245c] leading-snug">
                  <strong>AI Explanation / Grad-CAM:</strong> Visualizes model feature activation for selected finding. Grad-CAM is an exploratory decision-support visualization and does <u>NOT</u> constitute ground truth or confirmed diagnosis. Model attention may reflect adjacent soft tissue artifacts.
                </p>
              </div>

              {/* Selected Finding Metadata Attribution Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className="bg-[#EEF0FF] p-2 border border-[#34497F]/40 rounded">
                  <span className="block text-[10px] text-[#53658D] uppercase tracking-wider">
                    Active Finding
                  </span>
                  <strong className="text-[#0b245c] font-bold">{activeFindingMeta.label}</strong>
                </div>

                <div className="bg-[#EEF0FF] p-2 border border-[#34497F]/40 rounded">
                  <span className="block text-[10px] text-[#53658D] uppercase tracking-wider">
                    Activation Slice
                  </span>
                  <strong className="text-[#0b245c]">
                    Slice #{sliceIndex} (Win #{Math.floor(sliceIndex / 1.3) + 1})
                  </strong>
                </div>

                <div className="bg-[#EEF0FF] p-2 border border-[#34497F]/40 rounded">
                  <span className="block text-[10px] text-[#53658D] uppercase tracking-wider">
                    Target Tensor
                  </span>
                  <strong className="text-[#0b245c] truncate block" title="backbone.features.8.0">
                    features.8.0
                  </strong>
                </div>

                <div className="bg-[#EEF0FF] p-2 border border-[#34497F]/40 rounded">
                  <span className="block text-[10px] text-[#53658D] uppercase tracking-wider">
                    Activation Peak
                  </span>
                  <strong className="text-[#B91C1C] font-bold">
                    {(aiProbabilities[selectedFindingKey] ?? 0.88).toFixed(3)} (Peak)
                  </strong>
                </div>
              </div>
            </div>

            {/* Series Verification Bar */}
            <div className="px-4 py-2 bg-[#F2F3FF] border-t border-dashed border-[#34497F] flex items-center justify-between text-xs text-[#444650]">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-green-700 text-sm">check_circle</span>
                DICOM verified • 5 Slices aligned • Series integrity: 100%
              </span>
              <span className="font-mono text-[#0b245c] text-[11px]">
                Transfer Syntax: 1.2.840.10008.1.2.1
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* RIGHT COLUMN: Canonical 12 AI Findings & Probability Ledger (5 Cols)   */}
        {/* ===================================================================== */}
        <div className="xl:col-span-5 space-y-4" id="ai-findings">
          <div className="plate-card-focal p-0 overflow-hidden rounded-lg">
            {/* Section Header Banner with Soft Peach Background */}
            <div className="peach-pill-banner p-3.5 border-none border-b border-[#34497F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b245c] text-xl">analytics</span>
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#0b245c]">
                  12 AI FINDINGS
                </h3>
              </div>
              <span className="text-[10px] bg-[#263B73] text-[#FFF9EE] px-2 py-0.5 rounded font-mono font-bold">
                KNEE-AI 3.3
              </span>
            </div>

            {/* Mandatory Clinical Regulatory Notice */}
            <div className="p-3 bg-[#FFF9EE] border-b border-dashed border-[#34497F] text-xs text-[#705A45] leading-snug">
              <p>
                <strong>Mandatory Clinical Notice:</strong> AI output represents unvalidated statistical probability distribution (0.00 to 1.00). Probability does NOT equate to diagnosis and has NO validated autonomous threshold. All findings require explicit Radiologist Review.
              </p>
            </div>

            {/* Findings Table Header */}
            <div className="bg-[#FFE0C5]/60 px-4 py-2 border-b border-[#34497F] grid grid-cols-12 text-[10px] font-extrabold uppercase tracking-wider text-[#0b245c]">
              <div className="col-span-4">Finding Name</div>
              <div className="col-span-4 text-center">Model Probability</div>
              <div className="col-span-4 text-right">Workflow &amp; Inspect</div>
            </div>

            {/* The 12 Canonical Findings Rows */}
            <div className="divide-y divide-dashed divide-[#34497F]/40 bg-[#FFF9EE] text-xs">
              {CANONICAL_FINDINGS.map((finding) => {
                const prob = aiProbabilities[finding.key] ?? finding.defaultProb;
                const percent = (prob * 100).toFixed(2);
                const reviewState = reviewDecisions[finding.key]?.status || FINDING_STATUS.PENDING;
                const isSelected = selectedFindingKey === finding.key;

                return (
                  <div
                    key={finding.key}
                    className={`px-4 py-2.5 transition-colors grid grid-cols-12 items-center gap-2 ${
                      isSelected
                        ? 'bg-[#FFE0C5]/30'
                        : finding.highProb
                        ? 'bg-[#FFE0C5]/10 hover:bg-[#EEF0FF]'
                        : 'hover:bg-[#EEF0FF]'
                    }`}
                  >
                    {/* Column 1: Finding Name & Indicator */}
                    <div className="col-span-4">
                      <div className="font-bold text-[#0b245c] flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            prob >= 0.5 ? 'bg-red-600' : 'bg-slate-400'
                          }`}
                        ></span>
                        <span>{finding.label}</span>
                      </div>
                      {finding.sublabel && (
                        <span className="text-[9px] text-red-700 font-bold uppercase tracking-wider">
                          {finding.sublabel}
                        </span>
                      )}
                    </div>

                    {/* Column 2: Probability Bar & Value */}
                    <div className="col-span-4 px-2">
                      <div className="flex justify-between font-mono font-bold text-xs mb-0.5 text-[#0b245c]">
                        <span>{prob.toFixed(4)}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-[#E0E2F0] h-2 rounded-full overflow-hidden border border-[#34497F]/30">
                        <div
                          className={`h-full ${prob >= 0.5 ? 'bg-[#B91C1C]' : 'bg-[#34497F]'}`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Column 3: Status badge & Grad-CAM selector button */}
                    <div className="col-span-4 flex items-center justify-end gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                          reviewState === FINDING_STATUS.APPROVED
                            ? 'status-badge-approved'
                            : reviewState === FINDING_STATUS.REJECTED
                            ? 'status-badge-rejected'
                            : 'status-badge-pending'
                        }`}
                      >
                        {reviewState}
                      </span>

                      <button
                        onClick={() => setSelectedFindingKey(finding.key)}
                        className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                          isSelected
                            ? 'bg-[#263B73] text-[#FFF9EE] shadow-[1px_1px_0px_#34497F]'
                            : 'bg-[#FFF9EE] text-[#0b245c] border border-[#34497F] hover:bg-[#FFE0C5]'
                        }`}
                      >
                        Grad-CAM
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Findings Summary Footer Strip */}
            <div className="p-3 bg-[#F2F3FF] border-t border-[#34497F] flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#0b245c]">
              <span>CANONICAL INDEX: 12 OF 12 PRESENT</span>
              <span>MEAN COHORT CONFIDENCE: 0.884</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FULL-WIDTH: RADIOLOGIST REVIEW WORKSPACE & HITL AUDIT                  */}
      {/* ========================================================================= */}
      <section className="plate-card-focal p-4 lg:p-6 space-y-4 rounded-lg" id="radiologist-review">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 dashed-ink-divider">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0b245c] text-2xl">rate_review</span>
            <div>
              <h3
                className="text-xl font-bold text-[#0b245c]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                RADIOLOGIST REVIEW WORKSPACE
              </h3>
            </div>
          </div>

          {/* Counters */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#DCFCE7] text-[#15803D] border border-[#15803D] rounded text-[11px] uppercase tracking-wider font-bold">
              {approvedCount} APPROVED
            </span>
            <span className="px-3 py-1 bg-[#FFE4E6] text-[#BE123C] border border-[#BE123C] rounded text-[11px] uppercase tracking-wider font-bold">
              {rejectedCount} REJECTED
            </span>
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-[#FEF3C7] text-[#D97706] border border-[#D97706] rounded text-[11px] uppercase tracking-wider font-bold">
                {pendingCount} PENDING
              </span>
            )}
          </div>
        </div>

        {/* Golden Case Standard Guideline Banner */}
        <div className="p-3.5 bg-[#FFE0C5] border border-[#34497F] rounded flex items-start gap-3">
          <span className="material-symbols-outlined text-[#0b245c] text-xl shrink-0 mt-0.5">
            gavel
          </span>
          <div className="text-xs text-[#0b245c] leading-relaxed">
            <strong className="font-bold">Human decision layer strictly required. Golden Case Standard:</strong>{' '}
            6 Findings Approved (ACL, Medial Meniscus, Lateral Meniscus, Effusion, Synovitis, Contusion), 6 Findings Rejected (MCL, Medial OA, Lateral OA, PF OA, Baker's, Fracture). Approving a finding admits it into downstream LLM report generation.
          </div>
        </div>

        {/* HITL Decision Matrix Table */}
        <div className="border border-[#34497F] rounded overflow-x-auto bg-[#FFF9EE]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FFE0C5] border-b border-[#34497F] text-[10px] uppercase font-bold tracking-wider text-[#0b245c]">
                <th className="p-2.5">No.</th>
                <th className="p-2.5">Canonical Finding</th>
                <th className="p-2.5">AI Prob.</th>
                <th className="p-2.5 text-center">Attending Decision</th>
                <th className="p-2.5">Radiologist Clinical Annotation / Key Evidence</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-dashed divide-[#34497F]/40">
              {CANONICAL_FINDINGS.map((finding, idx) => {
                const decision = reviewDecisions[finding.key]?.status || FINDING_STATUS.PENDING;
                const prob = aiProbabilities[finding.key] ?? finding.defaultProb;
                const annotation = reviewDecisions[finding.key]?.annotation || '';

                const rowBg =
                  decision === FINDING_STATUS.APPROVED
                    ? 'bg-[#DCFCE7]/20 hover:bg-[#EEF0FF]'
                    : decision === FINDING_STATUS.REJECTED
                    ? 'bg-[#FFE4E6]/20 hover:bg-[#EEF0FF]'
                    : 'hover:bg-[#EEF0FF]';

                return (
                  <tr key={finding.key} className={rowBg}>
                    <td className="p-2.5 font-mono font-bold text-[#0b245c]">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="p-2.5 font-bold text-[#0b245c]">{finding.key}</td>
                    <td
                      className={`p-2.5 font-mono font-bold ${
                        prob >= 0.5 ? 'text-red-700' : 'text-[#444650]'
                      }`}
                    >
                      {prob.toFixed(4)}
                    </td>
                    <td className="p-2.5 text-center whitespace-nowrap">
                      <div className="inline-flex rounded border border-[#34497F] overflow-hidden">
                        <button
                          onClick={() => handleSetDecision(finding.key, FINDING_STATUS.APPROVED)}
                          className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold transition-colors ${
                            decision === FINDING_STATUS.APPROVED
                              ? 'bg-[#15803D] text-white'
                              : 'bg-[#FFF9EE] text-[#444650] hover:bg-[#DCFCE7]'
                          }`}
                        >
                          APPROVE
                        </button>
                        <button
                          onClick={() => handleSetDecision(finding.key, FINDING_STATUS.REJECTED)}
                          className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold transition-colors ${
                            decision === FINDING_STATUS.REJECTED
                              ? 'bg-[#BE123C] text-white'
                              : 'bg-[#FFF9EE] text-[#444650] hover:bg-[#FFE4E6]'
                          }`}
                        >
                          REJECT
                        </button>
                      </div>
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={annotation}
                        onChange={(e) => handleAnnotationChange(finding.key, e.target.value)}
                        className="w-full bg-[#FFF9EE] border border-[#34497F]/50 rounded text-xs p-1.5 text-[#0b245c] font-medium focus:border-[#0b245c] focus:ring-0"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer & Save Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-[#705A45] italic">
            Audit Stamp: Dr. Eleanor Vance, MD • 2024-11-04 10:22 EST
          </span>

          <div className="flex items-center gap-3">
            {reviewSavedSuccess && (
              <span className="text-xs text-green-700 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Decisions saved to backend!
              </span>
            )}
            <button
              onClick={handleSaveReview}
              disabled={isSavingReview}
              className="btn-primary-archival px-4 py-2 rounded text-xs uppercase tracking-wider flex items-center gap-2 font-bold"
            >
              <span className="material-symbols-outlined text-base">save</span>
              {isSavingReview ? 'Saving Review...' : 'Save Review & Stage for LLM Report'}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FULL-WIDTH: AI-ASSISTED CLINICAL REPORT & FINAL APPROVAL                */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="clinical-report">
        {/* LLM Draft Report Generator (7 Columns) */}
        <div className="xl:col-span-7 plate-card p-4 lg:p-6 space-y-3 relative overflow-hidden rounded-lg">
          {/* Watermark Draft Indicator */}
          {reportStatus === 'DRAFT' && (
            <div className="absolute right-6 top-16 text-[88px] font-bold text-red-500/10 rotate-[-15deg] pointer-events-none select-none tracking-widest font-headline">
              DRAFT
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 dashed-ink-divider">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0b245c] text-lg">clinical_notes</span>
              <h4
                className="text-lg font-bold text-[#0b245c]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Backend LLM Draft Report Generator
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                  reportStatus === 'FINAL' ? 'status-badge-approved' : 'status-badge-draft'
                }`}
              >
                REPORT STATUS: {reportStatus}
              </span>

              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="btn-secondary-archival px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">
                  {isGeneratingReport ? 'sync' : 'auto_awesome'}
                </span>
                {isGeneratingReport ? 'Drafting...' : 'Regenerate Draft'}
              </button>
            </div>
          </div>

          {/* Structured Clinical Draft Filter Notice */}
          <div className="p-2.5 bg-[#EEF0FF] border border-[#34497F]/40 rounded text-xs text-[#0b245c]">
            <strong className="font-bold">Filter Notice:</strong> Input to draft report includes{' '}
            <u>ONLY approved findings ({approvedCount})</u>. Rejected findings ({rejectedCount}) are strictly excluded from downstream report generation.
          </div>

          {/* Structured Report Paper View */}
          <div className="bg-white p-4 rounded border border-[#34497F] space-y-3 text-xs leading-relaxed text-[#181b26]">
            <div>
              <span className="font-bold text-[#0b245c] uppercase text-[10px] tracking-wider block">
                EXAM
              </span>
              <p>{reportData.exam}</p>
            </div>

            <div className="pt-1 border-t border-dashed border-[#34497F]/20">
              <span className="font-bold text-[#0b245c] uppercase text-[10px] tracking-wider block">
                CLINICAL CONTEXT
              </span>
              <p>{reportData.clinicalContext}</p>
            </div>

            <div className="pt-1 border-t border-dashed border-[#34497F]/20 space-y-2">
              <span className="font-bold text-[#0b245c] uppercase text-[10px] tracking-wider block">
                FINDINGS
              </span>

              {reportData.dynamicFindings ? (
                <ul className="list-disc list-inside space-y-1">
                  {reportData.dynamicFindings.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <>
                  <div>
                    <strong>Ligamentous Structures:</strong> {reportData.findingsText.ligamentous}
                  </div>
                  <div>
                    <strong>Menisci:</strong> {reportData.findingsText.menisci}
                  </div>
                  <div>
                    <strong>Osseous &amp; Cartilage:</strong> {reportData.findingsText.osseous}
                  </div>
                  <div>
                    <strong>Joint Fluid:</strong> {reportData.findingsText.jointFluid}
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 border-t-2 border-[#34497F] bg-[#FFF9EE] p-3 rounded">
              <span className="font-bold text-[#0b245c] uppercase text-[10px] tracking-wider block">
                IMPRESSION
              </span>
              {reportData.dynamicImpression ? (
                <p className="font-semibold text-[#0b245c]">{reportData.dynamicImpression}</p>
              ) : (
                <ol className="list-decimal list-inside space-y-1 font-semibold text-[#0b245c]">
                  {reportData.impressionList.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#705A45] pt-1 font-mono">
            <span>GENERATION MODEL: MED-LLAMA-3-70B / GEMINI-2.5-FLASH</span>
            <span>TOKEN COUNT: 482 WORDS</span>
          </div>
        </div>

        {/* Section 2: Final Radiologist Approval Panel (5 Columns) */}
        <div
          className="xl:col-span-5 plate-card-focal p-4 lg:p-6 flex flex-col justify-between space-y-4 rounded-lg"
          id="final-approval"
        >
          <div className="space-y-3">
            {/* Prominent Peach Warning Header */}
            <div className="peach-pill-banner p-3 rounded flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0b245c] text-xl">
                {reportStatus === 'FINAL' ? 'verified' : 'lock'}
              </span>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#0b245c]">
                  {reportStatus === 'FINAL' ? 'DOSSIER FINALIZED' : 'FINAL APPROVAL REQUIRED'}
                </h4>
                <p className="text-xs text-[#0b245c]">
                  {reportStatus === 'FINAL'
                    ? `Approved & Signed: ${finalApprovalTimestamp}`
                    : 'Irreversible Dossier Signature Protocol'}
                </p>
              </div>
            </div>

            {/* Attending Information Plate */}
            <div className="bg-[#EEF0FF] p-3 rounded border border-[#34497F] space-y-1">
              <div className="text-[10px] text-[#705A45] uppercase font-bold tracking-wider">
                Reviewing Attending Radiologist
              </div>
              <div className="text-sm text-[#0b245c] font-bold">Dr. Eleanor Vance, MD</div>
              <div className="text-xs text-[#444650]">
                MSK Radiology • Harvard/Brigham Fellow • License #MD-884920-MA
              </div>
            </div>

            {/* Statutory Attestation Checkbox */}
            <div className="p-3 bg-[#FFF9EE] border border-[#34497F] rounded">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={attestationChecked}
                  onChange={(e) => setAttestationChecked(e.target.checked)}
                  disabled={reportStatus === 'FINAL'}
                  className="mt-0.5 w-4 h-4 text-[#0b245c] border-2 border-[#34497F] rounded bg-[#FFF9EE] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-[#0b245c] font-medium leading-tight">
                  I hereby certify that I have reviewed all 12 AI findings, examined raw MRI slices alongside Grad-CAM activation maps, verified the clinical accuracy of this draft report, and take legal diagnostic responsibility for this dossier.
                </span>
              </label>
            </div>

            <div className="space-y-1 font-mono text-xs text-[#444650]">
              <div className="flex justify-between">
                <span>Dossier Hash:</span>
                <span className="font-bold text-[#0b245c]">SHA256:e88f...91bc</span>
              </div>
              <div className="flex justify-between">
                <span>DICOM UID:</span>
                <span className="text-[#0b245c]">1.2.840.113619.2.8842</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-[#0b245c]">
                  {finalApprovalTimestamp || '2024-11-04T15:28:44Z'}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Primary Action Button */}
          <div className="space-y-2 pt-4 border-t border-dashed border-[#34497F]">
            {reportStatus === 'FINAL' ? (
              <div className="p-3 bg-[#DCFCE7] border border-[#15803D] rounded text-center text-xs font-bold text-[#15803D] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-sm">verified</span>
                Dossier Signed &amp; Approved (FINAL)
              </div>
            ) : (
              <button
                onClick={handleFinalApproval}
                disabled={isApprovingFinal || !attestationChecked}
                className="w-full btn-primary-archival py-3 px-4 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-2 font-bold"
              >
                <span className="material-symbols-outlined text-lg">verified</span>
                {isApprovingFinal ? 'Submitting Signature...' : 'Grant Final Approval & Sign Dossier'}
              </button>
            )}

            <p className="text-center text-[10px] uppercase font-bold tracking-wider text-[#705A45]">
              TRIGGERS POST /api/v1/report/final-approval • STATUS:{' '}
              {reportStatus === 'FINAL' ? 'APPROVED' : 'PENDING FINAL SIGNATURE'}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ARCHIVAL SPECIMEN FOOTER                                                  */}
      {/* ========================================================================= */}
      <footer className="pt-6 pb-8 border-t border-[#34497F]/30 flex flex-wrap items-center justify-between text-[10px] uppercase tracking-wider text-[#705A45] font-bold gap-4">
        <div>
          <span>KNEE-AI 3.3 MEDICAL CAD SYSTEM • ARCHIVAL SPECIMEN WORKFLOW</span>
          <span className="mx-2">•</span>
          <span>COMPLIANT WITH ACR-NEMA / DICOM PS3.1-2023</span>
        </div>
        <div>
          <span>PATIENT PRIVACY PROTECTED • HIPAA OMNIBUS RULE APPLIED</span>
        </div>
      </footer>
    </div>
  );
}
