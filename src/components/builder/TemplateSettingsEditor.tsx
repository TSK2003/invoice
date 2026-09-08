import React, { useState } from 'react';
import { DocumentTemplateConfig } from '../../types/template';
import { Settings, Plus, Trash2 } from 'lucide-react';

interface TemplateProps {
  template: DocumentTemplateConfig;
  onChangeTemplate: (tmpl: DocumentTemplateConfig) => void;
  onSaveTemplate?: () => void;
}

export const TemplateSettingsEditor: React.FC<TemplateProps> = ({
  template,
  onChangeTemplate,
  onSaveTemplate,
}) => {
  const [newQuotationTerm, setNewQuotationTerm] = useState('');
  const [newInvoiceTerm, setNewInvoiceTerm] = useState('');

  const handleAddQuotationTerm = () => {
    if (!newQuotationTerm.trim()) return;
    onChangeTemplate({
      ...template,
      defaultTermsQuotation: [...template.defaultTermsQuotation, newQuotationTerm.trim()],
    });
    setNewQuotationTerm('');
  };

  const handleRemoveQuotationTerm = (index: number) => {
    onChangeTemplate({
      ...template,
      defaultTermsQuotation: template.defaultTermsQuotation.filter((_, i) => i !== index),
    });
  };

  const handleAddInvoiceTerm = () => {
    if (!newInvoiceTerm.trim()) return;
    onChangeTemplate({
      ...template,
      defaultTermsInvoice: [...template.defaultTermsInvoice, newInvoiceTerm.trim()],
    });
    setNewInvoiceTerm('');
  };

  const handleRemoveInvoiceTerm = (index: number) => {
    onChangeTemplate({
      ...template,
      defaultTermsInvoice: template.defaultTermsInvoice.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-surface p-5 rounded-md border border-line shadow-subtle space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-line pb-3.5">
        <div>
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand" />
            Document Template Settings
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Active: <span className="font-semibold text-primary">{template.name}</span>. Configure global default terms and document layout style.
          </p>
        </div>

        {onSaveTemplate && (
          <button
            type="button"
            onClick={onSaveTemplate}
            className="bg-brand hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors shadow-subtle"
          >
            Save Template Settings
          </button>
        )}
      </div>

      {/* Basic Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-secondary mb-1">Template Name</label>
          <input
            type="text"
            value={template.name}
            onChange={e => onChangeTemplate({ ...template, name: e.target.value })}
            className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs font-semibold focus:border-brand"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-secondary mb-1">Header Style</label>
          <select
            value={template.headerStyle}
            onChange={e => onChangeTemplate({ ...template, headerStyle: e.target.value as any })}
            className="w-full h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
          >
            <option value="standard">Standard Corporate (Header Rule)</option>
            <option value="modern">Modern Minimal</option>
            <option value="compact">Compact Dense</option>
          </select>
        </div>
      </div>

      {/* Quotation Terms Management */}
      <div className="border-t border-line pt-4 text-xs space-y-2">
        <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider">
          Default Quotation Terms & Conditions ({template.defaultTermsQuotation.length})
        </label>

        <div className="space-y-1.5 max-h-52 overflow-auto bg-page p-2.5 border border-line rounded-md">
          {template.defaultTermsQuotation.map((term, i) => (
            <div key={i} className="flex items-center justify-between gap-2 bg-surface p-2 border border-line rounded-sm text-primary text-xs">
              <span className="flex-1 font-medium">{term}</span>
              <button
                type="button"
                onClick={() => handleRemoveQuotationTerm(i)}
                className="text-secondary hover:text-primary p-0.5 rounded-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new quotation term..."
            value={newQuotationTerm}
            onChange={e => setNewQuotationTerm(e.target.value)}
            className="flex-1 h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
          />
          <button
            type="button"
            onClick={handleAddQuotationTerm}
            className="bg-brand hover:bg-brand-600 text-white h-9 px-3.5 rounded-sm text-xs font-semibold flex items-center gap-1 transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" /> Add Term
          </button>
        </div>
      </div>

      {/* Invoice Terms Management */}
      <div className="border-t border-line pt-4 text-xs space-y-2">
        <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider">
          Default Tax Invoice Terms & Conditions ({template.defaultTermsInvoice.length})
        </label>

        <div className="space-y-1.5 max-h-52 overflow-auto bg-page p-2.5 border border-line rounded-md">
          {template.defaultTermsInvoice.map((term, i) => (
            <div key={i} className="flex items-center justify-between gap-2 bg-surface p-2 border border-line rounded-sm text-primary text-xs">
              <span className="flex-1 font-medium">{term}</span>
              <button
                type="button"
                onClick={() => handleRemoveInvoiceTerm(i)}
                className="text-secondary hover:text-primary p-0.5 rounded-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new invoice term..."
            value={newInvoiceTerm}
            onChange={e => setNewInvoiceTerm(e.target.value)}
            className="flex-1 h-9 px-3 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
          />
          <button
            type="button"
            onClick={handleAddInvoiceTerm}
            className="bg-brand hover:bg-brand-600 text-white h-9 px-3.5 rounded-sm text-xs font-semibold flex items-center gap-1 transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" /> Add Term
          </button>
        </div>
      </div>
    </div>
  );
};

