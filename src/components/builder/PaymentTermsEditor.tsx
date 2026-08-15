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
        <label className="block text-[11px] font-semibold text-secondary mb-1">Payment Milestone Split</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handlePresetChange('50_50')}
            className={`p-2 rounded-sm border text-center font-medium text-xs transition-colors ${
              terms.preset === '50_50'
                ? 'bg-brand text-white border-brand shadow-subtle font-semibold'
                : 'bg-surface text-primary border-line hover:bg-page'
            }`}
          >
            50% / 50% Split
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange('40_60')}
            className={`p-2 rounded-sm border text-center font-medium text-xs transition-colors ${
              terms.preset === '40_60'
                ? 'bg-brand text-white border-brand shadow-subtle font-semibold'
                : 'bg-surface text-primary border-line hover:bg-page'
            }`}
          >
            40% / 60% Split
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange('100_advance')}
            className={`p-2 rounded-sm border text-center font-medium text-xs transition-colors ${
              terms.preset === '100_advance'
                ? 'bg-brand text-white border-brand shadow-subtle font-semibold'
                : 'bg-surface text-primary border-line hover:bg-page'
            }`}
          >
            100% Advance
          </button>

          <button
            type="button"
            onClick={() => handlePresetChange('custom')}
            className={`p-2 rounded-sm border text-center font-medium text-xs transition-colors ${
              terms.preset === 'custom'
                ? 'bg-brand text-white border-brand shadow-subtle font-semibold'
                : 'bg-surface text-primary border-line hover:bg-page'
            }`}
          >
            Custom Split
          </button>
        </div>
      </div>

      {/* Calculated Breakdown Cards */}
      <div className="grid grid-cols-2 gap-2.5 bg-page border border-line p-2.5 rounded-md">
        <div className="bg-surface p-2.5 rounded-sm border border-line">
          <div className="flex items-center justify-between text-secondary font-medium mb-1">
            <span>Advance ({terms.advancePercentage}%)</span>
            {terms.preset === 'custom' && (
              <input
                type="number"
                min="0"
                max="100"
                value={terms.advancePercentage}
                onChange={e => handleCustomAdvanceChange(parseFloat(e.target.value) || 0)}
                className="w-12 h-6 px-1 border border-line rounded-sm text-center text-xs font-bold text-primary focus:border-brand"
              />
            )}
          </div>
          <div className="text-sm font-bold text-brand">
            {formatCurrency(Math.round(grandTotal * (terms.advancePercentage / 100)))}
          </div>
        </div>

        <div className="bg-surface p-2.5 rounded-sm border border-line">
          <div className="text-secondary font-medium mb-1">
            Balance ({terms.balancePercentage}%)
          </div>
          <div className="text-sm font-bold text-primary">
            {formatCurrency(grandTotal - Math.round(grandTotal * (terms.advancePercentage / 100)))}
          </div>
        </div>
      </div>

      {/* Delivery Timeline text */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary mb-1">Delivery / Project Timeline</label>
        <input
          type="text"
          placeholder="e.g. 10-14 working days from advance payment"
          value={terms.deliveryTimelineText}
          onChange={e => onChangeTerms({ ...terms, deliveryTimelineText: e.target.value })}
          className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
        />
      </div>
    </div>
  );
};

