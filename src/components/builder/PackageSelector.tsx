import React, { useState } from 'react';
import { AESCION_PACKAGES } from '../../constants/packages';
import { ServicePackage } from '../../types/package';
import { formatCurrency } from '../../utils/currency';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface PackageSelectorProps {
  selectedPackageId?: string;
  onSelectPackage: (pkg: ServicePackage) => void;
  onAddCustomAddon: (description: string, price: number) => void;
}

export const PackageSelector: React.FC<PackageSelectorProps> = ({
  selectedPackageId,
  onSelectPackage,
  onAddCustomAddon,
}) => {
  const [customAddonName, setCustomAddonName] = useState('');
  const [customAddonPrice, setCustomAddonPrice] = useState<number | ''>('');
  const [extraPagesQty, setExtraPagesQty] = useState<number>(1);

  const handleAddExtraPages = () => {
    if (extraPagesQty <= 0) return;
    const price = extraPagesQty * 1500;
    onAddCustomAddon(`Additional ${extraPagesQty} Web Page(s) (₹1,500/page)`, price);
    setExtraPagesQty(1);
  };

  const handleAddCustomFeature = () => {
    if (!customAddonName.trim() || !customAddonPrice || Number(customAddonPrice) <= 0) return;
    onAddCustomAddon(customAddonName.trim(), Number(customAddonPrice));
    setCustomAddonName('');
    setCustomAddonPrice('');
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Pre-configured Package
          </label>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
            Auto-adds 5 Standard Inclusions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AESCION_PACKAGES.map(pkg => {
            const isSelected = selectedPackageId === pkg.id;

            return (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-brand ring-2 ring-blue-brand/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-extrabold text-xs text-navy leading-tight">{pkg.name}</span>
                    <span className="block text-[10px] text-slate-500 font-medium">{pkg.maxPagesText}</span>
                  </div>
                  <span className="font-black text-xs text-blue-brand bg-white px-2 py-1 rounded border border-blue-200 shadow-2xs whitespace-nowrap">
                    {formatCurrency(pkg.basePrice)}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-600 mt-2 line-clamp-2 leading-tight">
                  {pkg.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Package Inclusions Preview Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Standard Package Inclusions (Auto-added as Included)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-600">
          {AESCION_PACKAGES[0].includedServices.map((inc, i) => (
            <div key={i} className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
              <span className="truncate">{inc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customize & Add-ons */}
      <div className="border-t border-slate-200 pt-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Customize & Add Additional Requirements
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Quick Add Extra Pages */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-800">Additional Pages</div>
              <div className="text-[10px] text-slate-500">₹1,500 per page</div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="50"
                value={extraPagesQty}
                onChange={e => setExtraPagesQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-10 px-1 py-1 text-xs border border-slate-200 rounded text-center font-bold"
              />
              <button
                type="button"
                onClick={handleAddExtraPages}
                className="bg-blue-brand hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-bold transition-colors whitespace-nowrap"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Quick Add Custom Module/Feature */}
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
            <div className="text-xs font-bold text-slate-800">Add Custom Feature / Integration</div>
            <input
              type="text"
              placeholder="Feature description (e.g. Payment Gateway)"
              value={customAddonName}
              onChange={e => setCustomAddonName(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
            />
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Price ₹"
                value={customAddonPrice}
                onChange={e => setCustomAddonPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded font-semibold"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors whitespace-nowrap"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
