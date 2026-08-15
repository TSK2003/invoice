import React from 'react';
import { DocumentType } from '../../types/document';
import { FileText, FileSpreadsheet, Receipt } from 'lucide-react';

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
      icon: FileText,
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
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider">
        Document Type
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
              className={`p-2.5 rounded-md border text-left transition-colors flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-50 border-brand text-brand shadow-subtle'
                  : 'bg-surface border-line text-primary hover:border-slate-300 hover:bg-page'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isSelected ? 'text-brand' : 'text-primary'}`}>{opt.label}</span>
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand' : 'text-secondary'}`} />
              </div>
              <p className="text-[10px] text-secondary mt-1 line-clamp-2 leading-tight">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

