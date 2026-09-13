import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Activity, User, ShieldCheck, Stethoscope } from 'lucide-react';
import { ROLES, MODEL_INFO } from '../../utils/constants';

export default function Navbar() {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case ROLES.RADIOLOGIST:
        return { label: 'Radiologist', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case ROLES.ORTHOPEDICIAN:
        return { label: 'Orthopedician', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case ROLES.PATIENT:
        return { label: 'Patient Access', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: role, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const roleStyle = getRoleBadge(user?.role);

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-white px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left: Brand / System Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                KNEE-AI
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-medium border border-cyan-900/50">
                v{MODEL_INFO.version}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Clinical MRI AI Workflow</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-300">
            Radiologist Review Mandatory
          </span>
        </div>
      </div>

      {/* Right: User profile, role switch, logout */}
      {user && (
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
            <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
            <span>{MODEL_INFO.architecture}</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-100">{user.name}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold inline-block ${roleStyle.color}`}>
                {roleStyle.label}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-ring"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
