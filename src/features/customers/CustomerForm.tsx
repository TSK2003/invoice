import React, { useState, useEffect } from 'react';
import { Customer } from '../../types/customer';
import { INDIAN_STATES, getStateByCode, getStateByName } from '../../constants/indianStates';
import { CustomerSchema } from '../../services/validation/validators';
import { Building2, User, Mail, Phone, MapPin, Hash, Globe, FileText, Check } from 'lucide-react';

interface CustomerFormProps {
  initialData?: Customer | null;
  onSave: (customer: Customer) => Promise<void>;
  onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    billingAddress: '',
    city: '',
    state: 'Tamil Nadu',
    stateCode: '33',
    pincode: '',
    gstin: '',
    pan: '',
    placeOfSupply: 'Tamil Nadu (33)',
    website: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleStateChange = (stateName: string) => {
    const matched = getStateByName(stateName);
    const code = matched ? matched.code : '';
    setFormData((prev) => ({
      ...prev,
      state: stateName,
      stateCode: code,
      placeOfSupply: `${stateName} (${code})`,
    }));
  };

  const handleGstinChange = (gstinVal: string) => {
    const upper = gstinVal.toUpperCase().trim();
    let panVal = formData.pan || '';
    let stateCodeVal = formData.stateCode || '';
    let stateNameVal = formData.state || '';

    // Auto-extract state code and PAN from GSTIN if present
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

    setFormData((prev) => ({
      ...prev,
      gstin: upper,
      pan: panVal,
      stateCode: stateCodeVal,
      state: stateNameVal,
      placeOfSupply: stateNameVal ? `${stateNameVal} (${stateCodeVal})` : prev.placeOfSupply,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: Customer = {
      id: initialData?.id || `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      companyName: formData.companyName || '',
      contactPerson: formData.contactPerson || '',
      email: formData.email || '',
      phone: formData.phone || '',
      billingAddress: formData.billingAddress || '',
      city: formData.city || '',
      state: formData.state || '',
      stateCode: formData.stateCode || '',
      pincode: formData.pincode || '',
      gstin: (formData.gstin || '').toUpperCase(),
      pan: (formData.pan || '').toUpperCase(),
      placeOfSupply: formData.placeOfSupply || '',
      website: formData.website || '',
      notes: formData.notes || '',
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validation = CustomerSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Company Name */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Company / Client Name *
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Acme Innovations Pvt Ltd"
              className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors ${
                errors.companyName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-brand'
              }`}
            />
          </div>
          {errors.companyName && <p className="text-rose-500 text-[11px] mt-1">{errors.companyName}</p>}
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Contact Person
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. Rajesh Kumar"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.phone ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.phone && <p className="text-rose-500 text-[11px] mt-1">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. accounts@acme.com"
              className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.email ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.email && <p className="text-rose-500 text-[11px] mt-1">{errors.email}</p>}
        </div>

        {/* Website */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Website
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="e.g. www.acme.com"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>
        </div>

        {/* GSTIN */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            GSTIN (15 characters)
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              maxLength={15}
              value={formData.gstin}
              onChange={(e) => handleGstinChange(e.target.value)}
              placeholder="e.g. 33AAAAA0000A1Z5"
              className={`w-full h-10 pl-9 pr-3 rounded-lg border uppercase tracking-wider bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.gstin ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.gstin && <p className="text-rose-500 text-[11px] mt-1">{errors.gstin}</p>}
        </div>

        {/* PAN */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            PAN (10 characters)
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              maxLength={10}
              value={formData.pan}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase().trim() })}
              placeholder="e.g. AAAAA0000A"
              className={`w-full h-10 pl-9 pr-3 rounded-lg border uppercase tracking-wider bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.pan ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.pan && <p className="text-rose-500 text-[11px] mt-1">{errors.pan}</p>}
        </div>

        {/* Billing Address */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Billing Address *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              required
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              placeholder="e.g. 123 Tech Park, Anna Salai"
              className={`w-full h-10 pl-9 pr-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.billingAddress ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.billingAddress && <p className="text-rose-500 text-[11px] mt-1">{errors.billingAddress}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            City *
          </label>
          <input
            type="text"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g. Chennai"
            className={`w-full h-10 px-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
              errors.city ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.city && <p className="text-rose-500 text-[11px] mt-1">{errors.city}</p>}
        </div>

        {/* State */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            State *
          </label>
          <select
            value={formData.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s.code} value={s.name}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* State Code */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            State Code *
          </label>
          <input
            type="text"
            readOnly
            value={formData.stateCode}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-mono font-bold"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Pincode (6 digits)
          </label>
          <input
            type="text"
            maxLength={6}
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/[^0-9]/g, '') })}
            placeholder="e.g. 600002"
            className={`w-full h-10 px-3 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
              errors.pincode ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
            }`}
          />
          {errors.pincode && <p className="text-rose-500 text-[11px] mt-1">{errors.pincode}</p>}
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Internal Notes
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional client details, contract references, etc."
              className="w-full pl-9 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-brand text-white hover:bg-brand-600 transition-colors shadow-xs disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {isSaving ? 'Saving...' : initialData ? 'Update Customer' : 'Save Customer'}
        </button>
      </div>
    </form>
  );
};
