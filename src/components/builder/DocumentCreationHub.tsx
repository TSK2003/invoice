import React from 'react';
import { DocumentType } from '../../types/document';
import { FileText, FileSpreadsheet, Receipt, ArrowRight, LayoutDashboard } from 'lucide-react';

interface CreationHubProps {
  onCreateType: (type: DocumentType) => void;
  onGoToDashboard: () => void;
}

export const DocumentCreationHub: React.FC<CreationHubProps> = ({
  onCreateType,
  onGoToDashboard,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-1.5">
        <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Create New Document
        </h1>
        <p className="text-xs text-secondary max-w-md mx-auto">
          Select a document type to start building with real-time A4 preview, automated tax computations, and instant PDF export.
        </p>
      </div>

      {/* 3 Document Cards Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quotation Card */}
        <div
          onClick={() => onCreateType('quotation')}
          className="bg-surface p-5 rounded-md border border-line hover:border-brand shadow-subtle transition-colors cursor-pointer flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-sm bg-brand-50 text-brand flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-primary group-hover:text-brand transition-colors">
                Quotation
              </h3>
              <p className="text-xs text-secondary mt-1 leading-relaxed">
                Commercial proposals with package scoping, included deliverables, custom add-ons, and payment milestones.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-line flex items-center justify-between text-xs font-semibold text-brand">
            <span>Create Quotation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Tax Invoice Card */}
        <div
          onClick={() => onCreateType('tax_invoice')}
          className="bg-surface p-5 rounded-md border border-line hover:border-brand shadow-subtle transition-colors cursor-pointer flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-sm bg-brand-50 text-brand flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-primary group-hover:text-brand transition-colors">
                Tax Invoice
              </h3>
              <p className="text-xs text-secondary mt-1 leading-relaxed">
                Official GST tax invoices with SAC/HSN codes, Taxable Value, CGST/SGST/IGST tax engine, and settlement terms.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-line flex items-center justify-between text-xs font-semibold text-brand">
            <span>Create Tax Invoice</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Payment Receipt Card */}
        <div
          onClick={() => onCreateType('payment_receipt')}
          className="bg-surface p-5 rounded-md border border-line hover:border-brand shadow-subtle transition-colors cursor-pointer flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-sm bg-brand-50 text-brand flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-primary group-hover:text-brand transition-colors">
                Payment Receipt
              </h3>
              <p className="text-xs text-secondary mt-1 leading-relaxed">
                Payment settlement acknowledgement receipts with transaction reference, mode (UPI, Bank), and balance tracking.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-line flex items-center justify-between text-xs font-semibold text-brand">
            <span>Create Receipt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Alternative Action: Dashboard link */}
      <div className="text-center pt-2">
        <button
          onClick={onGoToDashboard}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-page text-secondary hover:text-primary border border-line rounded-sm text-xs font-medium transition-colors shadow-subtle"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

