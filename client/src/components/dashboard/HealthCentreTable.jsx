import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Stethoscope,
  BedDouble,
  X,
  Pill,
  MapPin,
  Phone
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useHealthData } from '../../context/HealthDataContext';
import EmptyState from '../common/EmptyState';

export default function HealthCentreTable() {
  const { language, t } = useLanguage();
  const { centers } = useHealthData();

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState(null);

  // Filter centers
  const filteredCenters = centers.filter((c) => {
    const matchesType = typeFilter === 'ALL' || c.type.toUpperCase() === typeFilter.toUpperCase();
    const q = searchQuery.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(q) || (c.nameHi && c.nameHi.includes(q));
    const blockMatch = c.block?.toLowerCase().includes(q);
    return matchesType && (nameMatch || blockMatch);
  });

  const getVulnerabilityBadge = (score) => {
    if (score >= 70) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          {score} / 100 (Critical)
        </span>
      );
    }
    if (score >= 40) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          {score} / 100 (Moderate)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        {score} / 100 (Stable)
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-200/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg border border-brand-100">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t('centersTableTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('centersTableSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold w-full sm:w-auto">
              {[
                { id: 'ALL', label: t('filterAll') },
                { id: 'DH', label: t('filterDH') },
                { id: 'CHC', label: t('filterCHC') },
                { id: 'PHC', label: t('filterPHC') }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setTypeFilter(btn.id)}
                  className={`px-3 py-1 rounded-md transition-all text-xs ${
                    typeFilter === btn.id
                      ? 'bg-white text-brand-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table view */}
      {filteredCenters.length === 0 ? (
        <EmptyState
          message="No healthcare facilities matched the current filter criteria."
          onReset={() => {
            setTypeFilter('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{t('colCenterName')}</th>
                <th className="py-3 px-4">{t('colTier')}</th>
                <th className="py-3 px-4">{t('colBeds')}</th>
                <th className="py-3 px-4">{t('colDoctors')}</th>
                <th className="py-3 px-4">{t('colStockStatus')}</th>
                <th className="py-3 px-4">{t('colDiagnostics')}</th>
                <th className="py-3 px-4">{t('colVulnerability')}</th>
                <th className="py-3 px-4 text-right">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCenters.map((center) => {
                const totalBeds = center.beds?.total || 10;
                const occupiedBeds = center.beds?.occupied || 0;
                const bedRate = Math.round((occupiedBeds / totalBeds) * 100);

                const doctorsOnDuty = center.doctors?.onDuty || 0;
                const doctorsSanctioned = center.doctors?.sanctioned || 0;
                const doctorRate = doctorsSanctioned > 0 ? Math.round((doctorsOnDuty / doctorsSanctioned) * 100) : 100;

                const criticalCount = center.stockStatus?.critical || 0;
                const lowCount = center.stockStatus?.low || 0;

                return (
                  <tr
                    key={center.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedCenter(center)}
                  >
                    {/* Facility Name & ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {language === 'hi' ? center.nameHi : center.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {center.id}
                      </div>
                    </td>

                    {/* Tier / Block */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {center.type}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Block: {center.block}
                      </div>
                    </td>

                    {/* Bed Occupancy */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-800">
                          {occupiedBeds}/{totalBeds} Beds
                        </span>
                        <span className={bedRate >= 90 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {bedRate}%
                        </span>
                      </div>
                      <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            bedRate >= 90 ? 'bg-rose-500' : bedRate >= 75 ? 'bg-amber-500' : 'bg-brand-500'
                          }`}
                          style={{ width: `${Math.min(100, bedRate)}%` }}
                        />
                      </div>
                    </td>

                    {/* Doctor Attendance */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {doctorsOnDuty}/{doctorsSanctioned} on duty
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {doctorRate}% attendance
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="py-3.5 px-4">
                      {criticalCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-500" />
                          {criticalCount} Critical Stock
                        </span>
                      ) : lowCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          {lowCount} Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          Optimal
                        </span>
                      )}
                    </td>

                    {/* Diagnostics Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        center.diagnosticsStatus === 'Operational'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : center.diagnosticsStatus === 'Critical Deficit'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {center.diagnosticsStatus || "Operational"}
                      </span>
                    </td>

                    {/* Vulnerability Index Score */}
                    <td className="py-3.5 px-4">
                      {getVulnerabilityBadge(center.vulnerabilityScore || 30)}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCenter(center);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200"
                      >
                        <span>{t('viewDetails')}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Health Center Detail Modal / Drawer */}
      {selectedCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-brand-100 text-brand-800 border border-brand-200">
                    {selectedCenter.type}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedCenter.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {language === 'hi' ? selectedCenter.nameHi : selectedCenter.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedCenter.address || `Block: ${selectedCenter.block}, Ramanagar District`}
                </p>
              </div>
              <button
                onClick={() => setSelectedCenter(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Beds</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedCenter.beds?.occupied} / {selectedCenter.beds?.total}
                </p>
                <span className="text-[10px] text-slate-500">
                  {Math.round(((selectedCenter.beds?.occupied || 0) / (selectedCenter.beds?.total || 1)) * 100)}% Occupancy
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Doctors</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedCenter.doctors?.onDuty} / {selectedCenter.doctors?.sanctioned}
                </p>
                <span className="text-[10px] text-slate-500">
                  {selectedCenter.doctors?.absent || 0} Absent
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Today's Footfall</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedCenter.footfallToday || 84}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">+5% vs avg</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">CVI Score</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedCenter.vulnerabilityScore || 40}
                </p>
                <span className="text-[10px] text-slate-500">Vulnerability Index</span>
              </div>
            </div>

            {/* Bed Breakdown */}
            {selectedCenter.beds?.breakdown && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-brand-600" />
                  Bed Availability Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(selectedCenter.beds.breakdown).map(([bedType, counts]) => (
                    <div key={bedType} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60">
                      <span className="font-semibold text-slate-600 capitalize">{bedType}:</span>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {counts.occupied} / {counts.total} in use
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {selectedCenter.contact || "+91 80 2345 0000"}
              </span>
              <button
                onClick={() => setSelectedCenter(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors shadow-xs"
              >
                Close Facility Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
