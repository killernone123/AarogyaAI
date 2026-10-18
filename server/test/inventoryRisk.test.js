import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDaysRemaining,
  calculateBatchMetrics,
  assessStockRisk,
  validateMedicinePayload,
  isDateExpired,
  RISK_LEVELS
} from '../src/services/inventoryRiskService.js';

describe('Inventory Calculation Logic Tests', () => {

  describe('1. calculateDaysRemaining', () => {
    it('correctly calculates days remaining for standard positive consumption', () => {
      // 100 usable stock, 10 daily consumption = 10 days
      const result = calculateDaysRemaining(100, 10);
      assert.equal(result.status, 'VALID');
      assert.equal(result.daysRemaining, 10.0);
      assert.match(result.explanation, /10 days remaining/);
    });

    it('rounds days remaining to 1 decimal place accurately', () => {
      // 10 usable stock, 3 daily burn rate = 3.3 days
      const result = calculateDaysRemaining(10, 3);
      assert.equal(result.daysRemaining, 3.3);
    });

    it('handles zero usable stock safely (stock-out)', () => {
      const result = calculateDaysRemaining(0, 5);
      assert.equal(result.status, 'STOCKOUT');
      assert.equal(result.daysRemaining, 0);
      assert.match(result.explanation, /Zero usable stock available/);
    });

    it('handles zero daily consumption safely without division by zero', () => {
      const result = calculateDaysRemaining(50, 0);
      assert.equal(result.status, 'ZERO_CONSUMPTION');
      assert.equal(result.daysRemaining, null);
      assert.match(result.explanation, /Zero daily consumption/);
    });

    it('handles negative or invalid consumption safely', () => {
      const resultNegative = calculateDaysRemaining(50, -2);
      assert.equal(resultNegative.status, 'INVALID_CONSUMPTION');
      assert.equal(resultNegative.daysRemaining, null);

      const resultNaN = calculateDaysRemaining(50, NaN);
      assert.equal(resultNaN.status, 'INVALID_CONSUMPTION');
      assert.equal(resultNaN.daysRemaining, null);
    });
  });

  describe('2. Batch Expiry & Usable Stock Exclusion', () => {
    const fixedNow = new Date('2026-10-18T12:00:00Z');

    it('correctly identifies expired dates', () => {
      assert.equal(isDateExpired('2026-09-01', fixedNow), true); // Past date
      assert.equal(isDateExpired('2027-01-01', fixedNow), false); // Future date
    });

    it('strictly excludes expired batches from usable stock', () => {
      const batches = [
        { batchNumber: 'B-01', quantity: 30, expiryDate: '2026-05-01' }, // EXPIRED
        { batchNumber: 'B-02', quantity: 50, expiryDate: '2027-06-01' }, // VALID
        { batchNumber: 'B-03', quantity: 20, expiryDate: '2025-12-31' }  // EXPIRED
      ];

      const metrics = calculateBatchMetrics(batches, fixedNow);

      // Usable stock must ONLY be B-02 (50 units)
      assert.equal(metrics.usableStock, 50);
      // Expired stock must be B-01 + B-03 = 30 + 20 = 50 units
      assert.equal(metrics.expiredStock, 50);
      assert.equal(metrics.processedBatches.length, 3);
      assert.equal(metrics.processedBatches[0].isExpired, true);
      assert.equal(metrics.processedBatches[1].isExpired, false);
      assert.equal(metrics.processedBatches[2].isExpired, true);
    });

    it('handles empty or missing batches safely', () => {
      const metrics = calculateBatchMetrics([], fixedNow);
      assert.equal(metrics.usableStock, 0);
      assert.equal(metrics.expiredStock, 0);
    });
  });

  describe('3. assessStockRisk & Reason Generation', () => {
    it('flags critical risk when usable stock is 0', () => {
      const risk = assessStockRisk({
        usableStock: 0,
        averageDailyConsumption: 4,
        minThreshold: 10,
        daysRemaining: 0,
        expiredStock: 15
      });
      assert.equal(risk.riskLevel, RISK_LEVELS.CRITICAL);
      assert.equal(risk.severity, 'critical');
      assert.match(risk.reason, /Immediate stock-out/);
      assert.match(risk.reason, /15 units quarantined due to expiry/);
    });

    it('flags critical risk when estimated days remaining is under 3 days', () => {
      const risk = assessStockRisk({
        usableStock: 5,
        averageDailyConsumption: 2.5,
        minThreshold: 10,
        daysRemaining: 2.0
      });
      assert.equal(risk.riskLevel, RISK_LEVELS.CRITICAL);
      assert.match(risk.reason, /Critical stock-out risk: Only 2 days of stock remaining/);
    });

    it('flags low stock when days remaining is between 3 and 7 days or below threshold', () => {
      const risk = assessStockRisk({
        usableStock: 15,
        averageDailyConsumption: 3,
        minThreshold: 20, // usableStock 15 <= minThreshold 20
        daysRemaining: 5.0
      });
      assert.equal(risk.riskLevel, RISK_LEVELS.LOW);
      assert.equal(risk.severity, 'warning');
      assert.match(risk.reason, /Low stock alert/);
    });

    it('flags optimal stock when supply is between 7 and 30 days with threshold buffer', () => {
      const risk = assessStockRisk({
        usableStock: 120,
        averageDailyConsumption: 8,
        minThreshold: 40,
        daysRemaining: 15.0
      });
      assert.equal(risk.riskLevel, RISK_LEVELS.OPTIMAL);
      assert.equal(risk.severity, 'success');
      assert.match(risk.reason, /Optimal inventory/);
    });

    it('flags surplus stock when days remaining exceeds 30 days and has large threshold buffer', () => {
      const risk = assessStockRisk({
        usableStock: 400,
        averageDailyConsumption: 5,
        minThreshold: 50,
        daysRemaining: 80.0
      });
      assert.equal(risk.riskLevel, RISK_LEVELS.SURPLUS);
      assert.match(risk.reason, /Surplus stock/);
    });

    it('flags no_consumption when daily consumption rate is 0', () => {
      const risk = assessStockRisk({
        usableStock: 50,
        averageDailyConsumption: 0,
        minThreshold: 20,
        daysRemaining: null
      });
      assert.equal(risk.riskLevel, RISK_LEVELS.NO_CONSUMPTION);
      assert.match(risk.reason, /average daily consumption is 0/);
    });
  });

  describe('4. validateMedicinePayload', () => {
    it('validates a correct medicine payload successfully', () => {
      const payload = {
        name: 'Amoxicillin 500mg',
        category: 'Antibiotics',
        unit: 'Strips (10s)',
        centerId: 'DH-01',
        totalQuantity: 200,
        minThreshold: 50,
        averageDailyConsumption: 12,
        expiryDate: '2027-06-30'
      };
      const res = validateMedicinePayload(payload);
      assert.equal(res.isValid, true);
      assert.equal(res.errors.length, 0);
    });

    it('rejects invalid inputs (negative values, missing name, invalid date)', () => {
      const invalidPayload = {
        name: '',
        category: '',
        unit: '',
        centerId: '',
        totalQuantity: -5,
        minThreshold: -10,
        averageDailyConsumption: -2,
        expiryDate: 'not-a-date'
      };
      const res = validateMedicinePayload(invalidPayload);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.length >= 6);
      assert.ok(res.errors.some(e => e.includes('name is required')));
      assert.ok(res.errors.some(e => e.includes('non-negative integer')));
      assert.ok(res.errors.some(e => e.includes('not a valid date')));
    });
  });

});
