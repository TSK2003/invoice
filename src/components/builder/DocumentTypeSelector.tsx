import React from 'react';
import { DocumentType } from '../../types/document';
import { FileCheck, FileSpreadsheet, Receipt } from 'lucide-react';

interface SelectorProps {
  selectedType: DocumentType;
  onChange: (type: DocumentType) => void;
}

export const DocumentTypeSelector: React.FC<SelectorProps> = ({
  selectedType,
  onChange,
}) => {
  const options: { type: DocumentType; label: string; desc: string; icon: any }[] = [
    {
      type: 'quotation',
      label: 'Quotation',
      desc: 'Project scope, package pricing, included services & terms.',
      icon: FileCheck,
    },
    {
      type: 'tax_invoice',
      label: 'Tax Invoice',
      desc: 'Billing address, GSTIN, SAC/HSN, CGST/SGST/IGST & totals.',
      icon: FileSpreadsheet,
    },
    {
      type: 'payment_receipt',
      label: 'Payment Receipt',
      desc: 'Received from, invoice reference, payment mode & balance.',
      icon: Receipt,
    },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        Select Document Type
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map(opt => {
          const Icon = opt.icon;
          const isSelected = selectedType === opt.type;

          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onChange(opt.type)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50 border-blue-brand text-blue-brand ring-2 ring-blue-brand/20 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{opt.label}</span>
                <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-brand' : 'text-slate-400'}`} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
