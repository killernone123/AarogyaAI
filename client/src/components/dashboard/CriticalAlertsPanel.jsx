import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useHealthData } from '../../context/HealthDataContext';

export default function CriticalAlertsPanel() {
  const { language, t } = useLanguage();
  const { alerts, acknowledgeAlert } = useHealthData();
  const [filter, setFilter] = useState('ALL');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'ALL') return true;
    return alert.severity.toLowerCase() === filter.toLowerCase();
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          border: 'border-l-4 border-l-rose-500 bg-rose-50/40',
          icon: AlertOctagon,
          iconColor: 'text-rose-600'
        };
      case 'warning':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          border: 'border-l-4 border-l-amber-500 bg-amber-50/40',
          icon: AlertTriangle,
          iconColor: 'text-amber-600'
        };
      default:
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          border: 'border-l-4 border-l-blue-500 bg-blue-50/40',
          icon: Info,
          iconColor: 'text-blue-600'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t('alertsTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('alertsSubtitle')}
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            {['ALL', 'CRITICAL', 'WARNING'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filter === f
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Items List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="font-semibold text-slate-700">No unresolved alerts in this category</p>
              <p className="text-slate-500">All health centers operating within baseline safety margins.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const style = getSeverityStyle(alert.severity);
              const Icon = style.icon;

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border border-slate-200/80 transition-all ${style.border}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${style.badge}`}>
                            {alert.severity}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {language === 'hi' ? alert.centerNameHi : alert.centerName}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.timestamp}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 mt-1.5">
                          {language === 'hi' ? alert.titleHi : alert.title}
                        </h4>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {alert.description}
                        </p>

                        {/* Action Recommendation Box */}
                        {alert.actionSuggested && (
                          <div className="mt-2.5 p-2 rounded-lg bg-white/90 border border-slate-200 text-xs flex items-start gap-2">
                            <span className="font-semibold text-brand-700 flex-shrink-0">
                              {t('actionRecommended')}
                            </span>
                            <span className="text-slate-700">
                              {alert.actionSuggested}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-end gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                      >
                        {t('dismiss')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Automatic telemetry refresh every 60s</span>
        <span className="font-semibold text-slate-700">{filteredAlerts.length} Alerts Active</span>
      </div>
    </div>
  );
}
