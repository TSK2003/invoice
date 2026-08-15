import React from 'react';
import { DashboardStats } from '../../services/storage/IDocumentStorage';
import { formatCurrency } from '../../utils/currency';
import { FileText, FileSpreadsheet, Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface StatsProps {
  stats: DashboardStats;
}

export const StatsOverview: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Stat 1: Total Quotations */}
      <div className="bg-surface p-3.5 rounded-md border border-line shadow-subtle">
        <div className="flex items-center justify-between text-secondary mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Quotations</span>
          <FileText className="w-4 h-4 text-secondary" />
        </div>
        <div className="text-xl font-bold text-primary">{stats.totalQuotations}</div>
        <p className="text-[10px] text-muted mt-0.5">Created</p>
      </div>

      {/* Stat 2: Total Invoices */}
      <div className="bg-surface p-3.5 rounded-md border border-line shadow-subtle">
        <div className="flex items-center justify-between text-secondary mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Invoices</span>
          <FileSpreadsheet className="w-4 h-4 text-secondary" />
        </div>
        <div className="text-xl font-bold text-primary">{stats.totalInvoices}</div>
        <p className="text-[10px] text-muted mt-0.5">Issued</p>
      </div>

      {/* Stat 3: Total Receipts */}
      <div className="bg-surface p-3.5 rounded-md border border-line shadow-subtle">
        <div className="flex items-center justify-between text-secondary mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Receipts</span>
          <Receipt className="w-4 h-4 text-secondary" />
        </div>
        <div className="text-xl font-bold text-primary">{stats.totalReceipts}</div>
        <p className="text-[10px] text-muted mt-0.5">Issued</p>
      </div>

      {/* Stat 4: Paid Amount */}
      <div className="bg-surface p-3.5 rounded-md border border-line shadow-subtle">
        <div className="flex items-center justify-between text-secondary mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Paid Total</span>
          <CheckCircle className="w-4 h-4 text-brand" />
        </div>
        <div className="text-lg font-bold text-brand">{formatCurrency(stats.paidAmount)}</div>
        <p className="text-[10px] text-muted mt-0.5">Settled</p>
      </div>

      {/* Stat 5: Outstanding */}
      <div className="bg-surface p-3.5 rounded-md border border-line shadow-subtle">
        <div className="flex items-center justify-between text-secondary mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Outstanding</span>
          <Clock className="w-4 h-4 text-secondary" />
        </div>
        <div className="text-lg font-bold text-primary">{formatCurrency(stats.outstandingAmount)}</div>
        <p className="text-[10px] text-muted mt-0.5">Pending balance</p>
      </div>

      {/* Stat 6: Pending Total */}
      <div className="bg-surface p-3.5 rounded-md border border-line shadow-subtle">
        <div className="flex items-center justify-between text-secondary mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider">Unbilled / Due</span>
          <AlertCircle className="w-4 h-4 text-secondary" />
        </div>
        <div className="text-lg font-bold text-primary">{formatCurrency(stats.pendingPaymentsAmount)}</div>
        <p className="text-[10px] text-muted mt-0.5">Pipeline</p>
      </div>
    </div>
  );
};

