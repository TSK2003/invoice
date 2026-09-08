import React from 'react';
import { TaxConfig, TaxType, DocumentItem } from '../../types/document';
import { formatCurrency } from '../../utils/currency';
import { calculateDocumentTax } from '../../services/tax/taxEngine';
import { VALID_GST_RATES } from '../../constants/gstRates';

interface TaxEditorProps {
  tax: TaxConfig;
  items: DocumentItem[];
  onChangeTax: (tax: TaxConfig) => void;
  taxableSubtotal?: number;
}

export const TaxEditor: React.FC<TaxEditorProps> = ({
  tax,
  items,
  onChangeTax,
}) => {
  const handleTypeChange = (taxType: TaxType) => {
    const result = calculateDocumentTax(items, taxType, tax.gstRate, tax.roundOff, false);
    onChangeTax(result.tax);
  };

  const handleRateChange = (gstRate: number) => {
    const result = calculateDocumentTax(items, tax.taxType, gstRate, tax.roundOff, false);
    onChangeTax(result.tax);
  };

  const handleRoundOffChange = (roundOff: number) => {
    const result = calculateDocumentTax(items, tax.taxType, tax.gstRate, roundOff, false);
    onChangeTax(result.tax);
  };

  const handleAutoRoundOffToggle = () => {
    const result = calculateDocumentTax(items, tax.taxType, tax.gstRate, 0, true);
    onChangeTax(result.tax);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tax Mode Selection */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            GST Supply Type *
          </label>
          <select
            value={tax.taxType}
            onChange={(e) => handleTypeChange(e.target.value as TaxType)}
            className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
          >
            <option value="none">No Tax (Exempt / Nil)</option>
            <option value="cgst_sgst">Intra-State: CGST + SGST</option>
            <option value="igst">Inter-State: Integrated GST (IGST)</option>
          </select>
        </div>

        {/* Global GST Rate fallback */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Default GST Rate %
          </label>
          <select
            value={tax.gstRate}
            onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
            disabled={tax.taxType === 'none'}
            className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:border-brand disabled:opacity-50"
          >
            {VALID_GST_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}% GST
              </option>
            ))}
          </select>
        </div>

        {/* Round Off */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Round Off (₹)
            </label>
            <button
              type="button"
              onClick={handleAutoRoundOffToggle}
              className="text-[11px] text-brand hover:underline font-semibold"
            >
              Auto Round
            </button>
          </div>
          <input
            type="number"
            step="0.01"
            value={tax.roundOff}
            onChange={(e) => handleRoundOffChange(parseFloat(e.target.value) || 0)}
            className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:border-brand"
          />
        </div>
      </div>

      {/* Tax Calculation Summary Box */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shadow-xs">
        <div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
            Taxable Value
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">
            {formatCurrency(tax.taxableValueTotal)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
            {tax.taxType === 'cgst_sgst'
              ? 'CGST + SGST'
              : tax.taxType === 'igst'
              ? 'IGST'
              : 'Tax Amount'}
          </div>
          <div className="text-sm font-bold text-brand mt-1 font-mono">
            {formatCurrency(tax.taxTotal)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
            Round Off
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 font-mono">
            {formatCurrency(tax.roundOff)}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
            Grand Total
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(tax.grandTotal)}
          </div>
        </div>
      </div>
    </div>
  );
};
