import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  IS_SYNTHETIC,
  SYNTHETIC_DATA_VERSION,
  LAST_UPDATED,
  healthCenters,
  medicineInventory,
  patientFootfallTrends,
  diagnosticAudits,
  criticalAlerts,
  districtSummary
} from './src/data/syntheticData.js';
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  getAuditTrail
} from './src/data/inventoryStore.js';
import { forecastFootfall, forecastMedicineDemand, FORECAST_ASSUMPTIONS } from './src/services/forecastingService.js';
import {
  generateRedistributionRecommendations,
  getRedistributionLog,
  approveTransfer,
  rejectTransfer,
  haversineDistanceKm
} from './src/services/redistributionEngine.js';
import { getGeminiForecastExplanation, getGeminiRedistributionExplanation } from './src/services/geminiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// 1. Health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AarogyaAI District Health & Supply Chain API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    isSyntheticData: IS_SYNTHETIC,
    syntheticDataVersion: SYNTHETIC_DATA_VERSION,
    dataLastUpdated: LAST_UPDATED
  });
});

// 2. District Summary & KPIs
app.get('/api/metrics/summary', (req, res) => {
  res.json({
    success: true,
    data: districtSummary,
    meta: {
      isSynthetic: IS_SYNTHETIC,
      disclaimer: "All metrics derived from synthetic demonstration model."
    }
  });
});

// 3. Health Centers List with optional filters
app.get('/api/centers', (req, res) => {
  const { type, block, search } = req.query;
  let filtered = [...healthCenters];

  if (type && type !== 'ALL') {
    filtered = filtered.filter(c => c.type.toUpperCase() === type.toUpperCase());
  }

  if (block && block !== 'ALL') {
    filtered = filtered.filter(c => c.block.toLowerCase() === block.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.nameHi.includes(q) ||
      c.block.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: filtered.length,
    data: filtered,
    meta: { isSynthetic: IS_SYNTHETIC }
  });
});

// 4. Single Health Center Detail
app.get('/api/centers/:id', (req, res) => {
  const center = healthCenters.find(c => c.id.toUpperCase() === req.params.id.toUpperCase());
  if (!center) {
    return res.status(404).json({ success: false, message: `Health Center with ID '${req.params.id}' not found.` });
  }

  // Include medicines located at this center
  const centerInventory = medicineInventory.map(med => {
    const breakdown = med.centerBreakdown.find(b => b.centerId === center.id);
    return {
      medicineId: med.id,
      name: med.name,
      nameHi: med.nameHi,
      category: med.category,
      unit: med.unit,
      stock: breakdown ? breakdown.stock : 0,
      burnRate: breakdown ? breakdown.burnRate : 0,
      daysRemaining: breakdown ? breakdown.daysRemaining : 0,
      status: breakdown ? breakdown.status : 'optimal'
    };
  });

  res.json({
    success: true,
    data: {
      ...center,
      inventory: centerInventory
    },
    meta: { isSynthetic: IS_SYNTHETIC }
  });
});

// 5. Medicine Inventory with search, filter, sorting & telemetry
app.get('/api/inventory', (req, res) => {
  try {
    const { search, category, status, centerId, sortBy, sortOrder } = req.query;
    const items = getMedicines({ search, category, status, centerId, sortBy, sortOrder });
    res.json({
      success: true,
      total: items.length,
      data: items,
      meta: {
        isSynthetic: IS_SYNTHETIC,
        calculationRule: "estimatedDaysRemaining = usableStock / averageDailyConsumption",
        disclaimer: "Expired stock is strictly excluded from usable inventory. Telemetry is decision-support only."
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Internal server error fetching inventory.' });
  }
});

// Single Medicine Details with Batches & Audit Trail
app.get('/api/inventory/:id', (req, res) => {
  try {
    const item = getMedicineById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: `Medicine '${req.params.id}' not found.` });
    }
    res.json({
      success: true,
      data: item,
      meta: { isSynthetic: IS_SYNTHETIC }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create New Medicine Formulation
app.post('/api/inventory', (req, res) => {
  try {
    const performedBy = req.body.performedBy || 'District Store Officer';
    const created = createMedicine(req.body, performedBy);
    res.status(201).json({
      success: true,
      message: `Medicine formulation '${created.name}' created and added to facility inventory.`,
      data: created,
      meta: { isSynthetic: IS_SYNTHETIC }
    });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    res.status(500).json({ success: false, message: err.message || 'Error creating medicine.' });
  }
});

// Update Existing Medicine (Stock adjustment, threshold, burn rate, batch)
app.put('/api/inventory/:id', (req, res) => {
  try {
    const performedBy = req.body.performedBy || 'District Store Officer';
    const updated = updateMedicine(req.params.id, req.body, performedBy);
    res.json({
      success: true,
      message: `Medicine '${updated.name}' updated successfully and logged in audit trail.`,
      data: updated,
      meta: { isSynthetic: IS_SYNTHETIC }
    });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ success: false, message: err.message, errors: err.errors });
    }
    if (err.status === 404) {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message || 'Error updating medicine.' });
  }
});

// Inventory Audit Trail Log
app.get('/api/inventory-audit-trail', (req, res) => {
  try {
    const { medicineId } = req.query;
    const trail = getAuditTrail(medicineId);
    res.json({
      success: true,
      total: trail.length,
      data: trail,
      meta: { isSynthetic: IS_SYNTHETIC }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Critical & Warning Alerts
app.get('/api/alerts', (req, res) => {
  const { severity } = req.query;
  let list = [...criticalAlerts];

  if (severity && severity !== 'ALL') {
    list = list.filter(a => a.severity.toLowerCase() === severity.toLowerCase());
  }

  res.json({
    success: true,
    total: list.length,
    data: list,
    meta: { isSynthetic: IS_SYNTHETIC }
  });
});

// 7. Patient Footfall 14-day trends
app.get('/api/footfall/trends', (req, res) => {
  res.json({
    success: true,
    data: patientFootfallTrends,
    meta: { isSynthetic: IS_SYNTHETIC }
  });
});

// 8. Diagnostic Test Audits
app.get('/api/diagnostics/audits', (req, res) => {
  res.json({
    success: true,
    data: diagnosticAudits,
    meta: { isSynthetic: IS_SYNTHETIC }
  });
});

// ── PHASE 3 ROUTES ────────────────────────────────────────────────────────────

// Rate limit state (simple token bucket per endpoint, no external package needed)
const geminiCallCounts = {};
const GEMINI_RATE_LIMIT_PER_HOUR = 30;
function checkGeminiRateLimit(endpoint) {
  const now = Date.now();
  if (!geminiCallCounts[endpoint]) geminiCallCounts[endpoint] = [];
  // Prune entries older than 1 hour
  geminiCallCounts[endpoint] = geminiCallCounts[endpoint].filter(t => now - t < 3600_000);
  if (geminiCallCounts[endpoint].length >= GEMINI_RATE_LIMIT_PER_HOUR) {
    return false; // Rate limit exceeded
  }
  geminiCallCounts[endpoint].push(now);
  return true;
}

// 9. Footfall Forecast (baseline deterministic + optional Gemini explanation)
app.get('/api/forecast/footfall', async (req, res) => {
  try {
    const horizonDays = Math.min(14, Math.max(1, parseInt(req.query.days ?? '7', 10)));
    const baseResult = forecastFootfall(patientFootfallTrends, horizonDays);

    let aiExplanation = null;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      if (checkGeminiRateLimit('footfall')) {
        const geminiResult = await getGeminiForecastExplanation(
          { ...baseResult, medicineName: null, centerName: 'Ramanagar District (all 8 facilities)' },
          apiKey
        );
        aiExplanation = geminiResult;
      } else {
        aiExplanation = { explanation: 'AI narrative unavailable: rate limit reached.', source: 'rate_limited' };
      }
    }

    res.json({
      success: true,
      data: { ...baseResult, aiExplanation },
      meta: {
        isSynthetic: IS_SYNTHETIC,
        disclaimer: 'Forecast is based entirely on synthetic demo data. Not for clinical or policy use.'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 10. Per-medicine Demand Forecast
app.get('/api/forecast/medicine/:medicineId', async (req, res) => {
  try {
    const med = getMedicineById(req.params.medicineId);
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found.' });

    const horizonDays = Math.min(14, Math.max(1, parseInt(req.query.days ?? '7', 10)));
    const forecastResult = forecastMedicineDemand(med, horizonDays);

    let aiExplanation = null;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      if (checkGeminiRateLimit('medicine_forecast')) {
        const geminiResult = await getGeminiForecastExplanation({ ...forecastResult, unit: med.unit }, apiKey);
        aiExplanation = geminiResult;
      } else {
        aiExplanation = { explanation: 'AI narrative unavailable: rate limit reached.', source: 'rate_limited' };
      }
    }

    res.json({
      success: true,
      data: { ...forecastResult, aiExplanation },
      meta: {
        isSynthetic: IS_SYNTHETIC,
        calculationMethod: FORECAST_ASSUMPTIONS.algorithm,
        disclaimer: 'Synthetic data only. No real inventory or patient records used.'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 11. District-wide Batch Forecast for all medicines (top critical items)
app.get('/api/forecast/medicines', async (req, res) => {
  try {
    const horizonDays = Math.min(14, Math.max(1, parseInt(req.query.days ?? '7', 10)));
    const all = getMedicines({ sortBy: 'urgency' });
    const results = all.map(med => forecastMedicineDemand(med, horizonDays));
    res.json({
      success: true,
      total: results.length,
      data: results,
      meta: {
        isSynthetic: IS_SYNTHETIC,
        horizonDays,
        calculationMethod: FORECAST_ASSUMPTIONS.algorithm,
        seasonalFactorApplied: true,
        disclaimer: 'Synthetic demo data — not real clinical inventory.'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 12. Generate redistribution recommendations
app.get('/api/redistribution/recommendations', async (req, res) => {
  try {
    const all = getMedicines();
    const recommendations = generateRedistributionRecommendations(all, healthCenters);

    let aiExplanation = null;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      if (checkGeminiRateLimit('redistribution')) {
        const geminiResult = await getGeminiRedistributionExplanation(recommendations, apiKey);
        aiExplanation = geminiResult;
      } else {
        aiExplanation = { explanation: 'AI narrative unavailable: rate limit reached.', source: 'rate_limited' };
      }
    }

    res.json({
      success: true,
      total: recommendations.length,
      data: recommendations,
      aiExplanation,
      meta: {
        isSynthetic: IS_SYNTHETIC,
        disclaimer: 'Recommendations require administrator approval. No automatic transfer executed.',
        guardrails: [
          'Expired stock excluded from all recommendations',
          'Donor safety threshold protected at all times',
          'Transfer quantities capped at recipient 14-day need',
          'Administrator approval required before any physical action'
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13. Redistribution log (approved + pending + rejected)
app.get('/api/redistribution/log', (req, res) => {
  try {
    const { status } = req.query;
    const log = getRedistributionLog(status ?? 'ALL');
    res.json({ success: true, total: log.length, data: log, meta: { isSynthetic: IS_SYNTHETIC } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 14. Approve a redistribution recommendation
app.post('/api/redistribution/approve', (req, res) => {
  try {
    const { recommendationId, approvedBy, recommendation } = req.body;
    if (!recommendationId || !approvedBy || !recommendation) {
      return res.status(400).json({ success: false, message: 'recommendationId, approvedBy, and recommendation are required.' });
    }
    const entry = approveTransfer(recommendationId, approvedBy, recommendation);
    res.status(201).json({
      success: true,
      message: `Transfer ${recommendationId} approved by ${approvedBy} and recorded in audit log.`,
      data: entry,
      meta: { isSynthetic: IS_SYNTHETIC, reminder: 'No physical inventory change has occurred. Manual redistribution action required.' }
    });
  } catch (err) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

// 15. Reject a redistribution recommendation
app.post('/api/redistribution/reject', (req, res) => {
  try {
    const { recommendationId, rejectedBy, reason, recommendation } = req.body;
    if (!recommendationId || !recommendation) {
      return res.status(400).json({ success: false, message: 'recommendationId and recommendation are required.' });
    }
    const entry = rejectTransfer(recommendationId, rejectedBy, reason, recommendation);
    res.status(201).json({ success: true, message: `Transfer ${recommendationId} rejected and logged.`, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` AarogyaAI Backend Server Started on Port ${PORT}`);
  console.log(` Health-Check: http://localhost:${PORT}/api/health`);
  console.log(` Demo Data Mode: SYNTHETIC DATA LABELED`);
  console.log(` Gemini API: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? 'CONNECTED' : 'Fallback mode (key not set)'}`);
  console.log(`=======================================================`);
});

