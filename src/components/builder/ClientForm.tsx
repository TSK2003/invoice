import React, { useState, useEffect } from 'react';
import { ClientInfo } from '../../types/document';
import { FormErrors } from '../../utils/validator';
import { Customer } from '../../types/customer';
import { fetchCustomers } from '../../services/firebase/firestore';
import { INDIAN_STATES, getStateByName, getStateByCode } from '../../constants/indianStates';
import { UserCheck, Building2, MapPin, Hash, Mail, Phone } from 'lucide-react';

interface ClientFormProps {
  client: ClientInfo;
  onChange: (field: keyof ClientInfo, value: string) => void;
  onSelectCustomer?: (customer: Customer) => void;
  errors?: FormErrors;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onChange,
  onSelectCustomer,
  errors = {},
}) => {
  const [savedCustomers, setSavedCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await fetchCustomers();
        setSavedCustomers(data);
      } catch (e) {
        console.warn('Failed to load customers for dropdown', e);
      }
    }
    loadCustomers();
  }, []);

  const handleSelectCustomer = (customerId: string) => {
    if (!customerId) return;
    const found = savedCustomers.find((c) => c.id === customerId);
    if (found) {
      onChange('companyName', found.companyName);
      onChange('contactPerson', found.contactPerson || '');
      onChange('email', found.email || '');
      onChange('phone', found.phone || '');
      onChange('billingAddress', found.billingAddress || '');
      onChange('city', found.city || '');
      onChange('state', found.state || '');
      onChange('stateCode', found.stateCode || '');
      onChange('gstin', found.gstin || '');
      onChange('pan', found.pan || '');
      onChange('placeOfSupply', found.placeOfSupply || `${found.state} (${found.stateCode})`);
      onChange('website', found.website || '');
      onChange('notes', found.notes || '');

      if (onSelectCustomer) {
        onSelectCustomer(found);
      }
    }
  };

  const handleStateChange = (stateName: string) => {
    const matched = getStateByName(stateName);
    const code = matched ? matched.code : '';
    onChange('state', stateName);
    onChange('stateCode', code);
    onChange('placeOfSupply', `${stateName} (${code})`);
  };

  const handleGstinChange = (gstinVal: string) => {
    const upper = gstinVal.toUpperCase().trim();
    onChange('gstin', upper);

    if (upper.length >= 2) {
      const code = upper.substring(0, 2);
      const matched = getStateByCode(code);
      if (matched) {
        onChange('state', matched.name);
        onChange('stateCode', matched.code);
        onChange('placeOfSupply', `${matched.name} (${matched.code})`);
      }
    }
    if (upper.length >= 12) {
      onChange('pan', upper.substring(2, 12));
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Customer Quick Selector */}
      {savedCustomers.length > 0 && (
        <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/40 rounded-xl">
          <label className="block text-[11px] font-bold text-brand mb-1 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            Quick Select from Customer Database
          </label>
          <select
            onChange={(e) => handleSelectCustomer(e.target.value)}
            defaultValue=""
            className="w-full h-9 px-3 border border-brand-200 dark:border-brand-800 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:border-brand"
          >
            <option value="">-- Choose an existing customer profile to auto-fill --</option>
            {savedCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName} {c.city ? `(${c.city})` : ''} {c.gstin ? `— ${c.gstin}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client / Company Name */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Client / Company Name <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Apex Logistics Pvt Ltd"
              value={client.companyName}
              onChange={(e) => onChange('companyName', e.target.value)}
              className={`w-full h-10 pl-9 pr-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:border-brand ${
                errors.clientCompanyName
                  ? 'border-rose-500 ring-1 ring-rose-500'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.clientCompanyName && (
            <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.clientCompanyName}</p>
          )}
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Contact Person
          </label>
          <input
            type="text"
            placeholder="e.g. Mr. Rajesh Kumar"
            value={client.contactPerson}
            onChange={(e) => onChange('contactPerson', e.target.value)}
            className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
          />
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
              placeholder="e.g. 9840112233"
              value={client.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className={`w-full h-10 pl-9 pr-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.clientPhone ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.clientPhone && (
            <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.clientPhone}</p>
          )}
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
              placeholder="client@company.com"
              value={client.email}
              onChange={(e) => onChange('email', e.target.value)}
              className={`w-full h-10 pl-9 pr-3 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.clientEmail ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.clientEmail && (
            <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.clientEmail}</p>
          )}
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
              placeholder="e.g. 33AAACA1234F1Z1"
              value={client.gstin}
              onChange={(e) => handleGstinChange(e.target.value)}
              className={`w-full h-10 pl-9 pr-3 border rounded-lg uppercase font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand ${
                errors.clientGstin ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          </div>
          {errors.clientGstin && (
            <p className="text-[11px] text-rose-500 font-medium mt-1">{errors.clientGstin}</p>
          )}
        </div>

        {/* Billing Address */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Billing Address
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Street address, building, suite"
              value={client.billingAddress}
              onChange={(e) => onChange('billingAddress', e.target.value)}
              className="w-full h-10 pl-9 pr-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            City
          </label>
          <input
            type="text"
            placeholder="e.g. Chennai"
            value={client.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            State (Destination Jurisdiction)
          </label>
          <select
            value={client.state || 'Tamil Nadu'}
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
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            State Code (GST)
          </label>
          <input
            type="text"
            readOnly
            value={client.stateCode || '33'}
            className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-mono font-bold"
          />
        </div>

        {/* PAN */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            PAN Number
          </label>
          <input
            type="text"
            maxLength={10}
            placeholder="e.g. AAACA1234F"
            value={client.pan}
            onChange={(e) => onChange('pan', e.target.value.toUpperCase())}
            className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase focus:border-brand"
          />
        </div>

        {/* Place of Supply */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Place of Supply (Statutory GST)
          </label>
          <input
            type="text"
            placeholder="e.g. Tamil Nadu (33)"
            value={client.placeOfSupply}
            onChange={(e) => onChange('placeOfSupply', e.target.value)}
            className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
          />
        </div>
      </div>
    </div>
  );
};
