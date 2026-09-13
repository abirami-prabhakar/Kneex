import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { FileText, ShieldAlert, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { REPORT_STATUS } from '../../utils/constants';

export default function ReportViewer({ reportData, onApproveFinal, isApprovedFinal, role }) {
  if (!reportData) return null;

  const report = reportData.report || reportData;
  const isFinal = isApprovedFinal || report.status === REPORT_STATUS.FINAL || reportData.status === REPORT_STATUS.FINAL;

  return (
    <div className="clinical-card space-y-5 border-2 border-slate-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
            isFinal ? 'bg-emerald-600' : 'bg-purple-600'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-lg">
                {report.title || 'Knee MRI Clinical Report'}
              </h3>
              <StatusBadge status={isFinal ? 'FINAL' : 'DRAFT'} />
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Study UID: {report.study_id || 'N/A'}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="text-right">
          <span className={`text-xs px-3 py-1 rounded-full font-bold inline-flex items-center space-x-1 ${
            isFinal
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-purple-100 text-purple-800 border border-purple-300'
          }`}>
            {isFinal ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>FINAL APPROVED REPORT</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                <span>LLM DRAFT — PENDING APPROVAL</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Safety Notice Banner */}
      {!isFinal && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Radiologist Final Approval Required</p>
            <p>
              This draft report was synthesized by LLM using <strong>only radiologist-approved AI findings</strong> and clinical context. It is not final until signed off by the radiologist.
            </p>
          </div>
        </div>
      )}

      {/* Report Body Sections */}
      <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 font-sans">
        {/* Approved Findings Section */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Radiologist-Approved Clinical Findings
          </h4>
          {report.findings && report.findings.length > 0 ? (
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-800 font-medium bg-white p-3 rounded-lg border border-slate-200">
              {report.findings.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {typeof item === 'string' ? item : item.finding || JSON.stringify(item)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border border-slate-200">
              No positive abnormality findings approved by radiologist.
            </p>
          )}
        </div>

        {/* Clinical Impression */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Clinical Impression
          </h4>
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed font-normal">
            {report.impression || 'No impression summary available.'}
          </div>
        </div>

        {/* Clinical Context Note */}
        {report.clinical_context && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Patient Context Correlated
            </h4>
            <p className="text-xs text-slate-600 italic">
              "{typeof report.clinical_context === 'string' ? report.clinical_context : JSON.stringify(report.clinical_context)}"
            </p>
          </div>
        )}

        {/* Limitations & Legal Disclaimer */}
        <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-600">Limitations & Governance Statement:</p>
          <p>
            {report.limitations || report.note || 'This AI-assisted report is based strictly on radiologist-approved findings and de-identified patient data.'}
          </p>
        </div>
      </div>

      {/* Approval Panel Action */}
      {!isFinal && onApproveFinal && (
        <div className="pt-2 flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
          <div>
            <p className="text-xs font-bold">Ready to sign off?</p>
            <p className="text-[11px] text-slate-400">Final approval changes report status from DRAFT to FINAL.</p>
          </div>

          <button
            onClick={onApproveFinal}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg transition-all flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve & Lock Final Report</span>
          </button>
        </div>
      )}
    </div>
  );
}
