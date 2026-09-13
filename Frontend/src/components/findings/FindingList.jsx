import React from 'react';
import FindingCard from './FindingCard';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FindingList({
  findings,
  onApproveFinding,
  onRejectFinding,
  onSelectGradCAM,
  selectedGradCAM,
  readOnly = false,
}) {
  const approvedCount = findings.filter((f) => f.status === 'APPROVED').length;
  const rejectedCount = findings.filter((f) => f.status === 'REJECTED').length;
  const pendingCount = findings.filter((f) => f.status === 'PENDING').length;
  const totalCount = findings.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
      {/* Header Bar with Progress Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-sm">
              AI Abnormality Findings (12 Frozen Classes)
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
              Review Mandatory
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Evaluate raw AI probabilities and approve findings for LLM report synthesis.
          </p>
        </div>

        {/* Progress Pill Bar */}
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
            {approvedCount} Approved
          </span>
          <span className="bg-red-50 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full font-bold">
            {rejectedCount} Rejected
          </span>
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
            {pendingCount} Pending
          </span>
        </div>
      </div>

      {/* Grid of Compact Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {findings.map((finding) => (
          <FindingCard
            key={finding.abnormality}
            finding={finding}
            onApprove={onApproveFinding}
            onReject={onRejectFinding}
            onSelectGradCAM={onSelectGradCAM}
            isSelectedGradCAM={selectedGradCAM?.abnormality === finding.abnormality}
            readOnly={readOnly}
          />
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Only radiologist-approved findings will pass to the LLM report.</span>
        </span>
        <span className="font-mono text-slate-400 font-medium">
          {approvedCount + rejectedCount} / {totalCount} Decided
        </span>
      </div>
    </div>
  );
}
