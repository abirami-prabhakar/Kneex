import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { Activity, Bell, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const { user, role, switchRole, logout } = useAuth();
  const location = useLocation();

  const isStudyDetails = location.pathname.startsWith('/studies/');

  return (
    <header className="flex justify-between items-center w-full px-4 lg:px-8 h-16 border-b border-[#34497F] bg-white shadow-[0_3px_0px_0px_#263B73] sticky top-0 z-50">
      {/* Left: Brand Anchor & Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#0b245c] text-[#FFF9EE] flex items-center justify-center border border-[#0b245c] shadow-[1.5px_1.5px_0px_#263B73]">
            <Activity className="w-4 h-4 text-[#FFF9EE]" />
          </div>
          <span
            className="text-2xl font-bold tracking-tight text-[#0b245c]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            KNEEX
          </span>
        </Link>

        {isStudyDetails && (
          <>
            <div className="h-6 w-[1.5px] bg-[#34497F] hidden md:block opacity-30"></div>
            <div className="hidden sm:flex items-center gap-2 text-[#0b245c] font-mono text-xs font-semibold">
              <span className="bg-[#EEF0FF] px-2 py-0.5 border border-[#34497F] rounded text-[11px]">
                STUDY: PT-90214 • MR-KNEE-884
              </span>
            </div>
          </>
        )}
      </div>

      {/* Center Navigation Links (Role awareness / Switching) */}
      <nav className="hidden md:flex items-center space-x-6">
        <button
          onClick={() => switchRole(ROLES.RADIOLOGIST)}
          className={`pb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold transition-colors ${
            role === ROLES.RADIOLOGIST
              ? 'text-[#0b245c] border-b-2 border-[#0b245c]'
              : 'text-[#444650] hover:text-[#0b245c]'
          }`}
        >
          {role === ROLES.RADIOLOGIST && (
            <span className="w-2 h-2 rounded-full bg-[#0b245c] inline-block animate-pulse"></span>
          )}
          Radiologist
        </button>

        <button
          onClick={() => switchRole(ROLES.ORTHOPEDICIAN)}
          className={`pb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold transition-colors ${
            role === ROLES.ORTHOPEDICIAN
              ? 'text-[#0b245c] border-b-2 border-[#0b245c]'
              : 'text-[#444650] hover:text-[#0b245c]'
          }`}
        >
          {role === ROLES.ORTHOPEDICIAN && (
            <span className="w-2 h-2 rounded-full bg-[#0b245c] inline-block animate-pulse"></span>
          )}
          Orthopedician
        </button>

        <button
          onClick={() => switchRole(ROLES.PATIENT)}
          className={`pb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold transition-colors ${
            role === ROLES.PATIENT
              ? 'text-[#0b245c] border-b-2 border-[#0b245c]'
              : 'text-[#444650] hover:text-[#0b245c]'
          }`}
        >
          {role === ROLES.PATIENT && (
            <span className="w-2 h-2 rounded-full bg-[#0b245c] inline-block animate-pulse"></span>
          )}
          Patient
        </button>
      </nav>

      {/* Right Cluster: Status Badge, Actions, Profile */}
      <div className="flex items-center gap-3">
        {/* Status Badge */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider bg-[#FEF3C7] text-[#D97706] border border-[#D97706] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
          Final Approval: PENDING
        </span>

        {/* Action Button */}
        {role === ROLES.RADIOLOGIST && (
          <Link
            to="/studies/1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260"
            className="btn-primary-archival px-3 py-1.5 rounded text-[11px] uppercase tracking-wider flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Final Approval
          </Link>
        )}

        {/* Trailing Icon Actions */}
        <div className="hidden lg:flex items-center gap-1 border-l border-[#34497F]/25 pl-2 ml-1 text-[#0b245c]">
          <button
            className="p-1.5 rounded hover:bg-[#EEF0FF] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-[#EEF0FF] transition-colors"
            title="Help & Protocol Documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Image & Sign Out */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#34497F]/30">
          <div className="w-8 h-8 rounded-full border border-[#0b245c] bg-[#263B73] text-[#FFF9EE] flex items-center justify-center font-bold text-xs">
            EV
          </div>
          <div className="hidden 2xl:flex flex-col text-left">
            <span className="font-bold text-[#0b245c] text-xs leading-tight">
              {user?.name || 'Dr. Eleanor Vance'}
            </span>
            <span className="text-[#53658D] text-[10px] uppercase tracking-wider">
              {role === ROLES.RADIOLOGIST
                ? 'Lead Radiologist'
                : role === ROLES.ORTHOPEDICIAN
                ? 'Orthopedic Surgeon'
                : 'Patient View'}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-[#444650] hover:text-[#ba1a1a] text-[11px] uppercase tracking-wider font-semibold hidden xl:block ml-1 hover:underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
