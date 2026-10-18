import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useHealthData } from '../context/HealthDataContext';
import DashboardSummaryCards from '../components/dashboard/DashboardSummaryCards';
import MedicineStockChart from '../components/dashboard/MedicineStockChart';
import PatientFootfallChart from '../components/dashboard/PatientFootfallChart';
import BedOccupancyChart from '../components/dashboard/BedOccupancyChart';
import CriticalAlertsPanel from '../components/dashboard/CriticalAlertsPanel';
import HealthCentreTable from '../components/dashboard/HealthCentreTable';
import ErrorBanner from '../components/common/ErrorBanner';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../components/common/LoadingSkeleton';

export default function DashboardView() {
  const { t } = useLanguage();
  const { loading, error, refreshData } = useHealthData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Offline/Error notice if server telemetry has issues */}
      {error && <ErrorBanner message={error} onRetry={refreshData} />}

      {/* 1. Summary Cards (KPIs) */}
      <DashboardSummaryCards />

      {/* 2. Critical Alert Panel & Medicine Burn Rate (High priority operational row) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CriticalAlertsPanel />
        <MedicineStockChart />
      </div>

      {/* 3. Patient Footfall Surge Trends & Bed Occupancy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientFootfallChart />
        <BedOccupancyChart />
      </div>

      {/* 4. Complete Health Facility Monitoring Table */}
      <HealthCentreTable />
    </div>
  );
}
