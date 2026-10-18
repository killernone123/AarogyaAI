import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="h-8 bg-slate-200 rounded w-1/2"></div>
      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm animate-pulse space-y-4">
      <div className="h-5 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-100 rounded w-1/2"></div>
      <div className="h-64 bg-slate-100/70 rounded-lg mt-6"></div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm animate-pulse space-y-4">
      <div className="h-5 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}
