import React, { useState } from 'react';
import { CompanyProfile, SignatureSealConfig } from '../../types/company';
import { Building2, Landmark, Upload, ShieldCheck, Check, Loader2, AlertCircle } from 'lucide-react';
import { LOGO_BASE64, SEAL_BASE64, SIGNATURE_BASE64 } from '../../constants/imageAssets';
import { INDIAN_STATES, getStateByName, getStateByCode } from '../../constants/indianStates';
import { uploadCompanyAsset } from '../../services/firebase/storage';
import { CompanyProfileSchema } from '../../services/validation/validators';
import { useToast } from '../../app/providers/ToastProvider';

interface CompanyFormProps {
  company: CompanyProfile;
  onChangeCompany: (company: CompanyProfile) => void;
  onSaveProfile?: () => Promise<void> | void;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onChangeCompany,
  onSaveProfile,
}) => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSeal, setUploadingSeal] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { showSuccess, showError } = useToast();

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    onChangeCompany({
      ...company,
      [field]: value,
    });
  };

  const handleStateChange = (stateName: string) => {
    const matched = getStateByName(stateName);
    const code = matched ? matched.code : '';
    onChangeCompany({
      ...company,
      state: stateName,
      stateCode: code,
    });
  };

  const handleGstinChange = (gstinVal: string) => {
    const upper = gstinVal.toUpperCase().trim();
    let panVal = company.pan || '';
    let stateCodeVal = company.stateCode || '';
    let stateNameVal = company.state || '';

    if (upper.length >= 2) {
      const gstinStateCode = upper.substring(0, 2);
      const matched = getStateByCode(gstinStateCode);
      if (matched) {
        stateCodeVal = matched.code;
        stateNameVal = matched.name;
      }
    }
    if (upper.length >= 12) {
      panVal = upper.substring(2, 12);
    }

    onChangeCompany({
      ...company,
      gstin: upper,
      pan: panVal,
      stateCode: stateCodeVal,
      state: stateNameVal,
    });
  };

  const currentSigSeal: SignatureSealConfig = company.signatureSeal || {
    showSeal: true,
    showSignature: true,
    sealImageUrl: SEAL_BASE64,
    signatureImageUrl: SIGNATURE_BASE64,
    signatoryTitle: 'Authorized Signatory',
    signatoryName: company.signatoryName || '',
    signatoryDesignation: company.signatoryDesignation || '',
    customerSignatoryTitle: 'Customer Representative',
  };

  const handleSigSealChange = (field: keyof SignatureSealConfig, value: any) => {
    const updatedSigSeal = {
      ...currentSigSeal,
      [field]: value,
    };
    handleChange('signatureSeal', updatedSigSeal);
  };

  // Image upload handlers using Firebase Storage
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const companyId = company.id || 'default_company';
      const result = await uploadCompanyAsset(companyId, 'logo', file);
      handleChange('logoUrl', result.url);
      showSuccess('Logo uploaded to cloud storage');
    } catch (err: any) {
      showError('Logo upload failed', err.message);
      // Fallback to local base64 reader if storage upload fails in test mode
      const reader = new FileReader();
      reader.onload = () => handleChange('logoUrl', reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSeal(true);
    try {
      const companyId = company.id || 'default_company';
      const result = await uploadCompanyAsset(companyId, 'seal', file);
      handleSigSealChange('sealImageUrl', result.url);
      showSuccess('Seal stamp uploaded');
    } catch (err: any) {
      showError('Seal upload failed', err.message);
      const reader = new FileReader();
      reader.onload = () => handleSigSealChange('sealImageUrl', reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploadingSeal(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSignature(true);
    try {
      const companyId = company.id || 'default_company';
      const result = await uploadCompanyAsset(companyId, 'signature', file);
      handleSigSealChange('signatureImageUrl', result.url);
      showSuccess('Signature uploaded');
    } catch (err: any) {
      showError('Signature upload failed', err.message);
      const reader = new FileReader();
      reader.onload = () => handleSigSealChange('signatureImageUrl', reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleSave = async () => {
    setErrors({});
    const validation = CompanyProfileSchema.safeParse(company);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      showError('Validation Error', 'Please check the highlighted company details.');
      return;
    }

    if (onSaveProfile) {
      setIsSaving(true);
      try {
        await onSaveProfile();
        showSuccess('Company profile saved successfully!');
      } catch (err: any) {
        showError('Failed to save profile', err.message);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand" />
            Company Profile & Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure legal identity, state jurisdiction, brand assets, and settlement bank accounts.
          </p>
        </div>

        {onSaveProfile && (
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        )}
      </div>

      {/* SECTION 1: LEGAL & GENERAL IDENTITY */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
          Legal & Brand Identity
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Company Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Display Trade Name *
            </label>
            <input
              type="text"
              required
              value={company.companyName || ''}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className={`w-full h-10 px-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:border-brand ${
                errors.companyName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.companyName && <p className="text-rose-500 text-[11px] mt-1">{errors.companyName}</p>}
          </div>

          {/* Legal Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registered Legal Entity Name
            </label>
            <input
              type="text"
              value={company.legalName || ''}
              onChange={(e) => handleChange('legalName', e.target.value)}
              placeholder="e.g. AESCION EDTECH SOLUTIONS PRIVATE LIMITED"
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Business Tagline / Subtitle
            </label>
            <input
              type="text"
              value={company.tagline || ''}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Company GSTIN (15 Digits) *
            </label>
            <input
              type="text"
              maxLength={15}
              value={company.gstin || ''}
              onChange={(e) => handleGstinChange(e.target.value)}
              className={`w-full h-10 px-3 border uppercase font-mono font-bold rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.gstin ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.gstin && <p className="text-rose-500 text-[11px] mt-1">{errors.gstin}</p>}
          </div>

          {/* PAN */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Company PAN (10 Characters) *
            </label>
            <input
              type="text"
              maxLength={10}
              value={company.pan || ''}
              onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
              className={`w-full h-10 px-3 border uppercase font-mono font-bold rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.pan ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.pan && <p className="text-rose-500 text-[11px] mt-1">{errors.pan}</p>}
          </div>

          {/* Official Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Official Email Address *
            </label>
            <input
              type="email"
              value={company.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full h-10 px-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Support Phone Number *
            </label>
            <input
              type="text"
              value={company.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full h-10 px-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.phone ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.phone && <p className="text-rose-500 text-[11px] mt-1">{errors.phone}</p>}
          </div>

          {/* Website */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Website
            </label>
            <input
              type="text"
              value={company.website || ''}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>

          {/* Logo Asset */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Brand Logo Image
            </label>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg">
              <img
                src={company.logoUrl || LOGO_BASE64}
                alt="Company Logo"
                className="h-8 max-w-[120px] object-contain"
              />
              <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition-colors">
                {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{uploadingLogo ? 'Uploading...' : 'Change Logo'}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: LOCATION & GST JURISDICTION */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
          Location & State Jurisdiction (Place of Origin)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Registered Office Address *
            </label>
            <input
              type="text"
              value={company.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className={`w-full h-10 px-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.address ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.address && <p className="text-rose-500 text-[11px] mt-1">{errors.address}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              City *
            </label>
            <input
              type="text"
              value={company.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. Chennai"
              className={`w-full h-10 px-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.city ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.city && <p className="text-rose-500 text-[11px] mt-1">{errors.city}</p>}
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pincode *
            </label>
            <input
              type="text"
              maxLength={6}
              value={company.pincode || ''}
              onChange={(e) => handleChange('pincode', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 600032"
              className={`w-full h-10 px-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.pincode ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.pincode && <p className="text-rose-500 text-[11px] mt-1">{errors.pincode}</p>}
          </div>

          {/* State */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              State of Registration *
            </label>
            <select
              value={company.state || 'Tamil Nadu'}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* State Code */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              2-Digit GST State Code *
            </label>
            <input
              type="text"
              readOnly
              value={company.stateCode || '33'}
              className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: AUTHORIZED SIGNATORY & SEAL */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand" />
          Authorized Signatory & Seal Stamp
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Company Seal Stamp */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white text-xs">Company Seal Stamp</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSigSeal.showSeal}
                  onChange={(e) => handleSigSealChange('showSeal', e.target.checked)}
                  className="w-4 h-4 text-brand rounded"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Show Seal on Docs</span>
              </label>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <img
                src={currentSigSeal.sealImageUrl || SEAL_BASE64}
                alt="Seal Stamp"
                className="h-12 w-12 object-contain"
              />
              <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 transition-colors">
                {uploadingSeal ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{uploadingSeal ? 'Uploading...' : 'Change Seal'}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleSealUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Authorized Signature */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 dark:text-white text-xs">Authorized Signature</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSigSeal.showSignature}
                  onChange={(e) => handleSigSealChange('showSignature', e.target.checked)}
                  className="w-4 h-4 text-brand rounded"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Show Signature</span>
              </label>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
              <img
                src={currentSigSeal.signatureImageUrl || SIGNATURE_BASE64}
                alt="Signature"
                className="h-10 max-w-[140px] object-contain"
              />
              <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 transition-colors">
                {uploadingSignature ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{uploadingSignature ? 'Uploading...' : 'Change Signature'}</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleSignatureUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Signatory Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Signatory Full Name
            </label>
            <input
              type="text"
              value={company.signatoryName || ''}
              onChange={(e) => {
                handleChange('signatoryName', e.target.value);
                handleSigSealChange('signatoryName', e.target.value);
              }}
              placeholder="e.g. Karthick S"
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>

          {/* Signatory Designation */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Signatory Designation / Title
            </label>
            <input
              type="text"
              value={company.signatoryDesignation || ''}
              onChange={(e) => {
                handleChange('signatoryDesignation', e.target.value);
                handleSigSealChange('signatoryDesignation', e.target.value);
              }}
              placeholder="e.g. Director / Authorized Signatory"
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: BANK & UPI SETTLEMENT DETAILS */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-brand" />
          Banking & UPI Settlement
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Bank Name *
            </label>
            <input
              type="text"
              value={company.bankName || ''}
              onChange={(e) => handleChange('bankName', e.target.value)}
              className={`w-full h-10 px-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.bankName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.bankName && <p className="text-rose-500 text-[11px] mt-1">{errors.bankName}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Beneficiary Account Name *
            </label>
            <input
              type="text"
              value={company.accountName || ''}
              onChange={(e) => handleChange('accountName', e.target.value)}
              className={`w-full h-10 px-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:border-brand ${
                errors.accountName ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.accountName && <p className="text-rose-500 text-[11px] mt-1">{errors.accountName}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Bank Account Number *
            </label>
            <input
              type="text"
              value={company.accountNumber || ''}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              className={`w-full h-10 px-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:border-brand ${
                errors.accountNumber ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.accountNumber && <p className="text-rose-500 text-[11px] mt-1">{errors.accountNumber}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              IFSC Code (11 Characters) *
            </label>
            <input
              type="text"
              maxLength={11}
              value={company.ifsc || ''}
              onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase())}
              className={`w-full h-10 px-3 border uppercase font-mono font-bold rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.ifsc ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.ifsc && <p className="text-rose-500 text-[11px] mt-1">{errors.ifsc}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              UPI VPA / ID
            </label>
            <input
              type="text"
              value={company.upiId || ''}
              onChange={(e) => handleChange('upiId', e.target.value)}
              placeholder="e.g. aescion@hdfcbank"
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:border-brand"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
