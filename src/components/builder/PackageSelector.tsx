import React, { useState, useEffect } from 'react';
import { AESCION_PACKAGES, STANDARD_PACKAGE_INCLUSIONS } from '../../constants/packages';
import { ServicePackage } from '../../types/package';
import { formatCurrency } from '../../utils/currency';
import { Check, Plus, Edit2, RotateCcw, X, CheckCircle2, Sparkles } from 'lucide-react';

const PACKAGES_STORAGE_KEY = 'aescion_packages_catalog_v2';

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
  // Load editable packages list
  const [packages, setPackages] = useState<ServicePackage[]>(() => {
    try {
      const saved = localStorage.getItem(PACKAGES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as ServicePackage[];
      }
    } catch (e) {
      console.error('Failed to load custom packages from localStorage', e);
    }
    return AESCION_PACKAGES;
  });

  // Save custom packages whenever updated
  const updatePackagesState = (updatedList: ServicePackage[]) => {
    setPackages(updatedList);
    try {
      localStorage.setItem(PACKAGES_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to persist custom packages', e);
    }
  };

  // State for Editing an existing package
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

  // State for Creating a brand new Custom Package
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customPkgName, setCustomPkgName] = useState('');
  const [customPkgPrice, setCustomPkgPrice] = useState<number | ''>('');
  const [customPkgScope, setCustomPkgScope] = useState('');
  const [customPkgDesc, setCustomPkgDesc] = useState('');
  const [customPkgInclusions, setCustomPkgInclusions] = useState<string>(STANDARD_PACKAGE_INCLUSIONS.join(', '));

  // Add-ons State
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

  // Save edited package
  const handleSaveEditedPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    const updatedList = packages.map(p => p.id === editingPackage.id ? editingPackage : p);
    updatePackagesState(updatedList);

    // If currently selected, re-apply changes
    if (selectedPackageId === editingPackage.id) {
      onSelectPackage(editingPackage);
    }
    setEditingPackage(null);
  };

  // Save new custom package
  const handleSaveNewCustomPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPkgName.trim() || !customPkgPrice) return;

    const inclusionsArray = customPkgInclusions
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newPkg: ServicePackage = {
      id: `custom-pkg-${Date.now()}`,
      name: customPkgName.trim(),
      basePrice: Number(customPkgPrice),
      maxPagesText: customPkgScope.trim() || 'Custom scope',
      description: customPkgDesc.trim() || 'Tailored software architecture and bespoke implementation.',
      includedServices: inclusionsArray.length > 0 ? inclusionsArray : STANDARD_PACKAGE_INCLUSIONS,
    };

    const updatedList = [...packages, newPkg];
    updatePackagesState(updatedList);
    onSelectPackage(newPkg);

    // Reset Form
    setCustomPkgName('');
    setCustomPkgPrice('');
    setCustomPkgScope('');
    setCustomPkgDesc('');
    setIsCreatingCustom(false);
  };

  // Reset to original default packages
  const handleResetPackages = () => {
    if (window.confirm('Reset all packages back to standard AESCION presets?')) {
      updatePackagesState(AESCION_PACKAGES);
      localStorage.removeItem(PACKAGES_STORAGE_KEY);
    }
  };

  // Find currently selected package for inclusions display
  const currentSelectedPkg = packages.find(p => p.id === selectedPackageId) || packages[1] || AESCION_PACKAGES[1];

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div>
          <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider">
            Scope & Service Packages
          </label>
          <span className="text-[10px] text-secondary font-medium">
            Click any package to select, or edit parameters directly
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsCreatingCustom(true)}
            className="flex items-center gap-1 bg-brand text-white hover:bg-brand-600 px-2.5 py-1 rounded-xs text-[11px] font-semibold transition-colors shadow-subtle"
          >
            <Plus className="w-3 h-3" />
            <span>Custom Package</span>
          </button>

          <button
            type="button"
            onClick={handleResetPackages}
            title="Reset to default packages"
            className="flex items-center gap-1 text-secondary hover:text-primary px-2 py-1 rounded-xs border border-line text-[11px] font-medium transition-colors bg-surface"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {packages.map(pkg => {
          const isSelected = selectedPackageId === pkg.id;

          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(pkg)}
              className={`relative p-3.5 rounded-md border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-brand/5 border-brand ring-1 ring-brand shadow-subtle'
                  : 'bg-surface border-line hover:border-slate-300 hover:bg-page'
              }`}
            >
              {/* Top Row: Title, Scope, Price & Edit Button */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-xs leading-tight truncate ${isSelected ? 'text-brand' : 'text-primary'}`}>
                      {pkg.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand shrink-0" />
                    )}
                  </div>
                  <span className="block text-[10.5px] text-secondary font-medium mt-0.5">
                    {pkg.maxPagesText}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-xs text-brand bg-surface px-2 py-0.5 rounded-xs border border-brand/20 whitespace-nowrap">
                    {formatCurrency(pkg.basePrice)}
                  </span>
                  <button
                    type="button"
                    title="Edit this package"
                    onClick={e => {
                      e.stopPropagation();
                      setEditingPackage({ ...pkg });
                    }}
                    className="p-1 rounded-xs text-secondary hover:text-brand hover:bg-page border border-line bg-surface transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-secondary mt-2 line-clamp-2 leading-relaxed">
                {pkg.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Package Inclusions Preview Banner */}
      <div className="bg-page border border-line rounded-md p-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-primary mb-1.5">
          <span>Standard Package Deliverables for <b className="text-brand">{currentSelectedPkg.name}</b>:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-[11px] text-secondary">
          {currentSelectedPkg.includedServices.map((inc, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-brand shrink-0" />
              <span className="truncate">{inc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scope Customization & Add-ons */}
      <div className="border-t border-line pt-3">
        <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">
          Scope Customization & Add-ons
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Quick Add Extra Pages */}
          <div className="bg-surface p-3 rounded-md border border-line flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-primary">Additional Pages</div>
              <div className="text-[11px] text-secondary">₹1,500 per page</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min="1"
                max="50"
                value={extraPagesQty}
                onChange={e => setExtraPagesQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 h-8 px-1.5 text-xs border border-line rounded-sm bg-surface text-center font-bold text-primary focus:border-brand"
              />
              <button
                type="button"
                onClick={handleAddExtraPages}
                className="bg-brand hover:bg-brand-600 text-white h-8 px-3 rounded-sm text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Quick Add Custom Module/Feature */}
          <div className="bg-surface p-3 rounded-md border border-line space-y-2">
            <div className="text-xs font-semibold text-primary">Add Custom Feature / Integration</div>
            <input
              type="text"
              placeholder="Feature description (e.g. Payment Gateway)"
              value={customAddonName}
              onChange={e => setCustomAddonName(e.target.value)}
              className="w-full h-8 px-2.5 text-xs border border-line rounded-sm bg-surface text-primary focus:border-brand"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Price (₹)"
                value={customAddonPrice}
                onChange={e => setCustomAddonPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="flex-1 min-w-0 h-8 px-2.5 text-xs border border-line rounded-sm bg-surface text-primary font-semibold focus:border-brand"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="bg-brand hover:bg-brand-600 text-white h-8 px-3.5 rounded-sm text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 shadow-subtle"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: EDIT EXISTING PACKAGE */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-lg shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-brand" />
                Edit Package: {editingPackage.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPackage(null)}
                className="p-1 text-secondary hover:text-primary rounded-xs hover:bg-page"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedPackage} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={editingPackage.name}
                    onChange={e => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    className="w-full h-8 px-2.5 border border-line rounded-sm bg-surface text-primary focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingPackage.basePrice}
                    onChange={e => setEditingPackage({ ...editingPackage, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full h-8 px-2.5 border border-line rounded-sm bg-surface text-primary font-bold focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Scope / Pages Subtitle</label>
                <input
                  type="text"
                  value={editingPackage.maxPagesText}
                  onChange={e => setEditingPackage({ ...editingPackage, maxPagesText: e.target.value })}
                  placeholder="e.g. Up to 12 pages + admin"
                  className="w-full h-8 px-2.5 border border-line rounded-sm bg-surface text-primary focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPackage.description}
                  onChange={e => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  className="w-full p-2 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Included Deliverables (comma separated)</label>
                <input
                  type="text"
                  value={editingPackage.includedServices.join(', ')}
                  onChange={e => setEditingPackage({
                    ...editingPackage,
                    includedServices: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })}
                  className="w-full h-8 px-2.5 border border-line rounded-sm bg-surface text-primary focus:border-brand"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingPackage(null)}
                  className="px-3 py-1.5 rounded-sm border border-line text-secondary hover:text-primary text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-sm bg-brand text-white hover:bg-brand-600 text-xs font-semibold shadow-subtle"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE CUSTOM PACKAGE */}
      {isCreatingCustom && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-lg shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand" />
                Create Custom Solution / Package
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="p-1 text-secondary hover:text-primary rounded-xs hover:bg-page"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomPackage} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">Custom Package Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mobile App MVP / SaaS"
                    value={customPkgName}
                    onChange={e => setCustomPkgName(e.target.value)}
                    className="w-full h-8 px-2.5 border border-line rounded-sm bg-surface text-primary focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 50000"
                    value={customPkgPrice}
                    onChange={e => setCustomPkgPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-8 px-2.5 border border-line rounded-sm bg-surface text-primary font-bold focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Scope / Screens Summary</label>
                <input
                  type="text"
                  placeholder="e.g. 15 custom screens + API integration"
                  value={customPkgScope}
                  onChange={e => setCustomPkgScope(e.target.value)}
                  className="w-full h-8 px-2.5 border border-line rounded-sm bg-surface text-primary focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  placeholder="Custom architectural deliverables, database design, and cloud deployment."
                  value={customPkgDesc}
                  onChange={e => setCustomPkgDesc(e.target.value)}
                  className="w-full p-2 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Included Deliverables (comma separated)</label>
                <input
                  type="text"
                  placeholder="Domain, Hosting, SSL, 3 Months Support, Source Code"
                  value={customPkgInclusions}
                  onChange={e => setCustomPkgInclusions(e.target.value)}
                  className="w-full h-8 px-2.5 border border-line rounded-sm bg-surface text-primary focus:border-brand"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(false)}
                  className="px-3 py-1.5 rounded-sm border border-line text-secondary hover:text-primary text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-sm bg-brand text-white hover:bg-brand-600 text-xs font-semibold shadow-subtle"
                >
                  Create & Select Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


