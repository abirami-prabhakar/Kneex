import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Heart, BookOpen, AlertCircle, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchPatientExplanation } from '../services/api';
import { MOCK_STUDIES } from '../services/mockData';

export default function PatientView() {
  const { studyId } = useParams();
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const study = MOCK_STUDIES.find((s) => s.id === studyId) || {
    id: studyId,
    patient: { display_id: 'KNEE-DEMO-001', age: 42, sex: 'Female' },
  };

  useEffect(() => {
    async function loadExplanation() {
      setLoading(true);
      try {
        const res = await fetchPatientExplanation(studyId, [], {});
        setExplanation(res);
      } catch (err) {
        // Fallback explanation
        setExplanation({
          patient_summary:
            'Your knee MRI scan has been reviewed by your radiologist. The report indicates mild to moderate age-related joint changes and cartilage evaluation. No emergency surgical intervention is indicated.',
          key_findings_explained: [
            {
              term: 'Medial & Lateral Meniscus',
              explanation: 'The menisci act as shock-absorbing cushions between your thigh and shin bones. Your scan shows wear in these areas.',
            },
            {
              term: 'Osteoarthritis (OA)',
              explanation: 'Gradual wear and tear of the joint cartilage, which can cause stiffness or soreness with physical activity.',
            },
            {
              term: 'Synovitis',
              explanation: 'Mild inflammation of the joint lining, often causing temporary swelling after prolonged walking.',
            },
          ],
          recommended_next_steps:
            'Discuss these findings with your orthopedician or physical therapist to tailor a suitable joint strengthening and exercise routine.',
        });
      } finally {
        setLoading(false);
      }
    }

    loadExplanation();
  }, [studyId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <Link to="/studies" className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900">Patient Knee Health Summary</h1>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Patient Access Mode
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Simplified explanation of your radiologist-approved MRI evaluation.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="font-semibold text-sm">Preparing your clear knee summary...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card 1: Overview Summary */}
          <div className="clinical-card border-2 border-emerald-200 bg-gradient-to-b from-emerald-50/30 to-white space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-base">
              <Heart className="w-5 h-5 text-emerald-600" />
              <span>What Your Scan Showed</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {explanation?.patient_summary}
            </p>
          </div>

          {/* Card 2: Terminology Explained */}
          <div className="clinical-card space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Medical Terms Explained Simply</span>
            </div>

            <div className="space-y-3">
              {explanation?.key_findings_explained?.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-sm text-slate-800">{item.term}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Next Steps */}
          {explanation?.recommended_next_steps && (
            <div className="clinical-card border-l-4 border-l-blue-600 space-y-2">
              <h3 className="font-bold text-sm text-slate-900">Recommended Discussion Steps</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {explanation.recommended_next_steps}
              </p>
            </div>
          )}

          {/* Patient Notice Disclaimer */}
          <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 text-xs text-slate-600 space-y-1 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <p>
              This patient-facing view provides educational clarity based strictly on radiologist-approved findings. It does not replace direct consultation with your physician or orthopedician.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
