import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, MODEL_INFO } from '../utils/constants';
import { Activity, ShieldCheck, Stethoscope, User, ArrowRight } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('Dr. Eleanor Vance');
  const [role, setRole] = useState(ROLES.RADIOLOGIST);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ name, role, id: `user-${Date.now()}` });
    navigate('/dashboard');
  };

  const roleOptions = [
    {
      id: ROLES.RADIOLOGIST,
      title: 'Radiologist',
      description: 'Review AI findings, approve/reject abnormalities, sign final dossier',
      icon: Stethoscope,
    },
    {
      id: ROLES.ORTHOPEDICIAN,
      title: 'Orthopedician',
      description: 'View approved clinical findings, surgical indications & treatment context',
      icon: User,
    },
    {
      id: ROLES.PATIENT,
      title: 'Patient',
      description: 'Access patient-friendly explanation, de-identified summary & educational notes',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full plate-card-focal p-8 rounded-lg space-y-6">
        <div className="text-center space-y-2 pb-4 dashed-ink-divider">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-[#0b245c] text-[#FFF9EE] border border-[#0b245c] shadow-[2px_2px_0px_#263B73] mb-1">
            <Activity className="w-6 h-6 text-[#FFF9EE]" />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight text-[#0b245c]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            KNEEX
          </h1>
          <p className="text-xs text-[#53658D] font-mono uppercase tracking-wider">
            Clinical Knee MRI CAD Workstation • v{MODEL_INFO.version}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0b245c] mb-1.5">
              Clinician / User Identifier
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[#F2F3FF] border border-[#34497F] rounded text-[#0b245c] font-semibold text-xs focus:outline-none focus:border-[#0b245c]"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#0b245c] mb-1.5">
              Select Clinical Access Role
            </label>
            <div className="space-y-2">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = role === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setRole(option.id)}
                    className={`p-3 rounded border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                      isSelected
                        ? 'bg-[#FFE0C5] border-[#34497F] shadow-[2px_2px_0px_0px_#263B73]'
                        : 'bg-[#FFF9EE] border-[#34497F]/50 hover:bg-[#EEF0FF]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#0b245c]' : 'text-[#53658D]'}`} />
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-[#0b245c]">{option.title}</p>
                      <p className="text-[11px] text-[#444650] leading-snug">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary-archival py-3 px-4 rounded text-xs uppercase tracking-wider flex items-center justify-center space-x-2 font-bold"
          >
            <span>Launch Clinical Interface</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-dashed border-[#34497F]/30 text-center text-[10px] uppercase font-bold tracking-wider text-[#705A45] space-y-0.5">
          <p>Strict Safety Compliance: No Unsupervised Autonomous Diagnoses</p>
          <p className="font-mono text-[#53658D]">
            Model: StandaloneFiveSliceEfficientNet • 12 Classes
          </p>
        </div>
      </div>
    </div>
  );
}
