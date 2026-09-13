import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { FINDING_DISPLAY_LABELS, formatProbability } from '../../utils/labels';
import { FINDING_STATUS } from '../../utils/constants';
import { Check, X, Flame } from 'lucide-react';

export default function FindingCard({
  finding,
  onApprove,
  onReject,
  onSelectGradCAM,
  isSelectedGradCAM,
  readOnly = false,
}) {
  const displayLabel = FINDING_DISPLAY_LABELS[finding.abnormality] || finding.abnormality;
  const isApproved = finding.status === FINDING_STATUS.APPROVED;
  const isRejected = finding.status === FINDING_STATUS.REJECTED;

  return (
    <div
      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
        isApproved
          ? 'border-emerald-200 bg-emerald-50/30'
          : isRejected
          ? 'border-red-200 bg-red-50/20 opacity-75'
          : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
      }`}
    >
      {/* Abnormality Name & Number */}
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <span className="text-[11px] font-mono font-bold text-slate-400 w-6 shrink-0">
          #{finding.class_index != null ? String(finding.class_index + 1).padStart(2, '0') : '--'}
        </span>
        <div className="truncate">
          <h4 className="font-semibold text-slate-900 text-xs truncate" title={displayLabel}>
            {displayLabel}
          </h4>
        </div>
      </div>

      {/* Probability Gauge Badge */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="text-right">
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
            finding.probability >= 0.5
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            {formatProbability(finding.probability)}
          </span>
        </div>

        {/* Grad-CAM Trigger */}
        <button
          onClick={() => onSelectGradCAM && onSelectGradCAM(finding)}
          title="Inspect Grad-CAM Overlay"
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            isSelectedGradCAM
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
        </button>

        {/* Approve / Reject Pill Actions */}
        {!readOnly && (
          <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
            <button
              onClick={() => onReject && onReject(finding.abnormality)}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                isRejected
                  ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/20'
                  : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Reject Abnormality"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onApprove && onApprove(finding.abnormality)}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                isApproved
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title="Approve Abnormality"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
