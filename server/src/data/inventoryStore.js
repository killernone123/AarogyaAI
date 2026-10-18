/**
 * AAROGYA-AI INVENTORY DATA STORE & AUDIT TRAIL
 * 
 * Provides an in-memory, reactive data repository for medicines, batches,
 * and immutable inventory audit transactions.
 * Pre-seeded with documented synthetic healthcare inventory records.
 */

import {
  calculateBatchMetrics,
  calculateDaysRemaining,
  assessStockRisk,
  validateMedicinePayload,
  RISK_LEVELS
} from '../services/inventoryRiskService.js';

// Pre-seeded Synthetic Medicines with Multi-batch and Expiry Data
let medicines = [
  {
    id: "MED-001",
    name: "Anti-Snake Venom (ASV)",
    nameHi: "एंटी-स्नेक वेनम (सर्पदंश रोधी)",
    category: "Critical / Antidote",
    unit: "Vials",
    centerId: "PHC-01",
    centerName: "PHC Bilikere Rural",
    minThreshold: 5,
    averageDailyConsumption: 0.9,
    batches: [
      { batchNumber: "ASV-2025-X", quantity: 2, expiryDate: "2026-06-15" }, // EXPIRED (quarantined)
      { batchNumber: "ASV-2026-A", quantity: 1, expiryDate: "2027-04-30" }  // USABLE (1 vial left)
    ],
    lastRestocked: "2026-09-10T10:00:00Z",
    updatedAt: "2026-10-18T09:30:00Z",
    isSynthetic: true
  },
  {
    id: "MED-002",
    name: "Anti-Snake Venom (ASV)",
    nameHi: "एंटी-स्नेक वेनम (सर्पदंश रोधी)",
    category: "Critical / Antidote",
    unit: "Vials",
    centerId: "DH-01",
    centerName: "Ramanagar District Hospital",
    minThreshold: 20,
    averageDailyConsumption: 2.8,
    batches: [
      { batchNumber: "ASV-2026-D", quantity: 32, expiryDate: "2027-11-20" }
    ],
    lastRestocked: "2026-10-01T08:00:00Z",
    updatedAt: "2026-10-18T08:00:00Z",
    isSynthetic: true
  },
  {
    id: "MED-003",
    name: "Amoxicillin 500mg",
    nameHi: "एमोक्सिसिलिन 500mg",
    category: "Antibiotics",
    unit: "Strips (10s)",
    centerId: "PHC-01",
    centerName: "PHC Bilikere Rural",
    minThreshold: 40,
    averageDailyConsumption: 6.0,
    batches: [
      { batchNumber: "AMX-880", quantity: 15, expiryDate: "2027-08-15" }
    ],
    lastRestocked: "2026-09-15T11:00:00Z",
    updatedAt: "2026-10-18T09:15:00Z",
    isSynthetic: true
  },
  {
    id: "MED-004",
    name: "Amoxicillin 500mg",
    nameHi: "एमोक्सिसिलिन 500mg",
    category: "Antibiotics",
    unit: "Strips (10s)",
    centerId: "DH-01",
    centerName: "Ramanagar District Hospital",
    minThreshold: 200,
    averageDailyConsumption: 28.0,
    batches: [
      { batchNumber: "AMX-910", quantity: 420, expiryDate: "2027-12-31" }
    ],
    lastRestocked: "2026-10-05T09:00:00Z",
    updatedAt: "2026-10-18T08:30:00Z",
    isSynthetic: true
  },
  {
    id: "MED-005",
    name: "Paracetamol 650mg",
    nameHi: "पैरासिटामोल 650mg",
    category: "Analgesic / Antipyretic",
    unit: "Strips (10s)",
    centerId: "CHC-01",
    centerName: "CHC Anandpur South",
    minThreshold: 150,
    averageDailyConsumption: 26.0,
    batches: [
      { batchNumber: "PCM-102", quantity: 220, expiryDate: "2028-02-28" }
    ],
    lastRestocked: "2026-09-28T14:00:00Z",
    updatedAt: "2026-10-18T07:45:00Z",
    isSynthetic: true
  },
  {
    id: "MED-006",
    name: "ORS (Oral Rehydration Salts)",
    nameHi: "ओआरएस (जीवन रक्षक घोल)",
    category: "Maternal & Child Health",
    unit: "Sachets",
    centerId: "PHC-01",
    centerName: "PHC Bilikere Rural",
    minThreshold: 50,
    averageDailyConsumption: 9.0,
    batches: [
      { batchNumber: "ORS-332", quantity: 12, expiryDate: "2027-05-10" }
    ],
    lastRestocked: "2026-09-12T12:00:00Z",
    updatedAt: "2026-10-18T08:00:00Z",
    isSynthetic: true
  },
  {
    id: "MED-007",
    name: "ORS (Oral Rehydration Salts)",
    nameHi: "ओआरएस (जीवन रक्षक घोल)",
    category: "Maternal & Child Health",
    unit: "Sachets",
    centerId: "CHC-01",
    centerName: "CHC Anandpur South",
    minThreshold: 80,
    averageDailyConsumption: 18.0,
    batches: [
      { batchNumber: "ORS-340", quantity: 45, expiryDate: "2027-09-30" }
    ],
    lastRestocked: "2026-09-20T10:00:00Z",
    updatedAt: "2026-10-18T08:15:00Z",
    isSynthetic: true
  },
  {
    id: "MED-008",
    name: "Oxytocin 10 IU",
    nameHi: "ऑक्सीटोसिन 10 IU",
    category: "Maternal & Child Health",
    unit: "Ampoules",
    centerId: "PHC-03",
    centerName: "PHC Honnali Riverside",
    minThreshold: 8,
    averageDailyConsumption: 1.2,
    batches: [
      { batchNumber: "OXY-701", quantity: 3, expiryDate: "2027-01-31" }
    ],
    lastRestocked: "2026-09-22T08:00:00Z",
    updatedAt: "2026-10-18T09:00:00Z",
    isSynthetic: true
  },
  {
    id: "MED-009",
    name: "Metformin 500mg",
    nameHi: "मेटफॉर्मिन 500mg",
    category: "Chronic Diseases",
    unit: "Strips (10s)",
    centerId: "DH-01",
    centerName: "Ramanagar District Hospital",
    minThreshold: 200,
    averageDailyConsumption: 35.0,
    batches: [
      { batchNumber: "MET-554", quantity: 700, expiryDate: "2028-03-31" }
    ],
    lastRestocked: "2026-10-10T11:00:00Z",
    updatedAt: "2026-10-18T08:00:00Z",
    isSynthetic: true
  },
  {
    id: "MED-010",
    name: "Salbutamol Respirator Solution",
    nameHi: "सालबुटामोल रेस्पिरेटर सॉल्यूशन",
    category: "Respiratory",
    unit: "Bottles",
    centerId: "CHC-02",
    centerName: "CHC Malgudi Hill",
    minThreshold: 15,
    averageDailyConsumption: 0.0, // Zero consumption demo case
    batches: [
      { batchNumber: "SAL-112", quantity: 24, expiryDate: "2027-10-31" }
    ],
    lastRestocked: "2026-09-01T10:00:00Z",
    updatedAt: "2026-10-18T08:00:00Z",
    isSynthetic: true
  }
];

// Seeded Immutable Audit Trail
let auditTrail = [
  {
    id: "TXN-1001",
    medicineId: "MED-001",
    medicineName: "Anti-Snake Venom (ASV)",
    centerId: "PHC-01",
    type: "DISCARD_EXPIRED",
    quantityDelta: -2,
    previousStock: 3,
    newStock: 1,
    reason: "Batch ASV-2025-X expired (quarantined and excluded from usable inventory).",
    performedBy: "Pharmacist Bilikere PHC",
    timestamp: "2026-10-17T14:30:00Z",
    isSynthetic: true
  },
  {
    id: "TXN-1002",
    medicineId: "MED-004",
    medicineName: "Amoxicillin 500mg",
    centerId: "DH-01",
    type: "RESTOCK",
    quantityDelta: 200,
    previousStock: 220,
    newStock: 420,
    reason: "Quarterly district pharmaceutical depot replenishment received.",
    performedBy: "District Medical Store Officer",
    timestamp: "2026-10-05T09:00:00Z",
    isSynthetic: true
  },
  {
    id: "TXN-1003",
    medicineId: "MED-006",
    medicineName: "ORS (Oral Rehydration Salts)",
    centerId: "PHC-01",
    type: "CONSUMPTION_ADJUST",
    quantityDelta: -18,
    previousStock: 30,
    newStock: 12,
    reason: "Surge distribution for pediatric acute gastroenteritis cases.",
    performedBy: "Medical Officer In-Charge",
    timestamp: "2026-10-16T17:00:00Z",
    isSynthetic: true
  }
];

let nextIdCounter = 11;
let nextTxnCounter = 1004;

/**
 * Enriches medicine object with computed telemetry (usable stock, days remaining, risk level, explanation)
 */
export function enrichMedicine(med, referenceDate = new Date()) {
  const batchMetrics = calculateBatchMetrics(med.batches || [], referenceDate);
  const consumptionResult = calculateDaysRemaining(batchMetrics.usableStock, med.averageDailyConsumption);
  
  const riskAssessment = assessStockRisk({
    usableStock: batchMetrics.usableStock,
    averageDailyConsumption: med.averageDailyConsumption,
    minThreshold: med.minThreshold,
    daysRemaining: consumptionResult.daysRemaining,
    expiredStock: batchMetrics.expiredStock,
    nearExpiryStock: batchMetrics.nearExpiryStock
  });

  // Calculate total across all batches (usable + expired)
  const totalStock = (med.batches || []).reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);

  return {
    ...med,
    totalStock,
    usableStock: batchMetrics.usableStock,
    expiredStock: batchMetrics.expiredStock,
    nearExpiryStock: batchMetrics.nearExpiryStock,
    batches: batchMetrics.processedBatches,
    daysRemaining: consumptionResult.daysRemaining,
    consumptionStatus: consumptionResult.status,
    calculationExplanation: consumptionResult.explanation,
    riskLevel: riskAssessment.riskLevel,
    riskReason: riskAssessment.reason,
    riskSeverity: riskAssessment.severity
  };
}

/**
 * Returns all medicines with optional search, filters, and sorting
 */
export function getMedicines({ search, category, status, centerId, sortBy = 'urgency', sortOrder = 'asc' } = {}) {
  const now = new Date();
  let list = medicines.map(m => enrichMedicine(m, now));

  // Search filter (name, Hindi name, center, category)
  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    list = list.filter(m => 
      m.name.toLowerCase().includes(q) ||
      (m.nameHi && m.nameHi.includes(q)) ||
      m.category.toLowerCase().includes(q) ||
      m.centerId.toLowerCase().includes(q) ||
      (m.centerName && m.centerName.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (category && category !== 'ALL') {
    list = list.filter(m => m.category.toLowerCase() === category.toLowerCase());
  }

  // Risk / Status filter
  if (status && status !== 'ALL') {
    if (status === 'EXPIRED') {
      list = list.filter(m => m.expiredStock > 0);
    } else {
      list = list.filter(m => m.riskLevel.toLowerCase() === status.toLowerCase());
    }
  }

  // Center filter
  if (centerId && centerId !== 'ALL') {
    list = list.filter(m => m.centerId.toUpperCase() === centerId.toUpperCase());
  }

  // Sorting
  list.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'urgency') {
      // Critical (0-3d) first, then Low (3-7d), then Optimal, then Surplus, then No Consumption
      const rank = { critical: 1, low: 2, optimal: 3, surplus: 4, no_consumption: 5 };
      const rankA = rank[a.riskLevel] || 99;
      const rankB = rank[b.riskLevel] || 99;
      if (rankA !== rankB) {
        comparison = rankA - rankB;
      } else {
        // Tie breaker: lowest days remaining
        const daysA = a.daysRemaining !== null ? a.daysRemaining : 9999;
        const daysB = b.daysRemaining !== null ? b.daysRemaining : 9999;
        comparison = daysA - daysB;
      }
    } else if (sortBy === 'daysRemaining') {
      const daysA = a.daysRemaining !== null ? a.daysRemaining : (sortOrder === 'asc' ? 9999 : -1);
      const daysB = b.daysRemaining !== null ? b.daysRemaining : (sortOrder === 'asc' ? 9999 : -1);
      comparison = daysA - daysB;
    } else if (sortBy === 'usableStock') {
      comparison = a.usableStock - b.usableStock;
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'burnRate') {
      comparison = a.averageDailyConsumption - b.averageDailyConsumption;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return list;
}

/**
 * Returns single medicine by ID
 */
export function getMedicineById(id) {
  const med = medicines.find(m => m.id.toUpperCase() === id.toUpperCase());
  if (!med) return null;
  const enriched = enrichMedicine(med);
  const relatedAudit = auditTrail.filter(t => t.medicineId === med.id);
  return {
    ...enriched,
    auditTrail: relatedAudit
  };
}

/**
 * Creates a new medicine item and records audit transaction
 */
export function createMedicine(data, performedBy = 'District Store Officer') {
  const validation = validateMedicinePayload(data);
  if (!validation.isValid) {
    throw { status: 400, message: 'Validation failed', errors: validation.errors };
  }

  const id = `MED-${String(nextIdCounter++).padStart(3, '0')}`;
  const now = new Date().toISOString();

  // Construct batches
  let batches = [];
  if (data.batches && Array.isArray(data.batches) && data.batches.length > 0) {
    batches = data.batches.map((b, i) => ({
      batchNumber: b.batchNumber || `BAT-${Date.now()}-${i + 1}`,
      quantity: Number(b.quantity) || 0,
      expiryDate: b.expiryDate
    }));
  } else {
    // Single batch default from totalQuantity
    batches = [
      {
        batchNumber: data.batchNumber || `BAT-${Date.now()}-1`,
        quantity: Number(data.totalQuantity) || 0,
        expiryDate: data.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];
  }

  const newMedicine = {
    id,
    name: data.name.trim(),
    nameHi: data.nameHi ? data.nameHi.trim() : data.name.trim(),
    category: data.category.trim(),
    unit: data.unit.trim(),
    centerId: data.centerId,
    centerName: data.centerName || data.centerId,
    minThreshold: Number(data.minThreshold) || 10,
    averageDailyConsumption: Number(data.averageDailyConsumption) || 0,
    batches,
    lastRestocked: now,
    updatedAt: now,
    isSynthetic: true
  };

  medicines.push(newMedicine);

  // Compute total initial stock
  const initialStock = batches.reduce((sum, b) => sum + b.quantity, 0);

  // Record audit trail
  const txn = {
    id: `TXN-${nextTxnCounter++}`,
    medicineId: id,
    medicineName: newMedicine.name,
    centerId: newMedicine.centerId,
    type: 'CREATE',
    quantityDelta: initialStock,
    previousStock: 0,
    newStock: initialStock,
    reason: data.reason || 'New inventory formulation registered into facility catalog.',
    performedBy,
    timestamp: now,
    isSynthetic: true
  };
  auditTrail.unshift(txn);

  return enrichMedicine(newMedicine);
}

/**
 * Updates an existing medicine item and records audit transaction
 */
export function updateMedicine(id, updateData, performedBy = 'District Store Officer') {
  const index = medicines.findIndex(m => m.id.toUpperCase() === id.toUpperCase());
  if (index === -1) {
    throw { status: 404, message: `Medicine '${id}' not found.` };
  }

  const existing = medicines[index];
  const validation = validateMedicinePayload({ ...existing, ...updateData });
  if (!validation.isValid) {
    throw { status: 400, message: 'Validation failed', errors: validation.errors };
  }

  const now = new Date().toISOString();
  const prevEnriched = enrichMedicine(existing);
  const prevStock = prevEnriched.totalStock;

  // Update fields
  if (updateData.name) existing.name = updateData.name.trim();
  if (updateData.nameHi) existing.nameHi = updateData.nameHi.trim();
  if (updateData.category) existing.category = updateData.category.trim();
  if (updateData.unit) existing.unit = updateData.unit.trim();
  if (updateData.minThreshold !== undefined) existing.minThreshold = Number(updateData.minThreshold);
  if (updateData.averageDailyConsumption !== undefined) existing.averageDailyConsumption = Number(updateData.averageDailyConsumption);

  // If batches explicitly provided
  if (updateData.batches && Array.isArray(updateData.batches)) {
    existing.batches = updateData.batches.map((b, i) => ({
      batchNumber: b.batchNumber || `BAT-${Date.now()}-${i + 1}`,
      quantity: Number(b.quantity) || 0,
      expiryDate: b.expiryDate
    }));
  } else if (updateData.totalQuantity !== undefined) {
    // Shorthand stock update to primary batch
    const newQty = Number(updateData.totalQuantity);
    if (existing.batches && existing.batches.length > 0) {
      existing.batches[0].quantity = newQty;
    } else {
      existing.batches = [{
        batchNumber: `BAT-${Date.now()}-1`,
        quantity: newQty,
        expiryDate: updateData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }];
    }
  }

  existing.updatedAt = now;

  const newEnriched = enrichMedicine(existing);
  const newStock = newEnriched.totalStock;
  const delta = newStock - prevStock;

  // Record audit trail
  const txn = {
    id: `TXN-${nextTxnCounter++}`,
    medicineId: existing.id,
    medicineName: existing.name,
    centerId: existing.centerId,
    type: delta > 0 ? 'RESTOCK' : delta < 0 ? 'CONSUMPTION_ADJUST' : 'UPDATE',
    quantityDelta: delta,
    previousStock: prevStock,
    newStock: newStock,
    reason: updateData.reason || `Inventory details updated. Quantity adjusted by ${delta > 0 ? '+' : ''}${delta} ${existing.unit}.`,
    performedBy,
    timestamp: now,
    isSynthetic: true
  };
  auditTrail.unshift(txn);

  return newEnriched;
}

/**
 * Returns audit trail entries with optional medicineId filter
 */
export function getAuditTrail(medicineId = null) {
  if (medicineId) {
    return auditTrail.filter(t => t.medicineId.toUpperCase() === medicineId.toUpperCase());
  }
  return [...auditTrail];
}
