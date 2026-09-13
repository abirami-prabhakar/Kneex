import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';

const GOLDEN_CASE_ID = '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

export default function Sidebar() {
  const { role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isStudy = location.pathname.startsWith('/studies');
  const targetStudyId = location.pathname.split('/studies/')[1] || GOLDEN_CASE_ID;

  const scrollToSection = (sectionId) => {
    if (!location.pathname.startsWith('/studies/')) {
      navigate(`/studies/${GOLDEN_CASE_ID}#${sectionId}`);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'dashboard',
      to: '/dashboard',
      isRoute: true,
    },
    {
      id: 'viewer',
      label: 'Upload & Viewer',
      icon: 'upload_file',
      action: () => scrollToSection('viewer'),
    },
    {
      id: 'ai-findings',
      label: '12-Finding AI Analysis',
      icon: 'analytics',
      action: () => scrollToSection('ai-findings'),
      highlight: true,
    },
    {
      id: 'grad-cam',
      label: 'Grad-CAM',
      icon: 'biotech',
      action: () => scrollToSection('grad-cam'),
    },
    {
      id: 'radiologist-review',
      label: 'Radiologist Review',
      icon: 'rate_review',
      action: () => scrollToSection('radiologist-review'),
    },
    {
      id: 'clinical-report',
      label: 'Clinical Report',
      icon: 'description',
      action: () => scrollToSection('clinical-report'),
    },
    {
      id: 'final-approval',
      label: 'Final Approval',
      icon: 'verified',
      action: () => scrollToSection('final-approval'),
    },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between h-[calc(100vh-4rem)] w-64 p-4 border-r border-[#34497F] bg-[#f2f3ff] shadow-[3px_0px_0px_0px_#263B73] shrink-0 sticky top-16 overflow-y-auto">
      {/* Top Protocol Badge & Nav */}
      <div>
        <div className="p-2.5 mb-3 bg-[#FFE0C5] border border-[#34497F] rounded shadow-[1px_1px_0px_#263B73]">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#0b245c] text-lg">folder_special</span>
            <h2 className="text-sm font-bold text-[#0b245c]">Clinical Workflow</h2>
          </div>
          <p className="font-mono text-xs text-[#0b245c]">Protocol: MR-KNEE-884</p>
          <p className="text-[10px] text-[#705a45] mt-1 font-bold uppercase tracking-wider">
            SESSION #994-A • ACTIVE
          </p>
        </div>

        {/* Canonical 7 SideNav Tabs */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.isRoute) {
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#fcddc2] text-[#0b245c] font-bold border border-[#34497F] shadow-[2px_2px_0px_0px_#263B73]'
                        : 'text-[#444650] hover:text-[#0b245c] hover:bg-[#fcddc2]/60'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[#0b245c] text-lg">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            }

            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center gap-3 rounded px-3 py-2 text-xs font-semibold text-left transition-all duration-150 ${
                  isStudy && item.highlight
                    ? 'bg-[#fcddc2] text-[#0b245c] font-bold border border-[#34497F] shadow-[2px_2px_0px_0px_#263B73]'
                    : 'text-[#444650] hover:text-[#0b245c] hover:bg-[#fcddc2]/60'
                }`}
              >
                <span className="material-symbols-outlined text-[#0b245c] text-lg">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer & CTA Section */}
      <div className="pt-4 border-t border-[#34497F]/20 space-y-2">
        <button
          onClick={() => alert("Exporting archival specimen dossier (DICOM PS3.1-2023 & JSON contract)...")}
          className="w-full btn-secondary-archival py-2 px-3 rounded text-[11px] tracking-wider flex items-center justify-center gap-1.5 uppercase font-bold"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          Export Dossier
        </button>

        <div className="space-y-0.5 pt-1">
          <button
            onClick={() => alert("Audit Trail: Attending MD review recorded. KNEE-AI 3.3 standalone inference logged.")}
            className="w-full flex items-center gap-2 text-[#444650] hover:text-[#0b245c] px-3 py-1.5 text-xs font-medium rounded text-left hover:bg-[#fcddc2]/40"
          >
            <span className="material-symbols-outlined text-sm">history</span>
            Audit Trail
          </button>
          <button
            onClick={() => alert("System Diagnostic: Model KNEE-AI 3.3 • EfficientNet-B0 • Backbone Features 8.0 • 12 Classes Active")}
            className="w-full flex items-center gap-2 text-[#444650] hover:text-[#0b245c] px-3 py-1.5 text-xs font-medium rounded text-left hover:bg-[#fcddc2]/40"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            System Diagnostic
          </button>
        </div>
      </div>
    </aside>
  );
}
