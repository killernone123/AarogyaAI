import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  getAuditTrail
} from '../src/data/inventoryStore.js';

describe('Inventory Store & API Operations Tests', () => {

  it('retrieves inventory items enriched with usableStock, daysRemaining, and riskReason', () => {
    const items = getMedicines();
    assert.ok(items.length >= 10);
    
    // Check first item (MED-001) has expired stock quarantined
    const med1 = items.find(m => m.id === 'MED-001');
    assert.ok(med1);
    assert.equal(med1.usableStock, 1);
    assert.equal(med1.expiredStock, 2);
    assert.equal(med1.totalStock, 3);
    assert.equal(med1.riskLevel, 'critical');
    assert.match(med1.riskReason, /Critical stock-out risk/);
  });

  it('filters inventory by search query, category, and status', () => {
    // Search for Amoxicillin
    const searchRes = getMedicines({ search: 'Amoxicillin' });
    assert.ok(searchRes.length >= 2);
    assert.ok(searchRes.every(m => m.name.includes('Amoxicillin')));

    // Filter by Critical status
    const criticalRes = getMedicines({ status: 'CRITICAL' });
    assert.ok(criticalRes.length >= 1);
    assert.ok(criticalRes.every(m => m.riskLevel === 'critical'));

    // Filter by Expired batches
    const expiredRes = getMedicines({ status: 'EXPIRED' });
    assert.ok(expiredRes.length >= 1);
    assert.ok(expiredRes.every(m => m.expiredStock > 0));
  });

  it('sorts inventory correctly by urgency and days remaining', () => {
    const sortedUrgency = getMedicines({ sortBy: 'urgency' });
    // Critical items should appear at the top
    assert.equal(sortedUrgency[0].riskLevel, 'critical');
  });

  it('creates a new medicine and logs an audit transaction', () => {
    const initialAuditCount = getAuditTrail().length;

    const newMed = createMedicine({
      name: 'Azithromycin 250mg',
      nameHi: 'एज़िथ्रोमाइसिन 250mg',
      category: 'Antibiotics',
      unit: 'Strips (10s)',
      centerId: 'PHC-02',
      totalQuantity: 60,
      minThreshold: 20,
      averageDailyConsumption: 4.0,
      expiryDate: '2027-10-31',
      reason: 'Special vector disease seasonal buffer stock allocation.'
    }, 'District Health Officer');

    assert.ok(newMed.id);
    assert.equal(newMed.name, 'Azithromycin 250mg');
    assert.equal(newMed.usableStock, 60);
    assert.equal(newMed.daysRemaining, 15.0);
    assert.equal(newMed.riskLevel, 'optimal');

    // Verify audit trail logged
    const auditAfter = getAuditTrail();
    assert.equal(auditAfter.length, initialAuditCount + 1);
    const latestTxn = auditAfter[0];
    assert.equal(latestTxn.medicineId, newMed.id);
    assert.equal(latestTxn.type, 'CREATE');
    assert.equal(latestTxn.quantityDelta, 60);
    assert.match(latestTxn.reason, /vector disease/);
  });

  it('updates an existing medicine, calculates delta, and logs an audit transaction', () => {
    const updated = updateMedicine('MED-003', {
      totalQuantity: 80,
      reason: 'Physical emergency resupply received from Anandpur warehouse.'
    }, 'Pharmacist Bilikere');

    assert.equal(updated.id, 'MED-003');
    assert.equal(updated.usableStock, 80);

    const relatedAudit = getAuditTrail('MED-003');
    assert.ok(relatedAudit.length >= 1);
    const latestTxn = relatedAudit[0];
    assert.equal(latestTxn.type, 'RESTOCK');
    assert.ok(latestTxn.quantityDelta > 0);
    assert.match(latestTxn.reason, /emergency resupply/);
  });

  it('rejects updates or creations with invalid values', () => {
    assert.throws(() => {
      createMedicine({
        name: '',
        totalQuantity: -10
      });
    }, (err) => {
      return err.status === 400 && err.errors.length > 0;
    });
  });

});
