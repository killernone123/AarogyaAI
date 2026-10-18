import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  weightedMovingAverage,
  getSeasonalFactor,
  forecastFootfall,
  forecastMedicineDemand,
  FORECAST_ASSUMPTIONS
} from '../src/services/forecastingService.js';
import { haversineDistanceKm, generateRedistributionRecommendations } from '../src/services/redistributionEngine.js';

// ── Synthetic test fixtures ───────────────────────────────────────────────────
const HISTORY_14 = [
  { opd: 1120, emergency: 142, maternal: 88, total: 1350 },
  { opd: 1180, emergency: 135, maternal: 92, total: 1407 },
  { opd: 1090, emergency: 128, maternal: 85, total: 1303 },
  { opd: 1210, emergency: 154, maternal: 96, total: 1460 },
  { opd: 1290, emergency: 168, maternal: 104, total: 1562 },
  { opd: 1340, emergency: 180, maternal: 110, total: 1630 },
  { opd: 780,  emergency: 140, maternal: 60,  total: 980  },
  { opd: 1240, emergency: 150, maternal: 94,  total: 1484 },
  { opd: 1270, emergency: 162, maternal: 98,  total: 1530 },
  { opd: 1215, emergency: 144, maternal: 91,  total: 1450 },
  { opd: 1310, emergency: 172, maternal: 108, total: 1590 },
  { opd: 1380, emergency: 188, maternal: 114, total: 1682 },
  { opd: 1420, emergency: 195, maternal: 122, total: 1737 },
  { opd: 890,  emergency: 160, maternal: 74,  total: 1124 }
];

const CRITICAL_MED = {
  id: 'MED-001',
  name: 'Anti-Snake Venom (ASV)',
  nameHi: 'एंटी-स्नेक वेनम',
  category: 'Critical / Antidote',
  unit: 'Vials',
  centerId: 'PHC-01',
  centerName: 'PHC Bilikere Rural',
  minThreshold: 5,
  averageDailyConsumption: 0.9,
  usableStock: 1,
  expiredStock: 2,
  riskLevel: 'critical',
  daysRemaining: 1.1,
  batches: []
};

const SURPLUS_MED = {
  id: 'MED-002',
  name: 'Anti-Snake Venom (ASV)',
  nameHi: 'एंटी-स्नेक वेनम',
  category: 'Critical / Antidote',
  unit: 'Vials',
  centerId: 'DH-01',
  centerName: 'Ramanagar District Hospital',
  minThreshold: 20,
  averageDailyConsumption: 2.8,
  usableStock: 32,
  expiredStock: 0,
  riskLevel: 'optimal',
  daysRemaining: 11.4,
  batches: []
};

const CENTERS = [
  { id: 'PHC-01', coordinates: { lat: 12.5891, lng: 77.1214 } },
  { id: 'DH-01',  coordinates: { lat: 12.7209, lng: 77.2799 } }
];

describe('Phase 3 — Forecasting & Redistribution Tests', () => {

  describe('1. Weighted Moving Average', () => {
    it('gives more weight to recent values', () => {
      const wma = weightedMovingAverage([100, 200, 300]); // Weight: 1,2,3
      // Expected: (100×1 + 200×2 + 300×3) / (1+2+3) = 1400/6 ≈ 233.33
      assert.ok(wma > 230 && wma < 234, `Expected ~233, got ${wma}`);
    });

    it('handles a single-value array', () => {
      assert.equal(weightedMovingAverage([500]), 500);
    });

    it('returns 0 for empty or invalid arrays', () => {
      assert.equal(weightedMovingAverage([]), 0);
      assert.equal(weightedMovingAverage(null), 0);
    });

    it('coerces negative values to 0', () => {
      // Negative patient counts are physically impossible
      const result = weightedMovingAverage([100, -50, 200]);
      assert.ok(result >= 0, 'WMA must be non-negative');
    });
  });

  describe('2. Seasonal Factor', () => {
    it('returns the correct October multiplier (monsoon spike)', () => {
      const factor = getSeasonalFactor(new Date('2026-10-15'));
      assert.equal(factor, FORECAST_ASSUMPTIONS.seasonalFactors['Oct']);
      assert.ok(factor > 1, 'October should have >1.0 seasonal demand multiplier');
    });

    it('returns 1.0 for unrecognised month gracefully', () => {
      // Simulate edge case: invalid date produces unknown month
      const factor = getSeasonalFactor({ toLocaleString: () => 'Xyz' });
      assert.equal(factor, 1.0);
    });
  });

  describe('3. forecastFootfall', () => {
    it('produces a successful 7-day footfall forecast from 14-day history', () => {
      const result = forecastFootfall(HISTORY_14, 7);
      assert.equal(result.success, true);
      assert.ok(result.projectedDailyBreakdown.total > 0);
      assert.ok(result.confidenceInterval.lower < result.projectedTotalForHorizon);
      assert.ok(result.confidenceInterval.upper > result.projectedTotalForHorizon);
      assert.equal(result.isSynthetic, true);
    });

    it('produces a 14-day forecast with wider confidence interval', () => {
      const r7  = forecastFootfall(HISTORY_14, 7);
      const r14 = forecastFootfall(HISTORY_14, 14);
      // 14-day forecast has wider ± band (±25% vs ±15%)
      const width7  = r7.confidenceInterval.upper  - r7.confidenceInterval.lower;
      const width14 = r14.confidenceInterval.upper - r14.confidenceInterval.lower;
      // For same daily rate, 14-day total is 2× — so absolute width is proportionally larger
      assert.ok(width14 > width7, '14-day CI band must be wider than 7-day');
    });

    it('fails gracefully with insufficient history (< 3 data points)', () => {
      const result = forecastFootfall([HISTORY_14[0], HISTORY_14[1]], 7);
      assert.equal(result.success, false);
      assert.match(result.error, /Insufficient historical data/);
    });

    it('always labels forecast output as synthetic', () => {
      const result = forecastFootfall(HISTORY_14, 7);
      assert.equal(result.isSynthetic, true);
      assert.ok(result.syntheticDisclaimer.length > 10);
    });
  });

  describe('4. forecastMedicineDemand', () => {
    it('correctly projects demand and stockout day for a critical medicine', () => {
      const result = forecastMedicineDemand(CRITICAL_MED, 7);
      assert.equal(result.success, true);
      assert.equal(result.medicineId, 'MED-001');
      // usable=1, burn=0.9, seasonal~1.18 → projDailyDemand ≈ 1.1 → stockout ~0.9d
      assert.ok(result.projectedDaysUntilStockout < 2, 'Should project <2 days until stockout');
      assert.equal(result.riskLevel, 'CRITICAL');
      assert.match(result.riskReason, /Stock-out projected/);
      assert.equal(result.isSynthetic, true);
    });

    it('correctly projects surplus medicine as OPTIMAL', () => {
      const result = forecastMedicineDemand(SURPLUS_MED, 7);
      assert.equal(result.success, true);
      assert.ok(result.projectedDaysUntilStockout > 7, 'Surplus should last > 7 days');
      assert.ok(['OPTIMAL', 'HIGH'].includes(result.riskLevel));
    });

    it('fails safely when daily consumption is 0', () => {
      const zeroConsumption = { ...SURPLUS_MED, averageDailyConsumption: 0 };
      const result = forecastMedicineDemand(zeroConsumption, 7);
      assert.equal(result.success, false);
      assert.match(result.error, /Zero or missing daily consumption/);
    });

    it('applies seasonal multiplier and states it in assumptions', () => {
      const result = forecastMedicineDemand(CRITICAL_MED, 7);
      assert.ok(result.assumptions.seasonalMultiplier.includes('x'));
    });
  });

  describe('5. Haversine Distance Calculation', () => {
    it('calculates a reasonable distance between PHC-01 and DH-01', () => {
      const dist = haversineDistanceKm(
        CENTERS[0].coordinates,
        CENTERS[1].coordinates
      );
      // The coords are ~15–20 km apart
      assert.ok(dist !== null);
      assert.ok(dist > 5 && dist < 40, `Expected 5–40 km, got ${dist}`);
    });

    it('returns null when coordinates are missing', () => {
      assert.equal(haversineDistanceKm(null, CENTERS[1].coordinates), null);
      assert.equal(haversineDistanceKm({ lat: 12.5 }, CENTERS[1].coordinates), null);
    });
  });

  describe('6. Redistribution Recommendation Engine', () => {
    it('generates a recommendation pairing donor with recipient', () => {
      const medicines = [CRITICAL_MED, SURPLUS_MED];
      const recs = generateRedistributionRecommendations(medicines, CENTERS);
      assert.ok(recs.length >= 1, 'Should produce at least one recommendation');
      const rec = recs[0];
      assert.equal(rec.recipientCenterId, 'PHC-01');
      assert.equal(rec.donorCenterId, 'DH-01');
    });

    it('never transfers more than the donor surplus (protecting donor threshold)', () => {
      const medicines = [CRITICAL_MED, SURPLUS_MED];
      const recs = generateRedistributionRecommendations(medicines, CENTERS);
      const rec = recs[0];
      // Donor surplus = 32 - 20 (minThreshold) = 12 vials
      assert.ok(rec.transferQuantity <= 12,
        `Transfer (${rec.transferQuantity}) must not exceed donor surplus (12)`);
      // After transfer, donor should stay >= minThreshold
      assert.ok(rec.donorUsableStockAfter >= SURPLUS_MED.minThreshold,
        `Donor stock after (${rec.donorUsableStockAfter}) must remain >= threshold (${SURPLUS_MED.minThreshold})`);
    });

    it('calculates distance when coordinates exist on both centres', () => {
      const medicines = [CRITICAL_MED, SURPLUS_MED];
      const recs = generateRedistributionRecommendations(medicines, CENTERS);
      const rec = recs[0];
      assert.ok(rec.distanceKm !== null);
      assert.ok(rec.distanceKm > 0);
    });

    it('produces no recommendations when all facilities have sufficient stock', () => {
      // Both facilities are at surplus level
      const wellStocked = [
        { ...SURPLUS_MED, id: 'TEST-A', centerId: 'DH-01', usableStock: 50, minThreshold: 10, riskLevel: 'optimal', daysRemaining: 30 },
        { ...SURPLUS_MED, id: 'TEST-B', centerId: 'CHC-01', centerName: 'CHC-01', usableStock: 40, minThreshold: 10, riskLevel: 'optimal', daysRemaining: 25 }
      ];
      const recs = generateRedistributionRecommendations(wellStocked, CENTERS);
      assert.equal(recs.length, 0, 'Should produce zero recommendations when all stock is healthy');
    });

    it('marks all recommendations as PENDING_APPROVAL (not auto-approved)', () => {
      const medicines = [CRITICAL_MED, SURPLUS_MED];
      const recs = generateRedistributionRecommendations(medicines, CENTERS);
      recs.forEach(r => {
        assert.equal(r.status, 'PENDING_APPROVAL',
          'All new recommendations must require administrator approval');
      });
    });
  });

});
