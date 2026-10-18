import React, { useState, useEffect } from 'react';
import { X, Pill, AlertCircle, Calculator, Check, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useHealthData } from '../../context/HealthDataContext';

export default function MedicineFormModal({ isOpen, onClose, medicine = null }) {
  const { language, t } = useLanguage();
  const { centers, addMedicine, updateMedicine } = useHealthData();

  const isEdit = Boolean(medicine && medicine.id);

  const [formData, setFormData] = useState({
    name: '',
    nameHi: '',
    category: 'Antibiotics',
    centerId: 'PHC-01',
    unit: 'Strips (10s)',
    totalQuantity: 50,
    minThreshold: 20,
    averageDailyConsumption: 5.0,
    batchNumber: '',
    expiryDate: '',
    reason: '',
    performedBy: 'District Store Officer'
  });

  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate initial values when editing or opening
  useEffect(() => {
    if (medicine) {
      const primaryBatch = (medicine.batches && medicine.batches[0]) || {};
      setFormData({
        name: medicine.name || '',
        nameHi: medicine.nameHi || '',
        category: medicine.category || 'Antibiotics',
        centerId: medicine.centerId || 'PHC-01',
        unit: medicine.unit || 'Strips (10s)',
        totalQuantity: medicine.usableStock !== undefined ? medicine.usableStock : (medicine.stock || 50),
        minThreshold: medicine.minThreshold || 20,
        averageDailyConsumption: medicine.averageDailyConsumption !== undefined ? medicine.averageDailyConsumption : (medicine.burnRate || 5.0),
        batchNumber: primaryBatch.batchNumber || `BAT-${Date.now().toString().slice(-4)}`,
        expiryDate: primaryBatch.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: '',
        performedBy: 'District Store Officer'
      });
    } else {
      setFormData({
        name: '',
        nameHi: '',
        category: 'Antibiotics',
        centerId: 'PHC-01',
        unit: 'Strips (10s)',
        totalQuantity: 50,
        minThreshold: 20,
        averageDailyConsumption: 5.0,
        batchNumber: `BAT-${Date.now().toString().slice(-4)}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: 'Initial stock intake registered for facility.',
        performedBy: 'District Store Officer'
      });
    }
    setErrors([]);
  }, [medicine, isOpen]);

  if (!isOpen) return null;

  // Live calculation preview
  const stockNum = Math.max(0, Number(formData.totalQuantity) || 0);
  const burnNum = Math.max(0, Number(formData.averageDailyConsumption) || 0);
  let liveDaysRemaining = null;
  let liveStatus = 'OPTIMAL';

  if (burnNum > 0) {
    liveDaysRemaining = Math.round((stockNum / burnNum) * 10) / 10;
    if (liveDaysRemaining < 3) liveStatus = 'CRITICAL';
    else if (liveDaysRemaining <= 7) liveStatus = 'LOW';
    else if (liveDaysRemaining > 30) liveStatus = 'SURPLUS';
    else liveStatus = 'OPTIMAL';
  } else {
    liveStatus = 'NO_BURN';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      // Client-side quick checks
      const localErrors = [];
      if (!formData.name.trim()) localErrors.push('Medicine name is required.');
      if (!formData.reason.trim()) localErrors.push('Change justification reason is mandatory for audit logging.');
      if (Number(formData.totalQuantity) < 0) localErrors.push('Stock quantity cannot be negative.');
      if (Number(formData.averageDailyConsumption) < 0) localErrors.push('Daily consumption cannot be negative.');
      if (Number(formData.minThreshold) < 0) localErrors.push('Minimum threshold cannot be negative.');

      if (localErrors.length > 0) {
        setErrors(localErrors);
        setIsSubmitting(false);
        return;
      }

      const selectedCenter = centers.find(c => c.id === formData.centerId);
      const payload = {
        ...formData,
        centerName: selectedCenter ? selectedCenter.name : formData.centerId,
        totalQuantity: Number(formData.totalQuantity),
        minThreshold: Number(formData.minThreshold),
        averageDailyConsumption: Number(formData.averageDailyConsumption)
      };

      if (isEdit) {
        await updateMedicine(medicine.id, payload);
      } else {
        await addMedicine(payload);
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrors([err.message || 'Operation failed.']);
    }
  };

  const categories = [
    "Critical / Antidote",
    "Antibiotics",
    "Analgesic / Antipyretic",
    "Maternal & Child Health",
    "Chronic Diseases",
    "Respiratory",
    "Gastrointestinal"
  ];

  const units = [
    "Vials",
    "Strips (10s)",
    "Sachets",
    "Ampoules",
    "Bottles",
    "Tablets"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl border border-brand-100">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? "Update Inventory & Stock Allocation" : "Register New Medicine Formulation"}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? `Modifying telemetry for ${medicine.name} (${medicine.id})` : "Adds a new formulation with strict batch telemetry & audit tracking"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Errors display */}
        {errors.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Please resolve the following errors:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Live Calculation Preview Banner */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-700">Projected Run-Out: </span>
              <span className="text-slate-500">
                {stockNum} usable {formData.unit} ÷ {burnNum}/day =
              </span>
              <span className="font-bold text-slate-900 ml-1">
                {liveDaysRemaining !== null ? `${liveDaysRemaining} days` : 'No burn rate'}
              </span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
            liveStatus === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-200' :
            liveStatus === 'LOW' ? 'bg-amber-100 text-amber-800 border-amber-200' :
            liveStatus === 'SURPLUS' ? 'bg-sky-100 text-sky-800 border-sky-200' :
            liveStatus === 'NO_BURN' ? 'bg-slate-100 text-slate-700 border-slate-200' :
            'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}>
            {liveStatus} RISK
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Medicine Name (English) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicine Name (English) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Paracetamol 650mg"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Medicine Name (Hindi) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medicine Name (Hindi)
              </label>
              <input
                type="text"
                value={formData.nameHi}
                onChange={e => setFormData({ ...formData, nameHi: e.target.value })}
                placeholder="उदा. पैरासिटामोल 650mg"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Therapeutic Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Health Center Assignment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Health Facility *
              </label>
              <select
                value={formData.centerId}
                onChange={e => setFormData({ ...formData, centerId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {centers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {language === 'hi' ? c.nameHi : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.totalQuantity}
                onChange={e => setFormData({ ...formData, totalQuantity: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit of Measure *
              </label>
              <select
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Average Daily Consumption */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Avg Daily Consumption (Burn Rate) *
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={formData.averageDailyConsumption}
                onChange={e => setFormData({ ...formData, averageDailyConsumption: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Minimum Safety Threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Safety Threshold *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.minThreshold}
                onChange={e => setFormData({ ...formData, minThreshold: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch Identifier
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="e.g. BAT-2026-09"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch Expiry Date *
              </label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Audit Justification Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Justification / Change Reason *
            </label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Regular depot supply received / Physical count reconciliation"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Required for government audit trail compliance.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Recording in Telemetry...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEdit ? "Update Formulation" : "Save to Inventory"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
