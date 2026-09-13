import React from 'react';
import { FINDING_STATUS, REPORT_STATUS, APPROVAL_STATUS } from '../../utils/constants';

/**
 * StatusBadge — Reusable Stitch-compliant status indicator.
 * Status colors communicate workflow status, NOT clinical diagnosis.
 */
const STATUS_CONFIG = {
  [FINDING_STATUS.PENDING]: {
    className: 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]',
    dot: 'bg-[#D97706]',
    label: 'Pending',
  },
  [FINDING_STATUS.APPROVED]: {
    className: 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]',
    dot: 'bg-[#15803D]',
    label: 'Approved',
  },
  [FINDING_STATUS.REJECTED]: {
    className: 'bg-[#FFE4E6] text-[#BE123C] border-[#BE123C]',
    dot: 'bg-[#BE123C]',
    label: 'Rejected',
  },
  [REPORT_STATUS.DRAFT]: {
    className: 'bg-[#F1F5F9] text-[#475569] border-[#475569]',
    dot: 'bg-[#475569]',
    label: 'Draft',
  },
  [REPORT_STATUS.FINAL]: {
    className: 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]',
    dot: 'bg-[#15803D]',
    label: 'Final',
  },
  [APPROVAL_STATUS.PENDING]: {
    className: 'bg-[#FEF3C7] text-[#D97706] border-[#D97706]',
    dot: 'bg-[#D97706]',
    label: 'Pending',
  },
  [APPROVAL_STATUS.APPROVED]: {
    className: 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]',
    dot: 'bg-[#15803D]',
    label: 'Approved',
  },
};

export default function StatusBadge({ status, size = 'sm', className = '' }) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#F1F5F9] text-[#475569] border border-[#475569] ${className}`}>
        {status || 'Unknown'}
      </span>
    );
  }

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1 text-xs'
    : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border ${config.className} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
