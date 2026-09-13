import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  UserCheck,
  Award,
  BookOpen,
  Info
} from 'lucide-react';
import { ROLES } from '../../utils/constants';

const GOLDEN_CASE_ID = '1.2.826.0.1.3680043.8.498.10004873229099053869093324292195817260';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || ROLES.RADIOLOGIST;

  const baseNavItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Studies List',
      path: '/studies',
      icon: FileSpreadsheet,
    },
    {
      label: 'Golden Demo Case',
      path: `/studies/${GOLDEN_CASE_ID}`,
      icon: Award,
      badge: 'Golden Case',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {baseNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Safety Principles Widget */}
        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-xs">
            <Info className="w-4 h-4 shrink-0" />
            <span>AI Safety Invariants</span>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside leading-tight">
            <li>No automatic AI diagnoses</li>
            <li>Radiologist review required</li>
            <li>Unapproved findings blocked</li>
            <li>Strict 12-class output order</li>
          </ul>
        </div>
      </div>

      {/* Footer / System Meta */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <p className="font-semibold text-slate-400">KNEE-AI 3.3 System</p>
        <p>StandaloneFiveSliceEfficientNet</p>
        <p className="text-[10px] text-slate-600 mt-1">Backend Adapter Frozen v1.0</p>
      </div>
    </aside>
  );
}
