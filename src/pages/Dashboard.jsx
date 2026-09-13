import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STUDIES } from '../services/mockData';
import StudyCard from '../components/study/StudyCard';
import { Award, ArrowRight } from 'lucide-react';

const GOLDEN_CASE_ID = '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

export default function Dashboard() {
  const studies = MOCK_STUDIES;

  return (
    <div className="space-y-6">
      {/* Header Banner - Archival Plate */}
      <div className="plate-card-focal p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="peach-pill-banner text-[10px] px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
              KNEEX CAD WORKSTATION
            </span>
            <span className="bg-[#DCFCE7] text-[#15803D] border border-[#15803D] text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              ACR-NEMA COMPLIANT
            </span>
          </div>

          <h1
            className="text-2xl lg:text-3xl font-bold tracking-tight text-[#0b245c]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Clinical Dossier Workspace
          </h1>

          <p className="text-xs text-[#444650] max-w-2xl leading-relaxed">
            AI-assisted knee MRI analysis workflow. Review 12 abnormality findings, view Grad-CAM explainability, and stage radiologist-approved findings for structured clinical reports.
          </p>
        </div>

        <Link
          to={`/studies/${GOLDEN_CASE_ID}`}
          className="shrink-0 btn-primary-archival px-5 py-3 rounded flex items-center space-x-2 text-xs uppercase tracking-wider font-bold"
        >
          <Award className="w-4 h-4" />
          <span>Launch Golden Demo Case</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="plate-card p-4 rounded-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded bg-[#EEF0FF] text-[#0b245c] border border-[#34497F] flex items-center justify-center font-bold text-xl font-mono">
            {studies.length}
          </div>
          <div>
            <p className="text-[10px] text-[#53658D] font-bold uppercase tracking-wider">Total Studies</p>
            <p className="font-bold text-[#0b245c] text-sm">Active Workflows</p>
          </div>
        </div>

        <div className="plate-card p-4 rounded-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded bg-[#FFE0C5] text-[#0b245c] border border-[#34497F] flex items-center justify-center font-bold text-xl font-mono">
            1
          </div>
          <div>
            <p className="text-[10px] text-[#53658D] font-bold uppercase tracking-wider">Golden Demo Case</p>
            <p className="font-bold text-[#0b245c] text-xs font-mono truncate max-w-[130px]">PT-90214</p>
          </div>
        </div>

        <div className="plate-card p-4 rounded-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded bg-[#EEF0FF] text-[#0b245c] border border-[#34497F] flex items-center justify-center font-bold text-xl font-mono">
            12
          </div>
          <div>
            <p className="text-[10px] text-[#53658D] font-bold uppercase tracking-wider">Abnormality Classes</p>
            <p className="font-bold text-[#0b245c] text-xs">Frozen Output Order</p>
          </div>
        </div>

        <div className="plate-card p-4 rounded-lg flex items-center space-x-4">
          <div className="w-12 h-12 rounded bg-[#DCFCE7] text-[#15803D] border border-[#15803D] flex items-center justify-center font-bold text-base font-mono">
            100%
          </div>
          <div>
            <p className="text-[10px] text-[#53658D] font-bold uppercase tracking-wider">Radiologist Oversight</p>
            <p className="font-bold text-[#0b245c] text-xs">Mandatory Review</p>
          </div>
        </div>
      </div>

      {/* Active Studies List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0b245c]">view_agenda</span>
            <h2
              className="text-lg font-bold text-[#0b245c]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Recent Knee MRI Studies
            </h2>
          </div>

          <Link
            to="/studies"
            className="text-xs text-[#0b245c] hover:underline font-bold uppercase tracking-wider flex items-center space-x-1"
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
