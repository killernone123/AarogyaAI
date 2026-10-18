import React, { useState } from 'react';
import {
  Pill,
  Search,
  Filter,
  Plus,
  History,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  Calendar,
  Layers,
  Building2,
  TrendingDown,
  ArrowUpDown,
  Edit3,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useHealthData } from '../../context/HealthDataContext';
import MedicineFormModal from './MedicineFormModal';
import AuditTrailModal from './AuditTrailModal';
import EmptyState from '../common/EmptyState';

export default function InventoryManagementView() {
  const { language, t } = useLanguage();
  const { inventory, centers } = useHealthData();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCenter, setSelectedCenter] = useState('ALL');
  const [sortBy, setSortBy] = useState('urgency');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditMedicine, setAuditMedicine] = useState(null);

  // Derived filtered & sorted inventory list
  const filteredInventory = inventory.filter((item) => {
    // Search
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = item.name?.toLowerCase().includes(q) || (item.nameHi && item.nameHi.includes(q));
    const catMatch = item.category?.toLowerCase().includes(q);
    const centerMatch = item.centerId?.toLowerCase().includes(q) || item.centerName?.toLowerCase().includes(q);
    if (q && !(nameMatch || catMatch || centerMatch)) return false;

    // Category
    if (selectedCategory !== 'ALL' && item.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    // Status / Risk
    if (selectedStatus !== 'ALL') {
      if (selectedStatus === 'EXPIRED') {
        if (!item.expiredStock || item.expiredStock === 0) return false;
      } else {
        if (item.riskLevel?.toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }
    }

    // Center
    if (selectedCenter !== 'ALL' && item.centerId?.toUpperCase() !== selectedCenter.toUpperCase()) {
      return false;
    }

    return true;
  });

  // Client-side sorting
  filteredInventory.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'urgency') {
      const rank = { critical: 1, low: 2, optimal: 3, surplus: 4, no_consumption: 5 };
      const rankA = rank[a.riskLevel] || 99;
      const rankB = rank[b.riskLevel] || 99;
      if (rankA !== rankB) {
        comparison = rankA - rankB;
      } else {
        const daysA = a.daysRemaining !== null && a.daysRemaining !== undefined ? a.daysRemaining : 9999;
        const daysB = b.daysRemaining !== null && b.daysRemaining !== undefined ? b.daysRemaining : 9999;
        comparison = daysA - daysB;
      }
    } else if (sortBy === 'daysRemaining') {
      const daysA = a.daysRemaining !== null && a.daysRemaining !== undefined ? a.daysRemaining : 9999;
      const daysB = b.daysRemaining !== null && b.daysRemaining !== undefined ? b.daysRemaining : 9999;
      comparison = daysA - daysB;
    } else if (sortBy === 'usableStock') {
      const stockA = a.usableStock !== undefined ? a.usableStock : (a.stock || 0);
      const stockB = b.usableStock !== undefined ? b.usableStock : (b.stock || 0);
      comparison = stockA - stockB;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'burnRate') {
      const burnA = a.averageDailyConsumption !== undefined ? a.averageDailyConsumption : (a.burnRate || 0);
      const burnB = b.averageDailyConsumption !== undefined ? b.averageDailyConsumption : (b.burnRate || 0);
      comparison = burnA - burnB;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Summary Metrics for top cards
  const totalFormulations = inventory.length;
  const criticalItems = inventory.filter(i => i.riskLevel === 'critical' || (i.daysRemaining !== null && i.daysRemaining < 3)).length;
  const lowItems = inventory.filter(i => i.riskLevel === 'low' || (i.daysRemaining !== null && i.daysRemaining >= 3 && i.daysRemaining <= 7)).length;
  const expiredStockTotal = inventory.reduce((sum, i) => sum + (i.expiredStock || 0), 0);
  const totalUsableStockUnits = inventory.reduce((sum, i) => sum + (i.usableStock !== undefined ? i.usableStock : (i.stock || 0)), 0);

  const getRiskBadge = (item) => {
    const risk = item.riskLevel || (item.daysRemaining < 3 ? 'critical' : item.daysRemaining <= 7 ? 'low' : 'optimal');
    switch (risk) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertOctagon className="w-3 h-3 text-rose-600" />
            Critical Stock-Out
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Low Stock (Re-order)
          </span>
        );
      case 'surplus':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <CheckCircle className="w-3 h-3 text-sky-600" />
            Surplus Stock
          </span>
        );
      case 'no_consumption':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            Zero Consumption
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Optimal Supply
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Transparent Calculation Principle Banner */}
      <div className="bg-gradient-to-r from-blue-50/80 via-white to-teal-50/80 p-4 rounded-2xl border border-brand-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-brand-600 text-white rounded-xl shadow-xs flex-shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Medicine Inventory & Stock-Risk Telemetry
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 border border-brand-200">
                PHASE 2 MODULE
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Transparent stock-out risk engine. Calculated as: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-brand-700 border border-slate-200">estimated days = usable stock ÷ average daily consumption</code>.
              Expired batches are strictly excluded from usable inventory.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {
              setAuditMedicine(null);
              setIsAuditOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-200 shadow-2xs flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Audit Trail</span>
          </button>
          <button
            onClick={() => {
              setEditingMedicine(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Formulation</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Monitored Items</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalFormulations} Formulations</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Across 8 health facilities</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Usable Stock Total</span>
          <div className="text-2xl font-bold text-brand-600 mt-1">{totalUsableStockUnits.toLocaleString()} Units</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Available for active dispensing</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Critical Depletion</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{criticalItems} Critical</div>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">&lt; 3 days of supply remaining</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Re-order Warning</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{lowItems} Low Items</div>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">3 to 7 days reserve remaining</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Expired / Quarantined</span>
          <div className="text-2xl font-bold text-slate-700 mt-1">{expiredStockTotal} Units</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Excluded from dispensing</span>
        </div>
      </div>

      {/* 3. Search, Filter & Sort Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by drug name or facility..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Therapeutic Categories</option>
              <option value="Critical / Antidote">Critical / Antidote</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Analgesic / Antipyretic">Analgesic / Antipyretic</option>
              <option value="Maternal & Child Health">Maternal & Child Health</option>
              <option value="Chronic Diseases">Chronic Diseases</option>
              <option value="Respiratory">Respiratory</option>
            </select>
          </div>

          {/* Risk / Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Risk Statuses</option>
              <option value="CRITICAL">Critical Stock-Out (&lt; 3d)</option>
              <option value="LOW">Low Stock (3 - 7d)</option>
              <option value="OPTIMAL">Optimal (7 - 30d)</option>
              <option value="SURPLUS">Surplus (&gt; 30d)</option>
              <option value="EXPIRED">Has Expired Batches</option>
            </select>
          </div>

          {/* Facility / Center Filter */}
          <div>
            <select
              value={selectedCenter}
              onChange={e => setSelectedCenter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Health Facilities</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 font-medium"
            >
              <option value="urgency">Sort by: Urgency / Days Left</option>
              <option value="daysRemaining">Sort by: Days Remaining</option>
              <option value="usableStock">Sort by: Usable Stock</option>
              <option value="burnRate">Sort by: Daily Consumption</option>
              <option value="name">Sort by: Formulation Name</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={`Toggle sort order (Current: ${sortOrder.toUpperCase()})`}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 border border-slate-200 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Complete Inventory & Stock Risk Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredInventory.length === 0 ? (
          <EmptyState
            message="No medicine formulations match the selected search, category or risk filters."
            onReset={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
              setSelectedCenter('ALL');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Formulation Name</th>
                  <th className="py-3 px-4">Facility</th>
                  <th className="py-3 px-4">Usable Stock / Units</th>
                  <th className="py-3 px-4">Daily Burn Rate</th>
                  <th className="py-3 px-4">Estimated Days Left</th>
                  <th className="py-3 px-4">Risk Level & Assessment Reason</th>
                  <th className="py-3 px-4">Batch & Expiry</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const usable = item.usableStock !== undefined ? item.usableStock : (item.stock || 0);
                  const expired = item.expiredStock || 0;
                  const burn = item.averageDailyConsumption !== undefined ? item.averageDailyConsumption : (item.burnRate || 0);
                  const days = item.daysRemaining !== null && item.daysRemaining !== undefined ? item.daysRemaining : null;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {language === 'hi' && item.nameHi ? item.nameHi : item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.id}
                          </span>
                          <span className="text-[10px] text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded border border-brand-200">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      {/* Facility */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {item.centerId || "District Wide"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]" title={item.centerName}>
                          {item.centerName || "Central Depot"}
                        </div>
                      </td>

                      {/* Usable Stock with Expired distinction */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-slate-900">
                            {usable.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {item.unit}
                          </span>
                        </div>
                        {expired > 0 ? (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-flex">
                            <ShieldAlert className="w-3 h-3 text-rose-500" />
                            <span>{expired} {item.unit} expired (quarantined)</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Min Safety Threshold: {item.minThreshold || 10}
                          </div>
                        )}
                      </td>

                      {/* Daily Burn Rate */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {burn} {item.unit} / day
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Trailing 7-day average
                        </div>
                      </td>

                      {/* Estimated Days Remaining */}
                      <td className="py-3.5 px-4">
                        {days !== null ? (
                          <div className="flex items-baseline gap-1">
                            <span className={`text-base font-bold ${
                              days < 3 ? 'text-rose-600' : days <= 7 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                              {days}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">days</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">No active burn</span>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5" title="Formula: Usable Stock ÷ Daily Burn Rate">
                          ({usable} ÷ {burn})
                        </div>
                      </td>

                      {/* Risk Level & Clear Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="mb-1">
                          {getRiskBadge(item)}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          {item.riskReason || (days < 3 ? 'Critical run-out expected within 72 hours.' : 'Sufficient safety buffer maintained.')}
                        </p>
                      </td>

                      {/* Batch & Expiry */}
                      <td className="py-3.5 px-4">
                        {item.batches && item.batches.length > 0 ? (
                          <div className="space-y-1">
                            {item.batches.map((b, idx) => (
                              <div key={idx} className="text-[11px]">
                                <span className="font-mono text-slate-700">{b.batchNumber}: </span>
                                <span className={b.isExpired ? 'text-rose-600 font-bold line-through' : 'text-slate-600'}>
                                  {b.expiryDate}
                                </span>
                                {b.isExpired && (
                                  <span className="ml-1 text-[9px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-bold">
                                    EXPIRED
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">BAT-STANDARD</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingMedicine(item);
                              setIsFormOpen(true);
                            }}
                            title="Update stock allocation and burn rate"
                            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setAuditMedicine(item);
                              setIsAuditOpen(true);
                            }}
                            title="View audit trail for this drug"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modals for Create/Update and Audit Trail */}
      <MedicineFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMedicine(null);
        }}
        medicine={editingMedicine}
      />

      <AuditTrailModal
        isOpen={isAuditOpen}
        onClose={() => {
          setIsAuditOpen(false);
          setAuditMedicine(null);
        }}
        selectedMedicine={auditMedicine}
      />
    </div>
  );
}
