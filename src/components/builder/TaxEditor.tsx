import React from 'react';
import { TaxConfig, TaxType } from '../../types/document';
import { formatCurrency } from '../../utils/currency';

interface TaxEditorProps {
  tax: TaxConfig;
  onChangeTax: (tax: TaxConfig) => void;
  taxableSubtotal: number;
}

export const TaxEditor: React.FC<TaxEditorProps> = ({
  tax,
  onChangeTax,
  taxableSubtotal,
}) => {
  const handleTypeChange = (taxType: TaxType) => {
    recalculateTax(taxType, tax.gstRate, tax.roundOff);
  };

  const handleRateChange = (gstRate: number) => {
    recalculateTax(tax.taxType, gstRate, tax.roundOff);
  };

  const handleRoundOffChange = (roundOff: number) => {
    recalculateTax(tax.taxType, tax.gstRate, roundOff);
  };

  const recalculateTax = (taxType: TaxType, gstRate: number, roundOff: number) => {
    let cgstPercent = 0;
    let sgstPercent = 0;
    let igstPercent = 0;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === 'cgst_sgst') {
      cgstPercent = gstRate / 2;
      sgstPercent = gstRate / 2;
      cgstAmount = Math.round(taxableSubtotal * (cgstPercent / 100));
      sgstAmount = Math.round(taxableSubtotal * (sgstPercent / 100));
    } else if (taxType === 'igst') {
      igstPercent = gstRate;
      igstAmount = Math.round(taxableSubtotal * (igstPercent / 100));
    }

    const taxTotal = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = Math.round(taxableSubtotal + taxTotal + roundOff);

    onChangeTax({
      taxType,
      gstRate,
      cgstPercent,
      sgstPercent,
      igstPercent,
      roundOff,
      taxableValueTotal: taxableSubtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      taxTotal,
      grandTotal,
    });
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tax Mode Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-secondary mb-1">GST Tax Type</label>
          <select
            value={tax.taxType}
            onChange={e => handleTypeChange(e.target.value as TaxType)}
            className="w-full h-9 px-2.5 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
          >
            <option value="none">No Tax (0%)</option>
            <option value="cgst_sgst">CGST + SGST (Intra-State)</option>
            <option value="igst">IGST (Inter-State)</option>
          </select>
        </div>

        {/* GST Rate */}
        <div>
          <label className="block text-[11px] font-semibold text-secondary mb-1">GST Rate %</label>
          <select
            value={tax.gstRate}
            onChange={e => handleRateChange(parseFloat(e.target.value) || 0)}
            disabled={tax.taxType === 'none'}
            className="w-full h-9 px-2.5 border border-line rounded-sm bg-surface text-primary text-xs font-bold focus:border-brand disabled:opacity-50"
          >
            <option value={18}>18% GST (Standard)</option>
            <option value={12}>12% GST</option>
            <option value={5}>5% GST</option>
            <option value={28}>28% GST</option>
          </select>
        </div>

        {/* Round Off */}
        <div>
          <label className="block text-[11px] font-semibold text-secondary mb-1">Manual Round Off ₹</label>
          <input
            type="number"
            step="0.01"
            value={tax.roundOff}
            onChange={e => handleRoundOffChange(parseFloat(e.target.value) || 0)}
            className="w-full h-9 px-2.5 border border-line rounded-sm bg-surface text-primary text-xs font-medium focus:border-brand"
          />
        </div>
      </div>

      {/* Tax Calculation Summary Box */}
      <div className="bg-page border border-line rounded-md p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-[10px] text-secondary font-bold uppercase">Taxable Value</div>
          <div className="text-xs font-bold text-primary mt-0.5">{formatCurrency(taxableSubtotal)}</div>
        </div>

        <div>
          <div className="text-[10px] text-secondary font-bold uppercase">
            {tax.taxType === 'cgst_sgst'
              ? `CGST (${tax.cgstPercent}%) + SGST (${tax.sgstPercent}%)`
              : tax.taxType === 'igst'
              ? `IGST (${tax.igstPercent}%)`
              : 'Tax Amount'}
          </div>
          <div className="text-xs font-bold text-brand mt-0.5">{formatCurrency(tax.taxTotal)}</div>
        </div>

        <div>
          <div className="text-[10px] text-secondary font-bold uppercase">Round Off</div>
          <div className="text-xs font-medium text-secondary mt-0.5">{formatCurrency(tax.roundOff)}</div>
        </div>

        <div>
          <div className="text-[10px] text-secondary font-bold uppercase">Grand Total</div>
          <div className="text-sm font-bold text-primary mt-0.5">{formatCurrency(tax.grandTotal)}</div>
        </div>
      </div>
    </div>
  );
};

