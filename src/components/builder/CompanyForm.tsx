import React from 'react';
import { CompanyProfile, SignatureSealConfig } from '../../types/document';
import { Building2, Landmark, Upload, ShieldCheck } from 'lucide-react';
import { SEAL_BASE64, SIGNATURE_BASE64 } from '../../constants/imageAssets';

interface CompanyFormProps {
  company: CompanyProfile;
  onChangeCompany: (company: CompanyProfile) => void;
  onSaveProfile?: () => void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onChangeCompany,
  onSaveProfile,
}) => {
  const handleChange = (field: keyof CompanyProfile, value: any) => {
    onChangeCompany({
      ...company,
      [field]: value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentSigSeal: SignatureSealConfig = company.signatureSeal || {
    showSeal: true,
    showSignature: true,
    sealImageUrl: SEAL_BASE64,
    signatureImageUrl: SIGNATURE_BASE64,
    signatoryTitle: 'Authorized Signatory',
    customerSignatoryTitle: 'Customer Representative',
  };

  const handleSigSealChange = (field: keyof SignatureSealConfig, value: any) => {
    const updatedSigSeal = {
      ...currentSigSeal,
      [field]: value,
    };
    handleChange('signatureSeal', updatedSigSeal);
  };

  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleSigSealChange('sealImageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleSigSealChange('signatureImageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-surface p-5 rounded-md border border-line shadow-subtle space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-line pb-3.5">
        <div>
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand" />
            Company Profile & Settings
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Default company details, brand assets, seal stamp, and banking settlement details.
          </p>
        </div>

        {onSaveProfile && (
          <button
            type="button"
            onClick={onSaveProfile}
            className="bg-brand hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors shadow-subtle"
          >
            Save Company Settings
          </button>
        )}
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      <div>
        <div className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-2.5 pb-1 border-b border-line">
          Basic Information
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Company Name */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Company Name</label>
            <input
              type="text"
              value={company.companyName}
              onChange={e => handleChange('companyName', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs font-bold focus:border-brand"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Sub-tagline</label>
            <input
              type="text"
              value={company.tagline}
              onChange={e => handleChange('tagline', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-secondary mb-1">Full Company Address</label>
            <input
              type="text"
              value={company.address}
              onChange={e => handleChange('address', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
            />
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Company GSTIN</label>
            <input
              type="text"
              value={company.gstin}
              onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs uppercase font-mono focus:border-brand"
            />
          </div>

          {/* PAN */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Company PAN</label>
            <input
              type="text"
              value={company.pan}
              onChange={e => handleChange('pan', e.target.value.toUpperCase())}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs uppercase font-mono focus:border-brand"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Official Email</label>
            <input
              type="email"
              value={company.email}
              onChange={e => handleChange('email', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Phone Number</label>
            <input
              type="text"
              value={company.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Website URL</label>
            <input
              type="text"
              value={company.website}
              onChange={e => handleChange('website', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
            />
          </div>

          {/* Logo */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Company Logo</label>
            <div className="flex items-center gap-3 bg-page p-2 border border-line rounded-sm">
              <img src={company.logoUrl} alt="Logo" className="h-7 max-w-[140px] object-contain" />
              <label className="cursor-pointer bg-surface px-2.5 py-1 rounded-xs border border-line text-[11px] font-semibold text-primary hover:bg-page flex items-center gap-1">
                <Upload className="w-3 h-3" /> Change Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BRAND & AUTHORIZATION ASSETS */}
      <div>
        <div className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-2.5 pb-1 border-b border-line flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          Brand & Signatory Assets
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Company Seal Stamp */}
          <div className="bg-page border border-line p-3 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-primary text-[11px]">Company Seal Stamp</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSigSeal.showSeal}
                  onChange={e => handleSigSealChange('showSeal', e.target.checked)}
                  className="w-3.5 h-3.5 text-brand rounded-xs"
                />
                <span className="text-[10.5px] text-secondary font-medium">Show Seal</span>
              </label>
            </div>

            {currentSigSeal.sealImageUrl ? (
              <div className="flex items-center justify-between bg-surface p-2 border border-line rounded-sm">
                <img src={currentSigSeal.sealImageUrl} alt="Seal Stamp" className="h-10 w-10 object-contain" />
                <label className="cursor-pointer bg-page hover:bg-slate-200 text-primary px-2 py-1 rounded-xs text-[11px] font-medium flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Change Seal
                  <input type="file" accept="image/*" onChange={handleSealUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-1.5 p-2.5 border border-dashed border-line rounded-sm bg-surface cursor-pointer hover:border-brand text-secondary font-medium text-[11px]">
                <Upload className="w-3.5 h-3.5 text-secondary" />
                <span>Upload Seal Stamp PNG</span>
                <input type="file" accept="image/*" onChange={handleSealUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Authorized Signature */}
          <div className="bg-page border border-line p-3 rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-primary text-[11px]">Authorized Signature</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSigSeal.showSignature}
                  onChange={e => handleSigSealChange('showSignature', e.target.checked)}
                  className="w-3.5 h-3.5 text-brand rounded-xs"
                />
                <span className="text-[10.5px] text-secondary font-medium">Show Signature</span>
              </label>
            </div>

            {currentSigSeal.signatureImageUrl ? (
              <div className="flex items-center justify-between bg-surface p-2 border border-line rounded-sm">
                <img src={currentSigSeal.signatureImageUrl} alt="Signature" className="h-8 max-w-[120px] object-contain" />
                <label className="cursor-pointer bg-page hover:bg-slate-200 text-primary px-2 py-1 rounded-xs text-[11px] font-medium flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Change Signature
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-1.5 p-2.5 border border-dashed border-line rounded-sm bg-surface cursor-pointer hover:border-brand text-secondary font-medium text-[11px]">
                <Upload className="w-3.5 h-3.5 text-secondary" />
                <span>Upload Signature PNG</span>
                <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Signatory Titles */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Company Signatory Title</label>
            <input
              type="text"
              value={currentSigSeal.signatoryTitle}
              onChange={e => handleSigSealChange('signatoryTitle', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Customer Signatory Title</label>
            <input
              type="text"
              value={currentSigSeal.customerSignatoryTitle}
              onChange={e => handleSigSealChange('customerSignatoryTitle', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: BANK & UPI SETTLEMENT DETAILS */}
      <div>
        <div className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-2.5 pb-1 border-b border-line flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-brand" />
          Bank & UPI Settlement Details
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Bank Name</label>
            <input
              type="text"
              value={company.bankName}
              onChange={e => handleChange('bankName', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Account Name</label>
            <input
              type="text"
              value={company.accountName}
              onChange={e => handleChange('accountName', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs font-semibold focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">Account Number</label>
            <input
              type="text"
              value={company.accountNumber}
              onChange={e => handleChange('accountNumber', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs font-mono font-semibold focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">IFSC Code</label>
            <input
              type="text"
              value={company.ifsc}
              onChange={e => handleChange('ifsc', e.target.value.toUpperCase())}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs uppercase font-mono font-semibold focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-secondary mb-1">UPI ID</label>
            <input
              type="text"
              value={company.upiId}
              onChange={e => handleChange('upiId', e.target.value)}
              className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs font-semibold focus:border-brand"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

