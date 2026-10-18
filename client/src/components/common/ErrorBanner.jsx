import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ErrorBanner({ message, onRetry }) {
  const { t } = useLanguage();

  return (
    <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 text-red-800 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-100 text-red-600">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{t('errorTitle')}</h4>
          <p className="text-xs text-red-700 mt-0.5">{message || "Operating on offline synthetic dataset cache."}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-red-300 text-red-700 hover:bg-red-50 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t('errorRetry')}
        </button>
      )}
    </div>
  );
}
