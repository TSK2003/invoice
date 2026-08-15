import React from 'react';
import { DocumentData, DocumentType } from '../../types/document';
import { DashboardStats } from '../../services/storage/IDocumentStorage';
import { StatsOverview } from './StatsOverview';
import { DocumentTable } from './DocumentTable';
import { Plus, FileText, FileSpreadsheet, Receipt } from 'lucide-react';

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
      <div className="bg-surface p-5 rounded-md border border-line shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-primary tracking-tight">AESCION Document Studio</h1>
          <p className="text-secondary text-xs mt-0.5">
            Enterprise quotation, tax invoice, and payment receipt management system.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onCreateNew('quotation')}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-600 text-white px-3 py-1.5 rounded-sm text-xs font-semibold shadow-subtle transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            + New Quotation
          </button>

          <button
            onClick={() => onCreateNew('tax_invoice')}
            className="flex items-center gap-1.5 bg-surface hover:bg-page text-primary border border-line px-3 py-1.5 rounded-sm text-xs font-medium transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-secondary" />
            + New Tax Invoice
          </button>

          <button
            onClick={() => onCreateNew('payment_receipt')}
            className="flex items-center gap-1.5 bg-surface hover:bg-page text-primary border border-line px-3 py-1.5 rounded-sm text-xs font-medium transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-secondary" />
            + New Receipt
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsOverview stats={stats} />

      {/* Recent Documents Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
            Recent Documents
          </h2>
          <span className="text-xs text-secondary font-medium">
            {documents.length} total records
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

