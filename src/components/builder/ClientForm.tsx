import React from 'react';
import { ClientInfo } from '../../types/document';
import { FormErrors } from '../../utils/validator';

interface ClientFormProps {
  client: ClientInfo;
  onChange: (field: keyof ClientInfo, value: string) => void;
  errors?: FormErrors;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onChange,
  errors = {},
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
      {/* Client / Company Name */}
      <div className="sm:col-span-2">
        <label className="block text-[11px] font-semibold text-secondary mb-1">
          Client / Company Name <span className="text-primary font-bold">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Apex Logistics Pvt Ltd"
          value={client.companyName}
          onChange={e => onChange('companyName', e.target.value)}
          className={`w-full h-9 px-3 border rounded-sm bg-surface text-primary text-xs focus:border-brand ${
            errors.clientCompanyName
              ? 'border-primary'
              : 'border-line'
          }`}
        />
        {errors.clientCompanyName && (
          <p className="text-[10px] text-primary font-medium mt-1">{errors.clientCompanyName}</p>
        )}
      </div>

      {/* Contact Person */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary mb-1">Contact Person</label>
        <input
          type="text"
          placeholder="e.g. Mr. Rajesh Kumar"
          value={client.contactPerson}
          onChange={e => onChange('contactPerson', e.target.value)}
          className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary mb-1">Email Address</label>
        <input
          type="email"
          placeholder="client@company.com"
          value={client.email}
          onChange={e => onChange('email', e.target.value)}
          className={`w-full h-9 px-3 border rounded-sm bg-surface text-primary text-xs focus:border-brand ${
            errors.clientEmail
              ? 'border-primary'
              : 'border-line'
          }`}
        />
        {errors.clientEmail && (
          <p className="text-[10px] text-primary font-medium mt-1">{errors.clientEmail}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary mb-1">Phone Number</label>
        <input
          type="text"
          placeholder="e.g. 9840112233"
          value={client.phone}
          onChange={e => onChange('phone', e.target.value)}
          className={`w-full h-9 px-3 border rounded-sm bg-surface text-primary text-xs focus:border-brand ${
            errors.clientPhone
              ? 'border-primary'
              : 'border-line'
          }`}
        />
        {errors.clientPhone && (
          <p className="text-[10px] text-primary font-medium mt-1">{errors.clientPhone}</p>
        )}
      </div>

      {/* GSTIN */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary mb-1">GSTIN</label>
        <input
          type="text"
          placeholder="e.g. 33AAACA1234F1Z1"
          value={client.gstin}
          onChange={e => onChange('gstin', e.target.value.toUpperCase())}
          className={`w-full h-9 px-3 border rounded-sm bg-surface text-primary text-xs uppercase font-mono focus:border-brand ${
            errors.clientGstin
              ? 'border-primary'
              : 'border-line'
          }`}
        />
        {errors.clientGstin && (
          <p className="text-[10px] text-primary font-medium mt-1">{errors.clientGstin}</p>
        )}
      </div>

      {/* Billing Address */}
      <div className="sm:col-span-2">
        <label className="block text-[11px] font-semibold text-secondary mb-1">Billing Address</label>
        <input
          type="text"
          placeholder="Street address, building, suite"
          value={client.billingAddress}
          onChange={e => onChange('billingAddress', e.target.value)}
          className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary mb-1">City</label>
        <input
          type="text"
          placeholder="e.g. Chennai"
          value={client.city}
          onChange={e => onChange('city', e.target.value)}
          className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
        />
      </div>

      {/* State */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary mb-1">State & State Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Tamil Nadu"
            value={client.state}
            onChange={e => onChange('state', e.target.value)}
            className="flex-1 h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
          />
          <input
            type="text"
            placeholder="Code (33)"
            value={client.stateCode}
            onChange={e => onChange('stateCode', e.target.value)}
            className="w-20 h-9 px-2 border border-line rounded-sm bg-surface text-primary text-xs text-center font-bold font-mono focus:border-brand"
          />
        </div>
      </div>

      {/* PAN */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary mb-1">PAN Number</label>
        <input
          type="text"
          placeholder="e.g. AAACA1234F"
          value={client.pan}
          onChange={e => onChange('pan', e.target.value.toUpperCase())}
          className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs uppercase font-mono focus:border-brand"
        />
      </div>

      {/* Place of Supply */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary mb-1">Place of Supply</label>
        <input
          type="text"
          placeholder="e.g. Tamil Nadu (33)"
          value={client.placeOfSupply}
          onChange={e => onChange('placeOfSupply', e.target.value)}
          className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
        />
      </div>
    </div>
  );
};

