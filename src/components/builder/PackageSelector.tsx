import React, { useState } from 'react';
import { AESCION_PACKAGES } from '../../constants/packages';
import { ServicePackage } from '../../types/package';
import { formatCurrency } from '../../utils/currency';
import { Check, Plus } from 'lucide-react';

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
    <div className="space-y-3.5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider">
            Pre-configured Packages
          </label>
          <span className="text-[10px] text-secondary font-medium">
            Includes standard deliverables
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {AESCION_PACKAGES.map(pkg => {
            const isSelected = selectedPackageId === pkg.id;

            return (
              <div
                key={pkg.id}
                onClick={() => onSelectPackage(pkg)}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-50 border-brand shadow-subtle'
                    : 'bg-surface border-line hover:border-slate-300 hover:bg-page'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`font-bold text-xs leading-tight ${isSelected ? 'text-brand' : 'text-primary'}`}>{pkg.name}</span>
                    <span className="block text-[10px] text-secondary font-medium">{pkg.maxPagesText}</span>
                  </div>
                  <span className="font-bold text-xs text-brand bg-surface px-2 py-0.5 rounded-xs border border-brand-200 whitespace-nowrap">
                    {formatCurrency(pkg.basePrice)}
                  </span>
                </div>
                <p className="text-[11px] text-secondary mt-1.5 line-clamp-2 leading-tight">
                  {pkg.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Package Inclusions Preview Banner */}
      <div className="bg-page border border-line rounded-md p-2.5">
        <div className="text-[11px] font-semibold text-primary mb-1">
          Standard Package Deliverables (Included):
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-secondary">
          {AESCION_PACKAGES[0].includedServices.map((inc, i) => (
            <div key={i} className="flex items-center gap-1">
              <Check className="w-3 h-3 text-brand flex-shrink-0" />
              <span className="truncate">{inc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Customize & Add-ons */}
      <div className="border-t border-line pt-3">
        <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">
          Scope Customization & Add-ons
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Quick Add Extra Pages */}
          <div className="bg-surface p-2.5 rounded-md border border-line flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-primary">Additional Pages</div>
              <div className="text-[10px] text-secondary">₹1,500 per page</div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="50"
                value={extraPagesQty}
                onChange={e => setExtraPagesQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-10 h-7 px-1 text-xs border border-line rounded-sm bg-surface text-center font-bold text-primary focus:border-brand"
              />
              <button
                type="button"
                onClick={handleAddExtraPages}
                className="bg-brand hover:bg-brand-600 text-white h-7 px-2.5 rounded-sm text-xs font-semibold transition-colors flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {/* Quick Add Custom Module/Feature */}
          <div className="bg-surface p-2.5 rounded-md border border-line space-y-1.5">
            <div className="text-xs font-semibold text-primary">Add Custom Feature / Integration</div>
            <input
              type="text"
              placeholder="Feature description (e.g. Payment Gateway)"
              value={customAddonName}
              onChange={e => setCustomAddonName(e.target.value)}
              className="w-full h-7 px-2 text-xs border border-line rounded-sm bg-surface text-primary focus:border-brand"
            />
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Price ₹"
                value={customAddonPrice}
                onChange={e => setCustomAddonPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 h-7 px-2 text-xs border border-line rounded-sm bg-surface text-primary font-semibold focus:border-brand"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="bg-brand hover:bg-brand-600 text-white h-7 px-2.5 rounded-sm text-xs font-semibold transition-colors flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

