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
          <label className="block font-bold text-slate-700 mb-1">GST Tax Type</label>
          <select
            value={tax.taxType}
            onChange={e => handleTypeChange(e.target.value as TaxType)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          >
            <option value="none">No Tax (0%)</option>
            <option value="cgst_sgst">CGST + SGST (Intra-State)</option>
            <option value="igst">IGST (Inter-State)</option>
          </select>
        </div>

        {/* GST Rate */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">GST Rate %</label>
          <select
            value={tax.gstRate}
            onChange={e => handleRateChange(parseFloat(e.target.value) || 0)}
            disabled={tax.taxType === 'none'}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-brand/30 disabled:opacity-50"
          >
            <option value={18}>18% GST (Standard)</option>
            <option value={12}>12% GST</option>
            <option value={5}>5% GST</option>
            <option value={28}>28% GST</option>
          </select>
        </div>

        {/* Round Off */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Manual Round Off ₹</label>
          <input
            type="number"
            step="0.01"
            value={tax.roundOff}
            onChange={e => handleRoundOffChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          />
        </div>
      </div>

      {/* Tax Calculation Summary Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">Taxable Value</div>
          <div className="text-sm font-extrabold text-slate-900">{formatCurrency(taxableSubtotal)}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">
            {tax.taxType === 'cgst_sgst'
              ? `CGST (${tax.cgstPercent}%) + SGST (${tax.sgstPercent}%)`
              : tax.taxType === 'igst'
              ? `IGST (${tax.igstPercent}%)`
              : 'Tax Amount'}
          </div>
          <div className="text-sm font-extrabold text-blue-brand">{formatCurrency(tax.taxTotal)}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">Round Off</div>
          <div className="text-sm font-bold text-slate-700">{formatCurrency(tax.roundOff)}</div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">Grand Total</div>
          <div className="text-base font-black text-navy">{formatCurrency(tax.grandTotal)}</div>
        </div>
      </div>
    </div>
  );
};
