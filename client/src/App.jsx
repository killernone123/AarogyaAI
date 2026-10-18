import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { HealthDataProvider, useHealthData } from './context/HealthDataContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DemoBadge from './components/common/DemoBadge';
import DashboardView from './pages/DashboardView';
import HealthCentreTable from './components/dashboard/HealthCentreTable';
import MedicineStockChart from './components/dashboard/MedicineStockChart';
import PatientFootfallChart from './components/dashboard/PatientFootfallChart';
import BedOccupancyChart from './components/dashboard/BedOccupancyChart';
import CriticalAlertsPanel from './components/dashboard/CriticalAlertsPanel';
import InventoryManagementView from './components/inventory/InventoryManagementView';
import { ArrowRightLeft, Sparkles, ShieldCheck } from 'lucide-react';

function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { language, t } = useLanguage();
  const { summary } = useHealthData();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* 1. Visibly labeled Synthetic Demo Data Banner */}
      <DemoBadge />

      {/* 2. Top Header with Telemetry & Language Toggle */}
      <Header />

      {/* 3. Main Dashboard Body (Sidebar + Content) */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Welcome / Context Banner */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse"></span>
                <span className="text-xs font-bold text-brand-700 tracking-wider uppercase">
                  {t('appName')} • Active Operations Room
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {t('districtHeaderTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t('districtHeaderSubtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  District Health Score
                </span>
                <span className="text-base font-bold text-emerald-600">
                  84.2 / 100 <span className="text-xs font-medium text-slate-400">Normal</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tab Content Router */}
          {activeTab === 'dashboard' && <DashboardView />}
          
          {activeTab === 'centers' && (
            <div className="space-y-6">
              <HealthCentreTable />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <InventoryManagementView />
            </div>
          )}

          {activeTab === 'footfall' && (
            <div className="space-y-6">
              <PatientFootfallChart />
            </div>
          )}

          {activeTab === 'beds' && (
            <div className="space-y-6">
              <BedOccupancyChart />
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <CriticalAlertsPanel />
            </div>
          )}

          {activeTab === 'redistribution' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs text-center max-w-2xl mx-auto my-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-tealbrand-600 mx-auto flex items-center justify-center border border-teal-200">
                <ArrowRightLeft className="w-7 h-7" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Phase 2 Feature: Gemini Supply Chain AI</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Automated Resource Redistribution Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                This engine mathematically matches facilities with inventory surpluses (e.g. DH Ramanagar)
                to rural PHCs facing critical stock-outs (e.g. PHC Bilikere), factoring in road distances and delivery feasibility.
              </p>
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-xs"
                >
                  Return to District Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <HealthDataProvider>
        <MainLayout />
      </HealthDataProvider>
    </LanguageProvider>
  );
}
