import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, MODEL_INFO } from '../utils/constants';
import { Activity, ShieldCheck, Stethoscope, User, ArrowRight } from 'lucide-react';

export default function Login() {
  const [name, setName] = useState('Dr. Sarah Jenkins');
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
      description: 'Review AI findings, approve/reject abnormalities, approve final draft report',
      icon: Stethoscope,
      color: 'border-blue-500 bg-blue-50/50 text-blue-900',
    },
    {
      id: ROLES.ORTHOPEDICIAN,
      title: 'Orthopedician',
      description: 'View approved clinical findings, review final reports & treatment context',
      icon: User,
      color: 'border-purple-500 bg-purple-50/50 text-purple-900',
    },
    {
      id: ROLES.PATIENT,
      title: 'Patient',
      description: 'Access patient-friendly explanation, de-identified summary & educational notes',
      icon: ShieldCheck,
      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-900',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl animate-fadeIn">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30">
            <Activity className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            KNEE-AI {MODEL_INFO.version}
          </h1>
          <p className="text-sm text-slate-400">
            Medical MRI Clinical AI Workflow System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter user name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
              Select Role
            </label>
            <div className="space-y-3">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = role === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => setRole(option.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? `${option.color} ring-2 ring-blue-500/20`
                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm">{option.title}</p>
                      <p className="text-xs text-slate-400 leading-snug">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <span>Launch Clinical Interface</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-700 text-center text-xs text-slate-400 space-y-1">
          <p>Strict Safety Compliance: No Automatic Diagnoses</p>
          <p className="text-[11px] text-slate-500">
            Model: StandaloneFiveSliceEfficientNet | 12 Abnormalities
          </p>
        </div>
      </div>
    </div>
  );
}
