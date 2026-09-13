import React, { useState } from 'react';
import { User, ShieldCheck, ChevronDown, ChevronUp, Edit2, Check } from 'lucide-react';

export default function PatientCard({ patient, clinicalContext, onUpdateClinicalContext, isEditable = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [symptoms, setSymptoms] = useState(clinicalContext?.symptoms || patient?.clinical_context?.symptoms || '');
  const [medicalHistory, setMedicalHistory] = useState(clinicalContext?.medical_history || patient?.clinical_context?.medical_history || '');
  const [clinicalNotes, setClinicalNotes] = useState(clinicalContext?.clinical_notes || patient?.clinical_context?.clinical_notes || '');

  const handleSave = () => {
    if (onUpdateClinicalContext) {
      onUpdateClinicalContext({
        symptoms,
        medical_history: medicalHistory,
        clinical_notes: clinicalNotes,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all overflow-hidden">
      {/* Compact Header Bar */}
      <div className="p-3.5 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm">
                {patient?.display_id || patient?.patient_id || 'Unknown Patient'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                ({patient?.age != null ? `${patient.age}y` : 'N/A'}, {patient?.sex || 'Unknown'})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 italic">
              "{symptoms || 'No symptoms documented.'}"
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="hidden sm:flex items-center space-x-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span>De-identified</span>
          </span>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center space-x-1 text-xs font-medium"
          >
            <span>{isExpanded ? 'Hide Details' : 'Context'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Clinical Details */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-100 bg-white space-y-3 text-xs animate-fadeIn">
          <div className="flex justify-end">
            {isEditable && (
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 bg-blue-50 px-2.5 py-1 rounded-md"
              >
                {isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Symptoms
            </label>
            {isEditing ? (
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                {symptoms || 'No symptoms documented.'}
              </p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Medical History
            </label>
            {isEditing ? (
              <textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {medicalHistory || 'No medical history recorded.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
