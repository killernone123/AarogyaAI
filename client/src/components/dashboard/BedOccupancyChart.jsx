import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BedDouble, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useHealthData } from '../../context/HealthDataContext';

export default function BedOccupancyChart() {
  const { language, t } = useLanguage();
  const { centers } = useHealthData();

  // Format data for chart
  const data = centers.map((c) => {
    const total = c.beds?.total || 10;
    const occupied = c.beds?.occupied || 5;
    const vacant = Math.max(0, total - occupied);
    const occupancyRate = Math.round((occupied / total) * 100);

    return {
      name: c.id,
      fullName: language === 'hi' ? c.nameHi : c.name,
      occupied,
      vacant,
      total,
      occupancyRate
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1.5 border border-slate-700">
          <p className="font-bold text-slate-100">{item.fullName} ({item.name})</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-teal-400">Occupied Beds:</span>
            <span className="font-bold text-white">{item.occupied}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Vacant Beds:</span>
            <span className="font-bold text-white">{item.vacant}</span>
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold">
            <span className="text-slate-300">Occupancy Rate:</span>
            <span className={`${item.occupancyRate >= 90 ? 'text-rose-400' : item.occupancyRate >= 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {item.occupancyRate}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <BedDouble className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t('chartBedTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('chartBedSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-brand-600" />
              <span>Occupied</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200" />
              <span>Vacant</span>
            </span>
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="occupied" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
              <Bar dataKey="vacant" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 text-amber-700">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>PHC-03 & CHC-01 operating near or at 100% saturation</span>
        </span>
        <span className="font-semibold text-slate-700">Total District Capacity: 294 Beds</span>
      </div>
    </div>
  );
}
