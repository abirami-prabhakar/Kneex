import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STUDIES } from '../services/mockData';
import StudyCard from '../components/study/StudyCard';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, Award, FileSpreadsheet, Layers, ArrowRight } from 'lucide-react';
import { MODEL_INFO } from '../utils/constants';

const GOLDEN_CASE_ID = '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

export default function Dashboard() {
  const { user } = useAuth();
  const studies = MOCK_STUDIES;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              KNEE-AI {MODEL_INFO.version} Clinical System
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Safety Compliant
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.name || 'Radiologist'}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            AI-assisted knee MRI analysis workflow. Review 12 abnormality findings, view Grad-CAM explainability, and generate radiologist-controlled LLM reports.
          </p>
        </div>

        <Link
          to={`/studies/${GOLDEN_CASE_ID}`}
          className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
        >
          <Award className="w-5 h-5" />
          <span>Launch Golden Demo Case</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clinical-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
            {studies.length}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Studies</p>
            <p className="font-bold text-slate-800 text-lg">Active Workflows</p>
          </div>
        </div>

        <div className="clinical-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            1
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Golden Demo Case</p>
            <p className="font-bold text-slate-800 text-sm font-mono truncate max-w-[130px]">DEMO-PATIENT-001</p>
          </div>
        </div>

        <div className="clinical-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
            12
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Abnormality Classes</p>
            <p className="font-bold text-slate-800 text-sm">Frozen Output Order</p>
          </div>
        </div>

        <div className="clinical-card flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            100%
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Radiologist Oversight</p>
            <p className="font-bold text-slate-800 text-sm">Mandatory Review</p>
          </div>
        </div>
      </div>

      {/* Active Studies List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent MRI Clinical Studies</h2>
          <Link
            to="/studies"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
          >
            <span>View All Studies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      </div>
    </div>
  );
}
