import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fallbackSummary,
  fallbackCenters,
  fallbackMedicineInventory,
  fallbackFootfallTrends,
  fallbackAlerts
} from '../data/fallbackData';

const HealthDataContext = createContext();

export function HealthDataProvider({ children }) {
  const [summary, setSummary] = useState(fallbackSummary);
  const [centers, setCenters] = useState(fallbackCenters);
  const [inventory, setInventory] = useState(fallbackMedicineInventory);
  const [alerts, setAlerts] = useState(fallbackAlerts);
  const [footfall, setFootfall] = useState(fallbackFootfallTrends);
  const [auditTrail, setAuditTrail] = useState([]);
  
  // Phase 3 — Forecasting & Redistribution state
  const [forecasts, setForecasts] = useState(null);
  const [footfallForecast, setFootfallForecast] = useState(null);
  const [redistribRecommendations, setRedistribRecommendations] = useState([]);
  const [redistribLog, setRedistribLog] = useState([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [redistribLoading, setRedistribLoading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAuditTrail = useCallback(async (medicineId = null) => {
    try {
      const url = medicineId 
        ? `/api/inventory-audit-trail?medicineId=${encodeURIComponent(medicineId)}`
        : '/api/inventory-audit-trail';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAuditTrail(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Could not fetch audit trail:", err);
    }
    return [];
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Parallel requests to backend
      const [sumRes, cenRes, invRes, altRes, footRes, auditRes] = await Promise.allSettled([
        fetch('/api/metrics/summary'),
        fetch('/api/centers'),
        fetch('/api/inventory'),
        fetch('/api/alerts'),
        fetch('/api/footfall/trends'),
        fetch('/api/inventory-audit-trail')
      ]);

      let backendOk = false;

      if (sumRes.status === 'fulfilled' && sumRes.value.ok) {
        const sumJson = await sumRes.value.json();
        if (sumJson.success && sumJson.data) {
          setSummary(sumJson.data);
          backendOk = true;
        }
      }

      if (cenRes.status === 'fulfilled' && cenRes.value.ok) {
        const cenJson = await cenRes.value.json();
        if (cenJson.success && cenJson.data) {
          setCenters(cenJson.data);
          backendOk = true;
        }
      }

      if (invRes.status === 'fulfilled' && invRes.value.ok) {
        const invJson = await invRes.value.json();
        if (invJson.success && invJson.data) {
          setInventory(invJson.data);
          backendOk = true;
        }
      }

      if (altRes.status === 'fulfilled' && altRes.value.ok) {
        const altJson = await altRes.value.json();
        if (altJson.success && altJson.data) {
          setAlerts(altJson.data);
          backendOk = true;
        }
      }

      if (footRes.status === 'fulfilled' && footRes.value.ok) {
        const footJson = await footRes.value.json();
        if (footJson.success && footJson.data) {
          setFootfall(footJson.data);
          backendOk = true;
        }
      }

      if (auditRes.status === 'fulfilled' && auditRes.value.ok) {
        const auditJson = await auditRes.value.json();
        if (auditJson.success && auditJson.data) {
          setAuditTrail(auditJson.data);
        }
      }

      setBackendConnected(backendOk);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn("Backend telemetry offline, running in local synthetic cache mode:", err);
      setError("Backend connection is using local fallback cache.");
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Acknowledge alert helper
  const acknowledgeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Add Medicine API helper
  const addMedicine = async (formData) => {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.errors ? json.errors.join('; ') : json.message || 'Failed to add medicine');
    }

    // Refresh telemetry
    await fetchData();
    return json.data;
  };

  // Update Medicine API helper
  const updateMedicine = async (id, updateData) => {
    const res = await fetch(`/api/inventory/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.errors ? json.errors.join('; ') : json.message || 'Failed to update medicine');
    }

    // Refresh telemetry
    await fetchData();
    return json.data;
  };

  // ── Phase 3: Forecasting ────────────────────────────────────────────────────

  const fetchMedicineForecasts = useCallback(async (days = 7) => {
    setForecastLoading(true);
    try {
      const res = await fetch(`/api/forecast/medicines?days=${days}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setForecasts(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Could not fetch medicine forecasts:', err);
    } finally {
      setForecastLoading(false);
    }
    return null;
  }, []);

  const fetchFootfallForecast = useCallback(async (days = 7) => {
    setForecastLoading(true);
    try {
      const res = await fetch(`/api/forecast/footfall?days=${days}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setFootfallForecast(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Could not fetch footfall forecast:', err);
    } finally {
      setForecastLoading(false);
    }
    return null;
  }, []);

  // ── Phase 3: Redistribution ─────────────────────────────────────────────────

  const fetchRedistributionRecommendations = useCallback(async () => {
    setRedistribLoading(true);
    try {
      const res = await fetch('/api/redistribution/recommendations');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setRedistribRecommendations(json.data.recommendations || []);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Could not fetch redistribution recommendations:', err);
    } finally {
      setRedistribLoading(false);
    }
    return null;
  }, []);

  const fetchRedistribLog = useCallback(async (statusFilter = 'ALL') => {
    try {
      const res = await fetch(`/api/redistribution/log?status=${statusFilter}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setRedistribLog(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Could not fetch redistribution log:', err);
    }
    return [];
  }, []);

  const approveTransferAction = async (recommendationId, approvedBy, recommendation) => {
    const res = await fetch('/api/redistribution/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommendationId, approvedBy, recommendation })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Approval failed');
    }
    // Remove approved item from pending list, refresh log
    setRedistribRecommendations(prev =>
      prev.filter(r => r.recommendationId !== recommendationId)
    );
    await fetchRedistribLog();
    return json.data;
  };

  const rejectTransferAction = async (recommendationId, rejectedBy, reason, recommendation) => {
    const res = await fetch('/api/redistribution/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommendationId, rejectedBy, reason, recommendation })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Rejection failed');
    }
    setRedistribRecommendations(prev =>
      prev.filter(r => r.recommendationId !== recommendationId)
    );
    await fetchRedistribLog();
    return json.data;
  };

  return (
    <HealthDataContext.Provider
      value={{
        summary,
        centers,
        inventory,
        alerts,
        footfall,
        auditTrail,
        loading,
        error,
        backendConnected,
        lastUpdated,
        refreshData: fetchData,
        acknowledgeAlert,
        addMedicine,
        updateMedicine,
        fetchAuditTrail,
        // Phase 3 — Forecasting
        forecasts,
        footfallForecast,
        forecastLoading,
        fetchMedicineForecasts,
        fetchFootfallForecast,
        // Phase 3 — Redistribution
        redistribRecommendations,
        redistribLog,
        redistribLoading,
        fetchRedistributionRecommendations,
        fetchRedistribLog,
        approveTransferAction,
        rejectTransferAction
      }}
    >
      {children}
    </HealthDataContext.Provider>
  );
}

export function useHealthData() {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
}
