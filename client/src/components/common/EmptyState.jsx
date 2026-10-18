import React from 'react';
import { SearchX } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function EmptyState({ message, onReset }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200/80 my-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <SearchX className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-700">No matching records found</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1">{message || t('emptyCenters')}</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
