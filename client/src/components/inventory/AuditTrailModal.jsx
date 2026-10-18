import React from 'react';
import { X, History, ArrowRight, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';

export default function AuditTrailModal({ isOpen, onClose, selectedMedicine = null }) {
  const { auditTrail } = useHealthData();

  if (!isOpen) return null;

  const displayList = selectedMedicine
    ? auditTrail.filter(t => t.medicineId === selectedMedicine.id)
    : auditTrail;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'RESTOCK':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DISCARD_EXPIRED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'CONSUMPTION_ADJUST':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CREATE':
        return 'bg-brand-100 text-brand-800 border-brand-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl my-8 max-h-[85vh] flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedMedicine
                    ? `Audit Trail: ${selectedMedicine.name} (${selectedMedicine.id})`
                    : "District Inventory Audit Trail & Transaction Ledger"}
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable record of inventory adjustments, restocks, and expired stock disposals
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

          {/* Audit List Container */}
          <div className="mt-4 overflow-y-auto max-h-[50vh] space-y-3 pr-1">
            {displayList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No inventory transaction events logged yet.
              </div>
            ) : (
              displayList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 text-xs space-y-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-800 text-[11px]">
                        {item.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {item.medicineName} ({item.centerId})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {/* Stock Delta Pill */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Stock Adjustment:</span>
                    <span className="font-semibold text-slate-700">{item.previousStock} units</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-slate-900">{item.newStock} units</span>
                    <span className={`font-bold ml-1 px-1.5 py-0.2 rounded text-[10px] ${
                      item.quantityDelta > 0 ? 'bg-emerald-100 text-emerald-800' :
                      item.quantityDelta < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.quantityDelta > 0 ? `+${item.quantityDelta}` : item.quantityDelta}
                    </span>
                  </div>

                  {/* Reason & Officer */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700">Justification: </span>
                      <span>{item.reason}</span>
                    </div>
                    <div className="text-slate-500 flex-shrink-0">
                      Authorized by: <span className="font-medium text-slate-700">{item.performedBy}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Immutable audit integrity verified</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors shadow-xs"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
