import React from 'react';
import { DocumentType } from '../../types/document';
import { FileText, Receipt, CreditCard, Sparkles, ArrowRight, LayoutDashboard } from 'lucide-react';

interface CreationHubProps {
  onCreateType: (type: DocumentType) => void;
  onGoToDashboard: () => void;
}

export const DocumentCreationHub: React.FC<CreationHubProps> = ({
  onCreateType,
  onGoToDashboard,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-brand border border-blue-200 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Select Document Type
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
          Choose a Document to Create
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Select the document type you want to build. All templates include instant A4 live preview, auto-calculations, and PDF export.
        </p>
      </div>

      {/* 3 Document Cards Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quotation Card */}
        <div
          onClick={() => onCreateType('quotation')}
          className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-brand hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-brand flex items-center justify-center group-hover:bg-blue-brand group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-navy group-hover:text-blue-brand transition-colors">
                Quotation
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Commercial project proposal with package pricing, standard inclusions, custom add-ons, and payment milestone splits.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-blue-brand group-hover:translate-x-1 transition-transform">
            <span>Start Quotation</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Tax Invoice Card */}
        <div
          onClick={() => onCreateType('tax_invoice')}
          className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-600 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <Receipt className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-navy group-hover:text-purple-700 transition-colors">
                Tax Invoice
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Official GST accounting invoice with SAC/HSN codes, Taxable Value, CGST/SGST/IGST breakdown, and bank details.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-purple-700 group-hover:translate-x-1 transition-transform">
            <span>Start Tax Invoice</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Payment Receipt Card */}
        <div
          onClick={() => onCreateType('payment_receipt')}
          className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-navy group-hover:text-emerald-700 transition-colors">
                Payment Receipt
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Payment bill/receipt with transaction ID, payment mode (UPI, Bank), invoice reference, amount received, and status.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-emerald-700 group-hover:translate-x-1 transition-transform">
            <span>Start Payment Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Alternative Action: Dashboard link */}
      <div className="text-center pt-4">
        <button
          onClick={onGoToDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200/70 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          View Recent Saved Documents in Dashboard
        </button>
      </div>
    </div>
  );
};
