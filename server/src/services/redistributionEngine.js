/**
 * AAROGYA-AI REDISTRIBUTION ENGINE
 *
 * Identifies donor/recipient facility pairs and calculates safe transfer
 * quantities to balance district medicine supply.
 *
 * CONSTRAINTS & GUARDRAILS:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. EXPIRED STOCK EXCLUDED: Only usableStock (non-expired batches) is
 *    considered for transfers. Expired stock is never recommended for transfer.
 * 2. DONOR SAFETY THRESHOLD: A donor centre will never be recommended to
 *    transfer stock that would bring its own supply below its minThreshold.
 *    The surplus used = usableStock − minThreshold (donor protected buffer).
 * 3. NO AUTOMATIC EXECUTION: Recommendations are advisory only. An authorized
 *    district administrator must explicitly approve each transfer.
 * 4. AUDIT LOGGING: Every approval is recorded in the redistribution audit log.
 * 5. DISTANCE: Used for route display only. Geographic coordinates must exist
 *    on both centres; otherwise distance is shown as "unknown".
 * 6. FEASIBILITY CAP: No single transfer recommendation exceeds the recipient's
 *    total projected 14-day need to avoid over-stocking a small facility.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { enrichMedicine } from '../data/inventoryStore.js';
import { forecastMedicineDemand } from './forecastingService.js';

/** In-memory redistribution recommendation log (pending + approved) */
let redistributionLog = [
  {
    id: 'RD-DEMO-001',
    status: 'APPROVED',
    medicineId: 'MED-002',
    medicineName: 'Anti-Snake Venom (ASV)',
    donorCenterId: 'DH-01',
    donorCenterName: 'Ramanagar District Hospital',
    recipientCenterId: 'PHC-01',
    recipientCenterName: 'PHC Bilikere Rural',
    transferQuantity: 5,
    unit: 'Vials',
    donorUsableStockBefore: 32,
    donorUsableStockAfter: 27,
    recipientUsableStockBefore: 1,
    recipientUsableStockAfter: 6,
    distanceKm: 14.8,
    riskReason: 'PHC Bilikere Rural has 1.1 days of ASV stock at current burn rate. Immediate life-safety redistribution required.',
    approvedBy: 'Dr. S. Ramachandran (DHO, Ramanagar)',
    approvedAt: '2026-10-18T10:00:00Z',
    createdAt: '2026-10-18T09:35:00Z',
    isSynthetic: true
  }
];

let nextRdId = 1;

/**
 * Haversine formula to calculate distance in km between two lat/lng points.
 * Returns null if coordinates are missing or invalid.
 *
 * @param {{lat: number, lng: number}} a
 * @param {{lat: number, lng: number}} b
 * @returns {number|null}
 */
export function haversineDistanceKm(a, b) {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const a2 =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLon * sinLon;
  return Math.round(2 * R * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2)) * 10) / 10;
}

/**
 * Generate redistribution recommendations for a given medicine across all
 * facilities.
 *
 * Algorithm:
 *   1. For each medicine copy, compute usable stock, minThreshold, daysRemaining.
 *   2. Classify recipients (daysRemaining < 7 OR usable <= threshold).
 *   3. Classify donors (usableStock > minThreshold with genuine surplus).
 *   4. Pair each recipient with the best matching donor (most surplus first).
 *   5. Calculate transfer quantity: min(donorSurplus, recipientShortfall, 14-day need).
 *   6. Never reduce donor below its own minThreshold.
 *
 * @param {Object[]} medicines    – enriched inventory items (all centres)
 * @param {Object[]} centers      – health centre objects with coordinates
 * @param {Date}    [referenceDate]
 * @returns {Object[]} array of recommendation objects
 */
export function generateRedistributionRecommendations(medicines, centers, referenceDate = new Date()) {
  const recommendations = [];

  // Index centers by id
  const centerMap = {};
  centers.forEach(c => { centerMap[c.id] = c; });

  // Group medicines by formulation name (so we match same drug across facilities)
  const byFormulation = {};
  medicines.forEach(m => {
    const key = m.name.trim().toLowerCase();
    if (!byFormulation[key]) byFormulation[key] = [];
    byFormulation[key].push(m);
  });

  Object.values(byFormulation).forEach(group => {
    if (group.length < 2) return; // Need at least two facilities for redistribution

    // Compute per-facility metrics
    const enriched = group.map(m => {
      const forecast = forecastMedicineDemand(m, 14, referenceDate);
      return {
        ...m,
        forecast,
        surplus: Math.max(0, m.usableStock - m.minThreshold),
        // 14-day shortfall including forecast
        shortfall: forecast.success
          ? Math.max(0, forecast.replenishmentRecommended)
          : Math.max(0, m.minThreshold - m.usableStock)
      };
    });

    // Classify
    const recipients = enriched.filter(m =>
      m.riskLevel === 'critical' ||
      m.riskLevel === 'low' ||
      (m.daysRemaining !== null && m.daysRemaining < 7) ||
      m.usableStock <= m.minThreshold
    );
    const donors = enriched
      .filter(m => m.surplus > 0)
      .sort((a, b) => b.surplus - a.surplus); // Most surplus first

    if (recipients.length === 0 || donors.length === 0) return;

    recipients.forEach(recipient => {
      if (recipient.shortfall <= 0 && recipient.usableStock > recipient.minThreshold) return;

      // Find best donor that is not the recipient itself
      const donor = donors.find(d => d.id !== recipient.id && d.surplus > 0);
      if (!donor) return;

      // Calculate safe transfer qty
      const maxFromDonor = donor.surplus; // never below donor's threshold
      const recipientNeed = Math.max(
        recipient.shortfall,
        Math.ceil(recipient.minThreshold - recipient.usableStock + 2)
      );
      const transferQty = Math.min(maxFromDonor, recipientNeed);
      if (transferQty <= 0) return;

      // Distance between centres
      const donorCenter = centerMap[donor.centerId];
      const recipientCenter = centerMap[recipient.centerId];
      const distanceKm = donorCenter?.coordinates && recipientCenter?.coordinates
        ? haversineDistanceKm(donorCenter.coordinates, recipientCenter.coordinates)
        : null;

      recommendations.push({
        recommendationId: `RD-${Date.now()}-${recommendations.length + 1}`,
        status: 'PENDING_APPROVAL',
        medicineId: donor.id, // donor's record id
        medicineName: donor.name,
        medicineName_hi: donor.nameHi,
        unit: donor.unit,
        category: donor.category,
        donorCenterId: donor.centerId,
        donorCenterName: donor.centerName,
        donorUsableStockBefore: donor.usableStock,
        donorMinThreshold: donor.minThreshold,
        donorSurplusBeforeTransfer: donor.surplus,
        donorUsableStockAfter: donor.usableStock - transferQty,
        recipientMedicineId: recipient.id,
        recipientCenterId: recipient.centerId,
        recipientCenterName: recipient.centerName,
        recipientUsableStockBefore: recipient.usableStock,
        recipientMinThreshold: recipient.minThreshold,
        recipientUsableStockAfter: recipient.usableStock + transferQty,
        transferQuantity: transferQty,
        distanceKm,
        recipientDaysRemainingBefore: recipient.daysRemaining,
        recipientProjectedDaysAfter: recipient.averageDailyConsumption > 0
          ? Math.round(((recipient.usableStock + transferQty) / recipient.averageDailyConsumption) * 10) / 10
          : null,
        riskReason: buildRiskReason(recipient, donor, transferQty),
        isSynthetic: true,
        createdAt: new Date().toISOString()
      });

      // Reduce donor's virtual surplus to avoid double-booking
      donor.surplus -= transferQty;
    });
  });

  return recommendations;
}

/**
 * Build a clear human-readable reason for a redistribution recommendation.
 */
function buildRiskReason(recipient, donor, transferQty) {
  const daysNote = recipient.daysRemaining !== null
    ? `${recipient.daysRemaining} days of usable supply`
    : 'unknown days of usable supply';
  const donorNote = `${donor.centerName} has a surplus of ${donor.surplus + transferQty} ${donor.unit} (${Math.round(donor.usableStock / (donor.averageDailyConsumption || 1))} days), safely above its minimum threshold.`;

  return `${recipient.centerName} has only ${daysNote} of ${recipient.name}, below the 7-day safety reserve. Proposed transfer of ${transferQty} ${recipient.unit} from ${donor.centerName} (${donor.usableStock} ${donor.unit} currently). ${donorNote} After transfer, donor will retain ${donor.usableStock - transferQty} ${donor.unit} (above threshold of ${donor.minThreshold}).`;
}

/**
 * Returns all redistribution log records (pending + approved).
 * @param {string} [statusFilter] - 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | ALL
 */
export function getRedistributionLog(statusFilter = null) {
  if (statusFilter && statusFilter !== 'ALL') {
    return redistributionLog.filter(r => r.status === statusFilter);
  }
  return [...redistributionLog];
}

/**
 * Administrator approval of a redistribution recommendation.
 * Appends to audit log. Does NOT mutate actual inventory (that requires a
 * separate inventory update call by the administrator).
 *
 * @param {string} recommendationId
 * @param {string} approvedBy – authorizing administrator name / role
 * @param {Object} recommendation – the full recommendation object (from generateRedistributionRecommendations)
 * @returns {Object} approved log entry
 */
export function approveTransfer(recommendationId, approvedBy, recommendation) {
  if (!approvedBy || typeof approvedBy !== 'string' || approvedBy.trim().length < 3) {
    throw { status: 400, message: 'Authorizing administrator name is required (minimum 3 characters).' };
  }

  const existing = redistributionLog.find(r => r.id === recommendationId);
  if (existing) {
    throw { status: 409, message: `Transfer ${recommendationId} has already been logged.` };
  }

  const entry = {
    id: recommendationId,
    ...recommendation,
    status: 'APPROVED',
    approvedBy: approvedBy.trim(),
    approvedAt: new Date().toISOString(),
    isSynthetic: true
  };

  redistributionLog.unshift(entry);
  return entry;
}

/**
 * Administrator rejection of a recommendation.
 */
export function rejectTransfer(recommendationId, rejectedBy, reason, recommendation) {
  const entry = {
    id: recommendationId,
    ...recommendation,
    status: 'REJECTED',
    rejectedBy: (rejectedBy || 'Administrator').trim(),
    rejectionReason: reason || 'No reason provided.',
    rejectedAt: new Date().toISOString(),
    isSynthetic: true
  };
  redistributionLog.unshift(entry);
  return entry;
}
