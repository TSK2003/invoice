import React from 'react';
import { DashboardStats } from '../../services/storage/IDocumentStorage';
import { formatCurrency } from '../../utils/currency';
import { FileCheck, FileSpreadsheet, Receipt, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatsProps {
  stats: DashboardStats;
}

export const StatsOverview: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Stat 1: Total Quotations */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Quotations</span>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{stats.totalQuotations}</div>
        <p className="text-[11px] text-slate-500 mt-1">Generated</p>
      </div>

      {/* Stat 2: Total Invoices */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Invoices</span>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{stats.totalInvoices}</div>
        <p className="text-[11px] text-slate-500 mt-1">Issued</p>
      </div>

      {/* Stat 3: Total Receipts */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Receipts</span>
          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{stats.totalReceipts}</div>
        <p className="text-[11px] text-slate-500 mt-1">Issued</p>
      </div>

      {/* Stat 4: Paid Amount */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Paid Amount</span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-emerald-600">{formatCurrency(stats.paidAmount)}</div>
        <p className="text-[11px] text-slate-500 mt-1">Collected</p>
      </div>

      {/* Stat 5: Outstanding */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Outstanding</span>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-amber-600">{formatCurrency(stats.outstandingAmount)}</div>
        <p className="text-[11px] text-slate-500 mt-1">Pending Balance</p>
      </div>

      {/* Stat 6: Pending Total */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-rose-600">{formatCurrency(stats.pendingPaymentsAmount)}</div>
        <p className="text-[11px] text-slate-500 mt-1">Unbilled / Due</p>
      </div>
    </div>
  );
};
