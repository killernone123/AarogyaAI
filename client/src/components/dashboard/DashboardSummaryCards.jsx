import React from 'react';
import {
  Building2,
  BedDouble,
  Stethoscope,
  AlertTriangle,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useHealthData } from '../../context/HealthDataContext';

export default function DashboardSummaryCards() {
  const { t } = useLanguage();
  const { summary } = useHealthData();

  const cards = [
    {
      id: 'centers',
      title: t('metricCenters'),
      value: summary?.totalHealthCenters || 8,
      subtext: t('metricCentersSub'),
      icon: Building2,
      trend: "100% Online",
      trendType: "neutral",
      iconBg: "bg-blue-50 text-brand-600 border-blue-200"
    },
    {
      id: 'beds',
      title: t('metricBedOccupancy'),
      value: `${summary?.bedOccupancyRate || 78.9}%`,
      subtext: `${summary?.occupiedBeds || 232} / ${summary?.totalBeds || 294} Beds`,
      icon: BedDouble,
      trend: "+4.1% today",
      trendType: "up",
      iconBg: "bg-teal-50 text-tealbrand-600 border-teal-200"
    },
    {
      id: 'doctors',
      title: t('metricDoctorAttendance'),
      value: `${summary?.doctorAttendanceRate || 80}%`,
      subtext: `${summary?.doctorsOnDuty || 44} / ${summary?.totalDoctorsSanctioned || 55} on duty`,
      icon: Stethoscope,
      trend: "4 shifts pending",
      trendType: "down",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200"
    },
    {
      id: 'stockouts',
      title: t('metricStockouts'),
      value: summary?.activeCriticalStockouts || 3,
      subtext: `${summary?.lowStockAlerts || 8} items nearing depletion`,
      icon: AlertTriangle,
      trend: "Urgent Action",
      trendType: "alert",
      iconBg: "bg-rose-50 text-rose-600 border-rose-200"
    },
    {
      id: 'footfall',
      title: t('metricFootfall'),
      value: summary?.todayTotalFootfall?.toLocaleString() || "1,267",
      subtext: t('metricFootfallSub'),
      icon: Users,
      trend: "+3.2%",
      trendType: "up",
      iconBg: "bg-sky-50 text-sky-600 border-sky-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg border ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate max-w-[130px]" title={card.subtext}>
                {card.subtext}
              </span>
              <span
                className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                  card.trendType === 'alert'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : card.trendType === 'up'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : card.trendType === 'down'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
