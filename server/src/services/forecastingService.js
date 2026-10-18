/**
 * AAROGYA-AI BASELINE DEMAND FORECASTING ENGINE
 *
 * ASSUMPTIONS & LIMITATIONS (MUST READ):
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. DATA SOURCE: All inputs are SYNTHETIC demo data generated for hackathon
 *    simulation. Forecasts do NOT reflect real district healthcare demand.
 * 2. ALGORITHM: Simple weighted-moving-average (WMA) over the last 14 days of
 *    synthetic footfall and per-medicine burn-rate records.
 * 3. SEASONAL FACTOR: A hard-coded monsoon multiplier (1.18 for Oct–Nov) is
 *    applied to capture post-monsoon vector-borne disease spikes observed in
 *    historical Karnataka datasets. This multiplier is illustrative only.
 * 4. NO REAL DATA: When only synthetic data is available the forecasting output
 *    is clearly labelled synthetic. It does not reflect any Ministry of Health
 *    guideline or approved clinical projection.
 * 5. UNCERTAINTY: Confidence intervals are approximated as ±15 % for
 *    short-horizon (7-day) forecasts and ±25 % for medium-horizon (14-day).
 * 6. CLINICAL DISCLAIMER: Results are decision-support for supply managers
 *    only. No clinical decisions (dosing, treatment) should be made from these
 *    projections.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FORECAST_ASSUMPTIONS = {
  algorithm: 'Weighted Moving Average (WMA) with exponential recency weighting',
  historicalWindowDays: 14,
  shortHorizonDays: 7,
  mediumHorizonDays: 14,
  confidenceInterval: { short: 0.15, medium: 0.25 },
  seasonalFactors: {
    'Jan': 0.92, 'Feb': 0.90, 'Mar': 0.95, 'Apr': 1.02,
    'May': 1.05, 'Jun': 1.10, 'Jul': 1.20, 'Aug': 1.25,
    'Sep': 1.18, 'Oct': 1.18, 'Nov': 1.12, 'Dec': 0.98
  },
  seasonalNotes: 'Oct–Nov monsoon-recession vector spike (dengue, malaria) based on illustrative Karnataka regional pattern.',
  dataSyntheticDisclaimer: 'All historical records are synthetically generated. Forecast is for technology demonstration only.',
};

/**
 * Compute a weighted moving average.
 * More recent observations carry exponentially higher weight.
 *
 * @param {number[]} values – ordered oldest→newest
 * @returns {number} weighted average
 */
export function weightedMovingAverage(values) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const validValues = values.map(v => Math.max(0, Number(v) || 0));
  const n = validValues.length;
  let weightSum = 0;
  let valueSum = 0;
  validValues.forEach((v, i) => {
    // Weight rises linearly with recency (index 0 = oldest, n-1 = newest)
    const w = i + 1;
    valueSum += v * w;
    weightSum += w;
  });
  return weightSum > 0 ? valueSum / weightSum : 0;
}

/**
 * Determine the current seasonal multiplier based on a date.
 *
 * @param {Date} date
 * @returns {number}
 */
export function getSeasonalFactor(date = new Date()) {
  const monthName = date.toLocaleString('en-US', { month: 'short' });
  return FORECAST_ASSUMPTIONS.seasonalFactors[monthName] ?? 1.0;
}

/**
 * Forecast daily footfall for the next N days.
 *
 * @param {Array<{opd: number, emergency: number, maternal: number, total: number}>} history
 * @param {number} horizonDays – 7 or 14
 * @param {Date} [referenceDate]
 * @returns {Object} forecast result with projections and metadata
 */
export function forecastFootfall(history, horizonDays = 7, referenceDate = new Date()) {
  if (!Array.isArray(history) || history.length < 3) {
    return {
      success: false,
      error: 'Insufficient historical data (need ≥ 3 data points).',
      dataPoints: history?.length ?? 0
    };
  }

  const seasonalFactor = getSeasonalFactor(referenceDate);
  const ciWidth = horizonDays <= 7
    ? FORECAST_ASSUMPTIONS.confidenceInterval.short
    : FORECAST_ASSUMPTIONS.confidenceInterval.medium;

  // Extract arrays for each stream
  const opdValues    = history.map(d => d.opd       ?? d.total ?? 0);
  const emerValues   = history.map(d => d.emergency  ?? 0);
  const maternValues = history.map(d => d.maternal   ?? 0);

  const opdWMA    = weightedMovingAverage(opdValues);
  const emerWMA   = weightedMovingAverage(emerValues);
  const maternWMA = weightedMovingAverage(maternValues);

  const projDailyOpd      = Math.round(opdWMA * seasonalFactor);
  const projDailyEmer     = Math.round(emerWMA * seasonalFactor);
  const projDailyMaternal = Math.round(maternWMA * seasonalFactor);
  const projDailyTotal    = projDailyOpd + projDailyEmer + projDailyMaternal;

  const projTotalHorizon  = projDailyTotal * horizonDays;

  return {
    success: true,
    horizonDays,
    seasonalFactor,
    projectedDailyBreakdown: {
      opd: projDailyOpd,
      emergency: projDailyEmer,
      maternal: projDailyMaternal,
      total: projDailyTotal
    },
    projectedTotalForHorizon: projTotalHorizon,
    confidenceInterval: {
      lower: Math.round(projTotalHorizon * (1 - ciWidth)),
      upper: Math.round(projTotalHorizon * (1 + ciWidth)),
      widthPercent: Math.round(ciWidth * 100)
    },
    algorithm: FORECAST_ASSUMPTIONS.algorithm,
    dataPointsUsed: history.length,
    assumptions: FORECAST_ASSUMPTIONS,
    isSynthetic: true,
    syntheticDisclaimer: FORECAST_ASSUMPTIONS.dataSyntheticDisclaimer
  };
}

/**
 * Forecast demand (units needed) for a specific medicine over a horizon.
 *
 * @param {Object} medicine – enriched medicine object from inventoryStore
 * @param {number} horizonDays
 * @param {Date}  [referenceDate]
 * @returns {Object}
 */
export function forecastMedicineDemand(medicine, horizonDays = 7, referenceDate = new Date()) {
  const burn = Number(medicine.averageDailyConsumption) || 0;
  const usable = Number(medicine.usableStock) ?? 0;
  const threshold = Number(medicine.minThreshold) || 0;
  const seasonalFactor = getSeasonalFactor(referenceDate);

  if (burn <= 0) {
    return {
      success: false,
      medicineId: medicine.id,
      medicineName: medicine.name,
      error: 'Zero or missing daily consumption rate. Cannot project demand.',
      isSynthetic: true
    };
  }

  const ciWidth = horizonDays <= 7
    ? FORECAST_ASSUMPTIONS.confidenceInterval.short
    : FORECAST_ASSUMPTIONS.confidenceInterval.medium;

  const projDailyDemand   = Math.round(burn * seasonalFactor * 10) / 10;
  const projTotalDemand   = Math.round(projDailyDemand * horizonDays * 10) / 10;

  const projStockAfter    = Math.max(0, Math.round((usable - projTotalDemand) * 10) / 10);
  const projDaysRemaining = projDailyDemand > 0
    ? Math.round((usable / projDailyDemand) * 10) / 10
    : null;

  const shortfall = Math.max(0, projTotalDemand - usable);
  const stockOutDay = projDailyDemand > 0 && usable > 0
    ? Math.round((usable / projDailyDemand) * 10) / 10
    : null;

  // Calculate recommended replenishment (to last horizon + 20% buffer)
  const targetStock = projTotalDemand * 1.2;
  const replenishmentNeeded = Math.max(0, Math.round(targetStock - usable));

  let riskLevel = 'OPTIMAL';
  let riskReason = `Projected demand of ${projTotalDemand} ${medicine.unit} over ${horizonDays} days is within current usable stock (${usable}).`;

  if (projDaysRemaining !== null && projDaysRemaining < 3) {
    riskLevel = 'CRITICAL';
    riskReason = `Stock-out projected within ${projDaysRemaining} days at seasonal demand rate of ${projDailyDemand} ${medicine.unit}/day. Immediate replenishment of ${replenishmentNeeded} ${medicine.unit} required.`;
  } else if (projDaysRemaining !== null && projDaysRemaining < horizonDays) {
    riskLevel = 'HIGH';
    riskReason = `Stock will be exhausted in ${projDaysRemaining} days — before the end of the ${horizonDays}-day forecast horizon. Shortfall: ${shortfall} ${medicine.unit}. Pre-order ${replenishmentNeeded} ${medicine.unit}.`;
  } else if (usable <= threshold) {
    riskLevel = 'LOW';
    riskReason = `Current usable stock (${usable}) is at or below safety threshold (${threshold}). Seasonal demand may worsen shortage.`;
  }

  return {
    success: true,
    medicineId: medicine.id,
    medicineName: medicine.name,
    medicineName_hi: medicine.nameHi,
    centerId: medicine.centerId,
    centerName: medicine.centerName,
    horizonDays,
    seasonalFactor,
    currentUsableStock: usable,
    projectedDailyDemand: projDailyDemand,
    projectedTotalDemand: projTotalDemand,
    projectedStockAfterHorizon: projStockAfter,
    projectedDaysUntilStockout: stockOutDay,
    shortfallUnits: shortfall,
    replenishmentRecommended: replenishmentNeeded,
    confidenceInterval: {
      lower: Math.round(projTotalDemand * (1 - ciWidth)),
      upper: Math.round(projTotalDemand * (1 + ciWidth)),
      widthPercent: Math.round(ciWidth * 100)
    },
    riskLevel,
    riskReason,
    algorithm: FORECAST_ASSUMPTIONS.algorithm,
    assumptions: {
      burnRate: `${burn} ${medicine.unit}/day (trailing 7-day average)`,
      seasonalMultiplier: `${seasonalFactor}x (${new Date().toLocaleString('en-US', { month: 'long' })} regional factor)`,
      confidenceNote: `±${Math.round(ciWidth * 100)}% due to synthetic-only historical record`
    },
    isSynthetic: true,
    syntheticDisclaimer: FORECAST_ASSUMPTIONS.dataSyntheticDisclaimer
  };
}
