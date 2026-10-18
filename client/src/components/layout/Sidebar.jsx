import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Pill,
  Users,
  BedDouble,
  FlaskConical,
  AlertOctagon,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'centers', label: t('navCenters'), icon: Building2 },
    { id: 'inventory', label: t('navInventory'), icon: Pill },
    { id: 'footfall', label: t('navFootfall'), icon: Users },
    { id: 'beds', label: 'Beds & Capacity', icon: BedDouble },
    { id: 'diagnostics', label: t('navDiagnostics'), icon: FlaskConical },
    { id: 'alerts', label: 'Critical Alerts', icon: AlertOctagon, badge: '3' },
    { id: 'redistribution', label: t('navRedistribution'), icon: ArrowRightLeft, isPreview: true }
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 shadow-2xs">
      <div className="space-y-6">
        {/* District Selector / Meta Header */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            District Zone
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            Ramanagar District
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-tealbrand-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-tealbrand-500"></span>
            8 Centers Connected
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    {item.badge}
                  </span>
                )}

                {item.isPreview && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-tight rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-100 mt-6">
        <div className="p-3 bg-gradient-to-br from-brand-50/70 to-tealbrand-50/70 rounded-xl border border-brand-100 text-xs">
          <div className="font-semibold text-slate-800">AarogyaAI Core v1.0</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            MoHFW Telemetry Simulation
          </div>
          <div className="mt-2 text-[10px] text-brand-700 font-medium flex items-center gap-1">
            <span>Synthetic Benchmark Ready</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </aside>
  );
}
