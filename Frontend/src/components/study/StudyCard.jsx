import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { User, Calendar, Layers, Activity, ChevronRight } from 'lucide-react';

export default function StudyCard({ study }) {
  const patient = study.patient || {};
  const isGoldenCase = study.id === '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

  return (
    <div className="clinical-card hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 text-base">
              {patient.display_id || patient.patient_id || 'Unknown Patient'}
            </span>
            {isGoldenCase && (
              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                Golden Demo Case
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono truncate max-w-xs" title={study.id}>
            UID: {study.id}
          </p>
        </div>

        <StatusBadge status={study.review_status || 'PENDING'} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <div className="flex items-center space-x-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{patient.age}y / {patient.sex}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>{study.series_count || 3} Series ({study.windows_count || 44} Windows)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{new Date(study.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-500" />
          <span>AI 3.3 Evaluated</span>
        </div>
      </div>

      {patient.clinical_context?.symptoms && (
        <div className="text-xs text-slate-500 line-clamp-2 italic bg-slate-50/50 p-2 rounded border border-slate-100">
          "{patient.clinical_context.symptoms}"
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <Link
          to={`/studies/${study.id}`}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>Open Study Workspace</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
