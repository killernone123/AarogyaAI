import React from 'react';
import { Activity, Globe, RefreshCw, Radio, Bell } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useHealthData } from '../../context/HealthDataContext';

export default function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const { backendConnected, loading, refreshData, alerts } = useHealthData();

  const criticalAlertCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: District Title & Telemetry Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-tealbrand-600 text-white shadow-sm shadow-brand-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                {t('appName')}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                DISTRICT COMMAND
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {t('governmentBadge')}
            </p>
          </div>
        </div>

        {/* Right: Controls & Language Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Telemetry Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{backendConnected ? "Live Telemetry Connected" : "Synthetic Cache Sync"}</span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={refreshData}
            disabled={loading}
            title={t('refreshButton')}
            className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-brand-600" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Alert Notification Pill */}
          <div className="relative">
            <button
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Alerts"
            >
              <Bell className="w-4 h-4" />
              {criticalAlertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
