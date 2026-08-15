import React from 'react';
import { CompanyProfile, SignatureSealConfig } from '../../types/document';
import { Building2, Landmark, Upload, ShieldCheck, X } from 'lucide-react';
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
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-brand" />
            Company Identity & Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Default company profile, bank credentials, seal stamp, and signature assets (reused across all documents).
          </p>
        </div>

        {onSaveProfile && (
          <button
            type="button"
            onClick={onSaveProfile}
            className="bg-blue-brand hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Save Company Settings
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Company Name */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">Company Name</label>
          <input
            type="text"
            value={company.companyName}
            onChange={e => handleChange('companyName', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30 font-bold text-navy"
          />
        </div>

        {/* Tagline */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Sub-tagline</label>
          <input
            type="text"
            value={company.tagline}
            onChange={e => handleChange('tagline', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          />
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block font-semibold text-slate-700 mb-1">Full Company Address</label>
          <input
            type="text"
            value={company.address}
            onChange={e => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          />
        </div>

        {/* GSTIN */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Company GSTIN</label>
          <input
            type="text"
            value={company.gstin}
            onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          />
        </div>

        {/* PAN */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Company PAN</label>
          <input
            type="text"
            value={company.pan}
            onChange={e => handleChange('pan', e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
          <input
            type="email"
            value={company.email}
            onChange={e => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={company.phone}
            onChange={e => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
          <input
            type="text"
            value={company.website}
            onChange={e => handleChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30 font-semibold text-blue-brand"
          />
        </div>

        {/* Logo preview */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Company Logo</label>
          <div className="flex items-center gap-3 bg-slate-50 p-2 border border-slate-200 rounded-lg">
            <img src={company.logoUrl} alt="Logo" className="h-8 max-w-[150px] object-contain" />
            <label className="cursor-pointer bg-white px-2.5 py-1 rounded border border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1">
              <Upload className="w-3 h-3" /> Change Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* SIGNATURE & SEAL ASSETS SECTION */}
      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-xs font-extrabold text-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-brand" /> Official Signature & Company Seal Stamp Assets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Company Seal Stamp */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Company Seal Stamp Image</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSigSeal.showSeal}
                  onChange={e => handleSigSealChange('showSeal', e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-brand rounded"
                />
                <span className="text-[11px] font-semibold text-slate-600">Show Seal</span>
              </label>
            </div>

            {currentSigSeal.sealImageUrl ? (
              <div className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg">
                <img src={currentSigSeal.sealImageUrl} alt="Seal Stamp" className="h-12 w-12 object-contain" />
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Change Seal
                  <input type="file" accept="image/*" onChange={handleSealUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:border-blue-brand text-slate-600 font-semibold">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload Seal Stamp PNG</span>
                <input type="file" accept="image/*" onChange={handleSealUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Authorized Signature */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Authorized Signature Image</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSigSeal.showSignature}
                  onChange={e => handleSigSealChange('showSignature', e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-brand rounded"
                />
                <span className="text-[11px] font-semibold text-slate-600">Show Signature</span>
              </label>
            </div>

            {currentSigSeal.signatureImageUrl ? (
              <div className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg">
                <img src={currentSigSeal.signatureImageUrl} alt="Signature" className="h-9 max-w-[130px] object-contain" />
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Change Sign
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:border-blue-brand text-slate-600 font-semibold">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload Signature PNG</span>
                <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Signatory Titles */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Signatory Line Title</label>
            <input
              type="text"
              value={currentSigSeal.signatoryTitle}
              onChange={e => handleSigSealChange('signatoryTitle', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Signatory Line Title</label>
            <input
              type="text"
              value={currentSigSeal.customerSignatoryTitle}
              onChange={e => handleSigSealChange('customerSignatoryTitle', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30 font-medium"
            />
          </div>
        </div>
      </div>

      {/* BANK DETAILS SECTION */}
      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-xs font-extrabold text-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-blue-brand" /> Bank & UPI Settlement Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={company.bankName}
              onChange={e => handleChange('bankName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Name</label>
            <input
              type="text"
              value={company.accountName}
              onChange={e => handleChange('accountName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-brand/30 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
            <input
              type="text"
              value={company.accountNumber}
              onChange={e => handleChange('accountNumber', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
            <input
              type="text"
              value={company.ifsc}
              onChange={e => handleChange('ifsc', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg uppercase font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">UPI ID</label>
            <input
              type="text"
              value={company.upiId}
              onChange={e => handleChange('upiId', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-blue-brand focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
