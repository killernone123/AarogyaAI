import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DemoBadge({ compact = false }) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        SYNTHETIC DEMO DATA
      </span>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900 shadow-sm">
      <div className="flex items-center gap-2 max-w-5xl">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="font-semibold tracking-wide uppercase text-amber-800">
          DEMO MODE:
        </span>
        <span className="text-amber-800">
          {t('demoDataWarning')} All healthcare facilities, patient footfalls, and supply numbers are synthetic simulation benchmarks.
        </span>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-200/60 text-amber-900 border border-amber-300">
          v1.0.0-synthetic
        </span>
      </div>
    </div>
  );
}
