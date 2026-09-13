import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { User, Calendar, Layers, Activity, ChevronRight } from 'lucide-react';

export default function StudyCard({ study }) {
  const patient = study.patient || {};
  const isGoldenCase = study.id === '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

  return (
    <div className="plate-card p-5 rounded-lg flex flex-col justify-between space-y-4 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#0b245c] text-base" style={{ fontFamily: 'Playfair Display, serif' }}>
              {patient.display_id || patient.patient_id || 'Unknown Patient'}
            </span>
            {isGoldenCase && (
              <span className="text-[10px] bg-[#FFE0C5] text-[#0b245c] border border-[#34497F] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                Golden Case
              </span>
            )}
          </div>
          <p className="text-xs text-[#53658D] font-mono truncate max-w-xs" title={study.id}>
            UID: {study.id}
          </p>
        </div>

        <StatusBadge status={study.review_status || 'PENDING'} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-[#0b245c] bg-[#F2F3FF] p-3 rounded border border-[#34497F]/40 font-mono">
        <div className="flex items-center space-x-1.5">
          <User className="w-3.5 h-3.5 text-[#53658D]" />
          <span>{patient.age}y / {patient.sex}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-[#53658D]" />
          <span>{study.series_count || 3} Series ({study.windows_count || 44} W)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#53658D]" />
          <span>{new Date(study.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-[#15803D]" />
          <span>KNEE-AI 3.3</span>
        </div>
      </div>

      {patient.clinical_context?.symptoms && (
        <div className="text-xs text-[#181b26] line-clamp-2 italic bg-[#FFF9EE] p-2 rounded border border-dashed border-[#34497F]/40">
          "{patient.clinical_context.symptoms}"
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <Link
          to={`/studies/${study.id}`}
          className="btn-primary-archival px-3 py-1.5 rounded text-[11px] uppercase tracking-wider inline-flex items-center gap-1 font-bold"
        >
          <span>Open Study Workspace</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
