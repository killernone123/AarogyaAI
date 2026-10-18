/**
 * AAROGYA-AI INVENTORY RISK & TELEMETRY CALCULATION SERVICE
 * 
 * Implements transparent, deterministic stock calculations:
 * - Usable stock = Total Stock - Expired Stock
 * - Estimated Days Remaining = Usable Stock / Average Daily Consumption
 * - Transparent explanation reasons for all alert classifications
 * - Strict validation for all numeric fields, batches, and expiry dates
 * 
 * DISCLAIMER:
 * Does not make automated clinical decisions or directly alter physical stock.
 * Provides administrative decision-support telemetry only.
 */

export const RISK_LEVELS = {
  CRITICAL: 'critical',           // < 3 days of stock OR 0 usable stock
  LOW: 'low',                     // 3 to 7 days of stock OR stock <= minThreshold
  OPTIMAL: 'optimal',             // 7 to 30 days of stock and > minThreshold
  SURPLUS: 'surplus',             // > 30 days of stock with significant buffer
  NO_CONSUMPTION: 'no_consumption'// Consumption rate is 0 or unrecorded
};

/**
 * Checks if a given date string is expired compared to reference date (defaults to now)
 * @param {string|Date} dateStr 
 * @param {Date} [referenceDate]
 * @returns {boolean}
 */
export function isDateExpired(dateStr, referenceDate = new Date()) {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  if (isNaN(expiry.getTime())) return false;
  return expiry.getTime() < referenceDate.getTime();
}

/**
 * Checks if a given date is expiring within threshold days (e.g. 30 days)
 * @param {string|Date} dateStr 
 * @param {number} withinDays 
 * @param {Date} [referenceDate]
 * @returns {boolean}
 */
export function isNearExpiry(dateStr, withinDays = 30, referenceDate = new Date()) {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  if (isNaN(expiry.getTime())) return false;
  
  const diffTime = expiry.getTime() - referenceDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= withinDays;
}

/**
 * Calculates usable stock and separates expired/near-expiry quantities
 * @param {Array<{batchNumber: string, quantity: number, expiryDate: string}>} batches 
 * @param {Date} [referenceDate]
 * @returns {{usableStock: number, expiredStock: number, nearExpiryStock: number, processedBatches: Array}}
 */
export function calculateBatchMetrics(batches = [], referenceDate = new Date()) {
  if (!Array.isArray(batches) || batches.length === 0) {
    return {
      usableStock: 0,
      expiredStock: 0,
      nearExpiryStock: 0,
      processedBatches: []
    };
  }

  let usableStock = 0;
  let expiredStock = 0;
  let nearExpiryStock = 0;

  const processedBatches = batches.map(batch => {
    const qty = Math.max(0, Number(batch.quantity) || 0);
    const expired = isDateExpired(batch.expiryDate, referenceDate);
    const nearExp = !expired && isNearExpiry(batch.expiryDate, 30, referenceDate);

    if (expired) {
      expiredStock += qty;
    } else {
      usableStock += qty;
      if (nearExp) {
        nearExpiryStock += qty;
      }
    }

    return {
      batchNumber: batch.batchNumber || 'DEFAULT',
      quantity: qty,
      expiryDate: batch.expiryDate,
      isExpired: expired,
      isNearExpiry: nearExp
    };
  });

  return {
    usableStock,
    expiredStock,
    nearExpiryStock,
    processedBatches
  };
}

/**
 * Calculates estimated days of stock remaining
 * Formula: usableStock / averageDailyConsumption
 * 
 * @param {number} usableStock 
 * @param {number} averageDailyConsumption 
 * @returns {{daysRemaining: number|null, status: string, explanation: string}}
 */
export function calculateDaysRemaining(usableStock, averageDailyConsumption) {
  const stock = Math.max(0, Number(usableStock) || 0);
  const burn = Number(averageDailyConsumption);

  // Guard against invalid, NaN or missing consumption values
  if (isNaN(burn) || burn < 0) {
    return {
      daysRemaining: null,
      status: 'INVALID_CONSUMPTION',
      explanation: 'Average daily consumption rate is invalid or missing.'
    };
  }

  // Zero stock available
  if (stock === 0) {
    return {
      daysRemaining: 0,
      status: 'STOCKOUT',
      explanation: 'Zero usable stock available in facility inventory.'
    };
  }

  // Zero consumption rate: cannot compute days remaining using burn rate
  if (burn === 0) {
    return {
      daysRemaining: null,
      status: 'ZERO_CONSUMPTION',
      explanation: 'Zero daily consumption recorded. Stock is stable with no active burn rate.'
    };
  }

  // Standard positive consumption rate calculation
  const rawDays = stock / burn;
  const daysRemaining = Math.round(rawDays * 10) / 10; // Round to 1 decimal place

  return {
    daysRemaining,
    status: 'VALID',
    explanation: `Calculated as usable stock (${stock}) / average daily consumption (${burn}/day) = ${daysRemaining} days remaining.`
  };
}

/**
 * Assesses stock risk level and generates clear human-readable clinical supply reasons
 * 
 * @param {Object} params
 * @param {number} params.usableStock
 * @param {number} params.averageDailyConsumption
 * @param {number} params.minThreshold
 * @param {number|null} params.daysRemaining
 * @param {number} [params.expiredStock=0]
 * @param {number} [params.nearExpiryStock=0]
 * @returns {{riskLevel: string, reason: string, severity: 'critical'|'warning'|'success'|'info'}}
 */
export function assessStockRisk({
  usableStock,
  averageDailyConsumption,
  minThreshold,
  daysRemaining,
  expiredStock = 0,
  nearExpiryStock = 0
}) {
  const stock = Math.max(0, Number(usableStock) || 0);
  const burn = Number(averageDailyConsumption) || 0;
  const threshold = Math.max(0, Number(minThreshold) || 0);

  // 1. Critical Stock-out condition (0 usable stock)
  if (stock === 0) {
    const expiredNote = expiredStock > 0 ? ` (${expiredStock} units quarantined due to expiry).` : '.';
    return {
      riskLevel: RISK_LEVELS.CRITICAL,
      severity: 'critical',
      reason: `Immediate stock-out: 0 usable units available in facility inventory${expiredNote}`
    };
  }

  // 2. Critical Depletion condition (< 3 days remaining)
  if (daysRemaining !== null && daysRemaining < 3) {
    return {
      riskLevel: RISK_LEVELS.CRITICAL,
      severity: 'critical',
      reason: `Critical stock-out risk: Only ${daysRemaining} days of stock remaining at current consumption (${burn} units/day). Expected run-out within 72 hours.`
    };
  }

  // 3. Low Stock condition (3 to 7 days remaining OR below minimum safety threshold)
  if ((daysRemaining !== null && daysRemaining <= 7) || stock <= threshold) {
    let reasonDetail = '';
    if (daysRemaining !== null && daysRemaining <= 7) {
      reasonDetail = `Estimated ${daysRemaining} days remaining (below 7-day reserve threshold).`;
    }
    if (stock <= threshold) {
      reasonDetail += ` Usable stock (${stock}) is at or below minimum safety threshold (${threshold}).`;
    }
    return {
      riskLevel: RISK_LEVELS.LOW,
      severity: 'warning',
      reason: `Low stock alert: ${reasonDetail.trim()} Re-order required.`
    };
  }

  // 4. Zero consumption with existing stock
  if (burn === 0) {
    return {
      riskLevel: RISK_LEVELS.NO_CONSUMPTION,
      severity: 'info',
      reason: `Stock available (${stock} units), but average daily consumption is 0. Days-remaining cannot be projected.`
    };
  }

  // 5. Surplus condition (> 30 days and significant threshold buffer)
  if (daysRemaining !== null && daysRemaining > 30 && stock > threshold * 2) {
    return {
      riskLevel: RISK_LEVELS.SURPLUS,
      severity: 'info',
      reason: `Surplus stock: ${daysRemaining} days of inventory available. Candidate for redistribution to deficit facilities.`
    };
  }

  // 6. Optimal condition (7 to 30 days of stock)
  return {
    riskLevel: RISK_LEVELS.OPTIMAL,
    severity: 'success',
    reason: `Optimal inventory: ${daysRemaining} days of supply available. Adequate buffer maintained.`
  };
}

/**
 * Validates medicine creation or update input payload
 * @param {Object} data 
 * @returns {{isValid: boolean, errors: Array<string>}}
 */
export function validateMedicinePayload(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Request body must be a valid JSON object.'] };
  }

  // Name validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Medicine name is required and must be at least 2 characters.');
  }

  // Category validation
  if (!data.category || typeof data.category !== 'string' || data.category.trim().length === 0) {
    errors.push('Medicine category is required.');
  }

  // Unit validation
  if (!data.unit || typeof data.unit !== 'string' || data.unit.trim().length === 0) {
    errors.push('Unit of measurement (e.g. Vials, Strips, Sachets) is required.');
  }

  // Center ID validation
  if (!data.centerId || typeof data.centerId !== 'string') {
    errors.push('Assigned Health Center ID is required.');
  }

  // Numeric: Total quantity / Stock
  if (data.totalQuantity !== undefined) {
    const qty = Number(data.totalQuantity);
    if (isNaN(qty) || qty < 0 || !Number.isInteger(qty)) {
      errors.push('Total quantity must be a non-negative integer.');
    }
  }

  // Numeric: Minimum threshold
  if (data.minThreshold !== undefined) {
    const thresh = Number(data.minThreshold);
    if (isNaN(thresh) || thresh < 0) {
      errors.push('Minimum threshold must be a non-negative number.');
    }
  }

  // Numeric: Average Daily Consumption
  if (data.averageDailyConsumption !== undefined) {
    const burn = Number(data.averageDailyConsumption);
    if (isNaN(burn) || burn < 0) {
      errors.push('Average daily consumption must be a non-negative number.');
    }
  }

  // Batch & Expiry Date validation
  if (data.batches && Array.isArray(data.batches)) {
    data.batches.forEach((b, idx) => {
      if (!b.batchNumber || typeof b.batchNumber !== 'string') {
        errors.push(`Batch #${idx + 1} must include a valid batch number string.`);
      }
      const bQty = Number(b.quantity);
      if (isNaN(bQty) || bQty < 0 || !Number.isInteger(bQty)) {
        errors.push(`Batch #${idx + 1} quantity must be a non-negative integer.`);
      }
      if (b.expiryDate) {
        const d = new Date(b.expiryDate);
        if (isNaN(d.getTime())) {
          errors.push(`Batch #${idx + 1} expiry date '${b.expiryDate}' is not a valid date.`);
        }
      } else {
        errors.push(`Batch #${idx + 1} must specify an expiry date.`);
      }
    });
  } else if (data.expiryDate) {
    // Single expiryDate shorthand
    const d = new Date(data.expiryDate);
    if (isNaN(d.getTime())) {
      errors.push(`Expiry date '${data.expiryDate}' is not a valid date.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
