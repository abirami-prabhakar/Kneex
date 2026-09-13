import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PatientCard from '../components/study/PatientCard';
import MRIUpload from '../components/mri/MRIUpload';
import MRIViewer from '../components/mri/MRIViewer';
import FindingList from '../components/findings/FindingList';
import GradCAMViewer from '../components/gradcam/GradCAMViewer';
import ReportViewer from '../components/report/ReportViewer';
import StatusBadge from '../components/common/StatusBadge';
import {
  getMockAnalysisResult,
  buildFindingsFromProbabilities,
  getMockDraftReport,
  MOCK_STUDIES
} from '../services/mockData';
import { analyzeStudy, generateReport, approveFinalReport } from '../services/api';
import {
  Activity,
  Play,
  FileText,
  CheckCircle,
  Award,
  ArrowLeft,
  RefreshCw,
  Flame,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { FINDING_STATUS, REPORT_STATUS, APPROVAL_STATUS, ROLES } from '../utils/constants';

const GOLDEN_CASE_ID = '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

export default function StudyDetails() {
  const { studyId } = useParams();
  const { user } = useAuth();
  const isGoldenCase = studyId === GOLDEN_CASE_ID;

  // Active Tab: 'findings' | 'gradcam' | 'report'
  const [activeTab, setActiveTab] = useState('findings');

  // Study state
  const [study, setStudy] = useState(null);
  const [clinicalContext, setClinicalContext] = useState(null);

  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [findings, setFindings] = useState([]);

  // Grad-CAM state
  const [selectedGradCAM, setSelectedGradCAM] = useState(null);

  // Report state
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isApprovedFinal, setIsApprovedFinal] = useState(false);

  // Initialize study data
  useEffect(() => {
    const existing = MOCK_STUDIES.find((s) => s.id === studyId);
    if (existing) {
      setStudy(existing);
      setClinicalContext(existing.patient.clinical_context);
    } else {
      const fallback = {
        id: studyId,
        patient: {
          patient_id: `PATIENT-${studyId.slice(-6)}`,
          display_id: `KNEE-CASE-${studyId.slice(-4)}`,
          age: 45,
          sex: 'Female',
          clinical_context: {
            symptoms: 'Knee pain during weight bearing activity.',
            medical_history: 'No previous surgical intervention.',
            clinical_notes: 'MRI requested for structural evaluation.',
          },
        },
        created_at: new Date().toISOString(),
        review_status: 'PENDING',
      };
      setStudy(fallback);
      setClinicalContext(fallback.patient.clinical_context);
    }

    if (isGoldenCase) {
      const mockResult = getMockAnalysisResult(GOLDEN_CASE_ID);
      setAiResult(mockResult);
      setFindings(buildFindingsFromProbabilities(mockResult.probabilities));
    }
  }, [studyId, isGoldenCase]);

  // Run AI Analysis
  const handleRunAI = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeStudy(studyId);
      setAiResult(result);
      setFindings(buildFindingsFromProbabilities(result.probabilities));
    } catch (err) {
      const mockResult = getMockAnalysisResult(studyId);
      setAiResult(mockResult);
      setFindings(buildFindingsFromProbabilities(mockResult.probabilities));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApproveFinding = (abnormality) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.abnormality === abnormality ? { ...f, status: FINDING_STATUS.APPROVED } : f
      )
    );
  };

  const handleRejectFinding = (abnormality) => {
    setFindings((prev) =>
      prev.map((f) =>
        f.abnormality === abnormality ? { ...f, status: FINDING_STATUS.REJECTED } : f
      )
    );
  };

  const handleSelectGradCAM = (finding) => {
    setSelectedGradCAM(finding);
    setActiveTab('gradcam');
  };

  const handleGenerateReport = async () => {
    const approvedFindings = findings.filter((f) => f.status === FINDING_STATUS.APPROVED);
    if (!approvedFindings.length) {
      alert('Please approve at least one finding before generating the LLM draft report.');
      return;
    }

    setGeneratingReport(true);
    try {
      const res = await generateReport(studyId, approvedFindings, clinicalContext);
      setReportData(res);
      setActiveTab('report');
    } catch (err) {
      setReportData(getMockDraftReport(studyId, approvedFindings, clinicalContext));
      setActiveTab('report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleApproveFinal = async () => {
    try {
      await approveFinalReport(studyId);
      setIsApprovedFinal(true);
    } catch (err) {
      setIsApprovedFinal(true);
    }
  };

  if (!study) return null;

  const approvedCount = findings.filter((f) => f.status === FINDING_STATUS.APPROVED).length;

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <Link
            to="/studies"
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900">
                {study.patient?.display_id || 'Study Details'}
              </h1>
              {isGoldenCase && (
                <span className="bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Golden Demo Case</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              UID: {study.id}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunAI}
            disabled={analyzing}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{aiResult ? 'Re-Run AI' : 'Run KNEE-AI Analysis'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 Cols) — Compact Patient & Sticky MRI Viewer */}
        <div className="lg:col-span-5 space-y-4">
          <PatientCard
            patient={study.patient}
            clinicalContext={clinicalContext}
            onUpdateClinicalContext={setClinicalContext}
            isEditable={user?.role === ROLES.RADIOLOGIST}
          />

          <MRIUpload studyId={studyId} />

          <div className="sticky top-20">
            <MRIViewer
              studyId={studyId}
              activeAbnormality={selectedGradCAM?.abnormality}
            />
          </div>
        </div>

        {/* Right Column (7 Cols) — Uncluttered Tabbed Workspace */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Tabs Header */}
          <div className="flex items-center justify-between bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('findings')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'findings'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>12 Findings Review</span>
              </button>

              <button
                onClick={() => setActiveTab('gradcam')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'gradcam'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Grad-CAM Explainability</span>
                {selectedGradCAM && (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'report'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>LLM Report & Approval</span>
                {reportData && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>
            </div>

            {/* Quick Action to Generate Report */}
            {findings.length > 0 && user?.role === ROLES.RADIOLOGIST && (
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 shrink-0"
              >
                {generatingReport ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                )}
                <span>Generate Draft ({approvedCount})</span>
              </button>
            )}
          </div>

          {/* TAB 1: 12 Findings Review */}
          {activeTab === 'findings' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Minimal AI Banner */}
              {aiResult && (
                <div className="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between border border-slate-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="font-semibold text-slate-200">
                      {aiResult.model_version} • StandaloneFiveSliceEfficientNet
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                    <span>3 Series</span>
                    <span>•</span>
                    <span>44 Windows</span>
                  </div>
                </div>
              )}

              {findings.length > 0 && (
                <FindingList
                  findings={findings}
                  onApproveFinding={handleApproveFinding}
                  onRejectFinding={handleRejectFinding}
                  onSelectGradCAM={handleSelectGradCAM}
                  selectedGradCAM={selectedGradCAM}
                  readOnly={user?.role !== ROLES.RADIOLOGIST}
                />
              )}
            </div>
          )}

          {/* TAB 2: Grad-CAM Explainability */}
          {activeTab === 'gradcam' && (
            <div className="animate-fadeIn">
              {selectedGradCAM ? (
                <GradCAMViewer
                  studyId={studyId}
                  finding={selectedGradCAM}
                  onClose={() => setActiveTab('findings')}
                />
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500 space-y-2">
                  <Flame className="w-8 h-8 text-amber-500 mx-auto opacity-60" />
                  <p className="font-semibold text-slate-800">No Abnormality Selected for Grad-CAM</p>
                  <p className="text-slate-400">
                    Click the Grad-CAM icon on any finding to inspect feature activation overlays.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LLM Draft Report & Approval */}
          {activeTab === 'report' && (
            <div className="animate-fadeIn">
              {reportData ? (
                <ReportViewer
                  reportData={reportData}
                  onApproveFinal={handleApproveFinal}
                  isApprovedFinal={isApprovedFinal}
                  role={user?.role}
                />
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500 space-y-3">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto opacity-60" />
                  <p className="font-semibold text-slate-800 text-sm">No Draft Report Generated Yet</p>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Approve abnormality findings in the "12 Findings Review" tab, then click <strong>Generate Draft</strong> to synthesize the clinical report.
                  </p>
                  <button
                    onClick={handleGenerateReport}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm transition-colors inline-flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Draft Report Now</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
