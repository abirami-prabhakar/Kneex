import { FINDING_STATUS, REPORT_STATUS, APPROVAL_STATUS } from '../../utils/constants';

/**
 * StatusBadge — Reusable status indicator component.
 *
 * Supports workflow statuses:
 * - Finding: PENDING / APPROVED / REJECTED
 * - Report: DRAFT / FINAL
 * - Approval: PENDING / APPROVED
 *
 * Status colors communicate workflow status, NOT diagnosis.
 */
const STATUS_CONFIG = {
  [FINDING_STATUS.PENDING]: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  [FINDING_STATUS.APPROVED]: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Approved',
  },
  [FINDING_STATUS.REJECTED]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    label: 'Rejected',
  },
  [REPORT_STATUS.DRAFT]: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    dot: 'bg-violet-500',
    label: 'Draft',
  },
  [REPORT_STATUS.FINAL]: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Final',
  },
};

export default function StatusBadge({ status, size = 'sm', className = '' }) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
        {status || 'Unknown'}
      </span>
    );
  }

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1 text-sm'
    : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
