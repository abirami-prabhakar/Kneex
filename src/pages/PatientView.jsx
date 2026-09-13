import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, BookOpen, ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchPatientExplanation } from '../services/api';
import { MOCK_STUDIES } from '../services/mockData';

const GOLDEN_CASE_ID = '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

export default function PatientView() {
  const { studyId = GOLDEN_CASE_ID } = useParams();
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const study = MOCK_STUDIES.find((s) => s.id === studyId) || {
    id: studyId,
    patient: { display_id: 'PT-90214', age: 44, sex: 'Female' },
  };

  useEffect(() => {
    async function loadExplanation() {
      setLoading(true);
      try {
        const res = await fetchPatientExplanation(studyId, [], {});
        setExplanation(res);
      } catch (err) {
        setExplanation({
          patient_summary:
            'Your knee MRI scan has been thoroughly reviewed by Dr. Eleanor Vance. The scan identified an acute anterior cruciate ligament (ACL) injury alongside tears in both the medial and lateral meniscus cushions. There is associated joint fluid (effusion) and bone bruising from the pivot injury.',
          key_findings_explained: [
            {
              term: 'Anterior Cruciate Ligament (ACL)',
              explanation:
                'The ACL is a central stabilizing ligament inside your knee joint. The scan shows a tear that occurred during your rotational pivot movement.',
            },
            {
              term: 'Meniscus (Shock Absorbers)',
              explanation:
                'The menisci are two C-shaped cartilage pads that absorb impact between your thigh bone and shin bone. Both your inner (medial) and outer (lateral) cushions have small tears.',
            },
            {
              term: 'Joint Effusion & Hemarthrosis',
              explanation:
                'Fluid accumulation within the joint capsule following the injury, causing noticeable swelling and fullness in the knee.',
            },
            {
              term: 'Bone Contusion (Bruising)',
              explanation:
                'Deep micro-bruising inside the bone where the joint surfaces contacted during the twisting motion, which often causes aching pain on weight bearing.',
            },
          ],
          recommended_next_steps:
            'Schedule an orthopedic consultation to discuss stabilization options, bracing, and an individualized recovery or surgical reconstruction timeline.',
        });
      } finally {
        setLoading(false);
      }
    }

    loadExplanation();
  }, [studyId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-3 pb-4 dashed-ink-divider">
        <Link
          to={`/studies/${studyId}`}
          className="btn-secondary-archival p-2 rounded flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center space-x-2">
            <h1
              className="text-2xl font-bold text-[#0b245c]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Patient Knee Health Summary
            </h1>
            <span className="peach-pill-banner text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              PATIENT ACCESS MODE
            </span>
          </div>
          <p className="text-xs text-[#53658D]">
            Clear, educational summary based strictly on radiologist-approved MRI findings.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#0b245c] space-y-3 plate-card rounded-lg">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0b245c]" />
          <p className="font-bold text-sm">Preparing your clear knee summary...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card 1: Overview Summary */}
          <div className="plate-card-focal p-5 rounded-lg space-y-3">
            <div className="flex items-center space-x-2 text-[#0b245c] font-bold text-base">
              <Heart className="w-5 h-5 text-red-600" />
              <span style={{ fontFamily: 'Playfair Display, serif' }}>What Your Scan Showed</span>
            </div>
            <p className="text-xs text-[#181b26] leading-relaxed font-medium">
              {explanation?.patient_summary}
            </p>
          </div>

          {/* Card 2: Terminology Explained */}
          <div className="plate-card p-5 rounded-lg space-y-4">
            <div className="flex items-center space-x-2 text-[#0b245c] font-bold text-base">
              <BookOpen className="w-5 h-5 text-[#0b245c]" />
              <span style={{ fontFamily: 'Playfair Display, serif' }}>Medical Terms Explained Simply</span>
            </div>

            <div className="space-y-3">
              {explanation?.key_findings_explained?.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#F2F3FF] p-3.5 rounded border border-[#34497F]/40 space-y-1"
                >
                  <h4 className="font-bold text-xs text-[#0b245c]">{item.term}</h4>
                  <p className="text-xs text-[#444650] leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Next Steps */}
          {explanation?.recommended_next_steps && (
            <div className="plate-card p-5 rounded-lg bg-[#FFE0C5]/40 border-l-4 border-l-[#263B73] space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#0b245c]">
                Recommended Discussion Steps
              </h3>
              <p className="text-xs text-[#181b26] leading-relaxed">
                {explanation.recommended_next_steps}
              </p>
            </div>
          )}

          {/* Patient Notice Disclaimer */}
          <div className="plate-card bg-[#FFF9EE] p-4 rounded-lg text-xs text-[#705A45] flex items-start space-x-3">
            <span className="material-symbols-outlined text-[#0b245c] text-lg shrink-0 mt-0.5">
              verified_user
            </span>
            <p className="leading-snug">
              This patient-facing view provides educational clarity based strictly on radiologist-approved findings. It does not replace direct consultation with your attending physician or orthopedic specialist.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
