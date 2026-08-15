import React from 'react';
import { PaymentTermsConfig, PaymentTermsPreset } from '../../types/document';
import { formatCurrency } from '../../utils/currency';

interface PaymentTermsEditorProps {
  terms: PaymentTermsConfig;
  onChangeTerms: (terms: PaymentTermsConfig) => void;
  grandTotal: number;
}

export const PaymentTermsEditor: React.FC<PaymentTermsEditorProps> = ({
  terms,
  onChangeTerms,
  grandTotal,
}) => {
  const handlePresetChange = (preset: PaymentTermsPreset) => {
    let advancePct = 50;
    let balancePct = 50;

    if (preset === '40_60') {
      advancePct = 40;
      balancePct = 60;
    } else if (preset === '100_advance') {
      advancePct = 100;
      balancePct = 0;
    } else if (preset === '50_50') {
      advancePct = 50;
      balancePct = 50;
    }

    const advanceAmt = Math.round(grandTotal * (advancePct / 100));
    const balanceAmt = grandTotal - advanceAmt;

    onChangeTerms({
      ...terms,
      preset,
      advancePercentage: advancePct,
      balancePercentage: balancePct,
      advanceAmount: advanceAmt,
      balanceAmount: balanceAmt,
      customTermsText:
        preset === '50_50'
          ? '50% advance upon quotation approval, balance 50% before final deployment.'
          : preset === '40_60'
          ? '40% advance payment, balance 60% upon project handover.'
          : '100% advance payment.',
    });
  };

  const handleCustomAdvanceChange = (advancePct: number) => {
    const clampedAdv = Math.max(0, Math.min(100, advancePct));
    const balancePct = 100 - clampedAdv;
    const advanceAmt = Math.round(grandTotal * (clampedAdv / 100));
    const balanceAmt = grandTotal - advanceAmt;

    onChangeTerms({
      ...terms,
      preset: 'custom',
      advancePercentage: clampedAdv,
      balancePercentage: balancePct,
      advanceAmount: advanceAmt,
      balanceAmount: balanceAmt,
    });
  };

  return (
    <div className="space-y-3 text-xs">
      <div>
        <label className="block font-bold text-slate-700 mb-1">Payment Terms Milestone</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handlePresetChange('50_50')}
            className={`p-2 rounded-lg border text-center font-bold transition-all ${
              terms.preset === '50_50'
                ? 'bg-blue-brand text-white border-blue-brand shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            50% Advance / 50% Balance
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange('40_60')}
            className={`p-2 rounded-lg border text-center font-bold transition-all ${
              terms.preset === '40_60'
                ? 'bg-blue-brand text-white border-blue-brand shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            40% Advance / 60% Balance
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange('100_advance')}
            className={`p-2 rounded-lg border text-center font-bold transition-all ${
              terms.preset === '100_advance'
                ? 'bg-blue-brand text-white border-blue-brand shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            100% Advance
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange('custom')}
            className={`p-2 rounded-lg border text-center font-bold transition-all ${
              terms.preset === 'custom'
                ? 'bg-blue-brand text-white border-blue-brand shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Custom Split
          </button>
        </div>
      </div>

      {/* Calculated Breakdown Cards */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 font-bold mb-1">
            <span>Advance Amount ({terms.advancePercentage}%)</span>
            {terms.preset === 'custom' && (
              <input
                type="number"
                min="0"
                max="100"
                value={terms.advancePercentage}
                onChange={e => handleCustomAdvanceChange(parseFloat(e.target.value) || 0)}
                className="w-12 px-1 border border-slate-200 rounded text-center"
              />
            )}
          </div>
          <div className="text-base font-black text-blue-brand">
            {formatCurrency(Math.round(grandTotal * (terms.advancePercentage / 100)))}
          </div>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
          <div className="text-slate-500 font-bold mb-1">
            Balance Due ({terms.balancePercentage}%)
          </div>
          <div className="text-base font-black text-navy">
            {formatCurrency(grandTotal - Math.round(grandTotal * (terms.advancePercentage / 100)))}
          </div>
        </div>
      </div>

      {/* Delivery Timeline text */}
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Delivery / Project Timeline</label>
        <input
          type="text"
          placeholder="e.g. 7-10 working days from advance payment"
          value={terms.deliveryTimelineText}
          onChange={e => onChangeTerms({ ...terms, deliveryTimelineText: e.target.value })}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
        />
      </div>
    </div>
  );
};
