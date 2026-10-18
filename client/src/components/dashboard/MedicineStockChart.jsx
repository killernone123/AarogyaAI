import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { Pill, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useHealthData } from '../../context/HealthDataContext';

export default function MedicineStockChart() {
  const { language, t } = useLanguage();
  const { inventory } = useHealthData();

  // Prepare chart data with usableStock and daysRemaining
  const chartData = inventory.slice(0, 7).map((item) => {
    const rawDays = item.daysRemaining !== null && item.daysRemaining !== undefined
      ? item.daysRemaining
      : (item.overallDaysRemaining || 10);
    const stock = item.usableStock !== undefined ? item.usableStock : (item.stock || item.totalDistrictStock || 0);

    return {
      name: language === 'hi' && item.nameHi ? item.nameHi : item.name,
      daysRemaining: parseFloat(Number(rawDays).toFixed(1)),
      category: item.category,
      stock,
      unit: item.unit || "units",
      status: item.riskLevel || item.status
    };
  });

  const getBarColor = (days) => {
    if (days < 3) return '#e11d48'; // Critical Rose
    if (days < 7) return '#f59e0b'; // Amber Warning
    return '#0d9488'; // Teal Optimal
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1 border border-slate-700">
          <p className="font-bold text-sm text-slate-100">{label}</p>
          <p className="text-slate-300">Category: <span className="text-brand-300">{data.category}</span></p>
          <p className="text-slate-300">Total Stock: <span className="font-semibold text-white">{data.stock.toLocaleString()} {data.unit}</span></p>
          <div className="pt-1 border-t border-slate-800 flex items-center justify-between gap-4">
            <span className="text-slate-400">Days Remaining:</span>
            <span className={`font-bold text-sm ${data.daysRemaining < 3 ? 'text-rose-400' : data.daysRemaining < 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {data.daysRemaining} days
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
            <div className="p-2 bg-teal-50 text-tealbrand-600 rounded-lg border border-teal-100">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t('chartMedicineTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('chartMedicineSubtitle')}
              </p>
            </div>
          </div>

          {/* Legend Chips */}
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>&lt;3d (Critical)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>3-7d (Low)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              <span>&gt;7d (Safe)</span>
            </span>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                unit="d"
                tick={{ fontSize: 11, fill: '#64748b' }}
                domain={[0, 22]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#334155' }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={3}
                stroke="#e11d48"
                strokeDasharray="4 4"
                label={{
                  value: 'Critical: 3d',
                  fill: '#e11d48',
                  fontSize: 10,
                  position: 'top'
                }}
              />
              <ReferenceLine
                x={7}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'Re-order: 7d',
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'top'
                }}
              />
              <Bar dataKey="daysRemaining" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.daysRemaining)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Burn rates calibrated on trailing 7-day PHC/CHC consumption</span>
        </span>
        <span className="font-semibold text-slate-700">6 Monitored Formulations</span>
      </div>
    </div>
  );
}
