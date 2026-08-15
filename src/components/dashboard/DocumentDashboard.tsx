import React from 'react';
import { DocumentData, DocumentType } from '../../types/document';
import { DashboardStats } from '../../services/storage/IDocumentStorage';
import { StatsOverview } from './StatsOverview';
import { DocumentTable } from './DocumentTable';
import { Plus, FileCheck, FileSpreadsheet, Receipt } from 'lucide-react';

interface DashboardProps {
  documents: DocumentData[];
  stats: DashboardStats;
  onCreateNew: (type?: DocumentType) => void;
  onEdit: (doc: DocumentData) => void;
  onDuplicate: (id: string) => void;
  onDownloadPDF: (doc: DocumentData) => void;
  onDelete: (id: string) => void;
}

export const DocumentDashboard: React.FC<DashboardProps> = ({
  documents,
  stats,
  onCreateNew,
  onEdit,
  onDuplicate,
  onDownloadPDF,
  onDelete,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-navy via-navy-800 to-blue-brand text-white p-6 rounded-2xl shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">AESCION Document Studio</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-xl">
            Professional internal suite for creating, managing, and exporting A4 Quotations, Tax Invoices, and Payment Receipts.
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onCreateNew('quotation')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <FileCheck className="w-4 h-4 text-cyan-400" />
            + New Quotation
          </button>

          <button
            onClick={() => onCreateNew('tax_invoice')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
            + New Tax Invoice
          </button>

          <button
            onClick={() => onCreateNew('payment_receipt')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            + New Receipt
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsOverview stats={stats} />

      {/* Recent Documents Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-navy uppercase tracking-wider">
            Recent Documents
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {documents.length} total records
          </span>
        </div>

        <DocumentTable
          documents={documents}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDownloadPDF={onDownloadPDF}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};
