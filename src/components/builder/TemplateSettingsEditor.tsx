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
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-navy flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-brand" />
            Document Template System
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Template: <b className="text-blue-brand">{template.name}</b>. Configures global styling and default business terms.
          </p>
        </div>

        {onSaveTemplate && (
          <button
            type="button"
            onClick={onSaveTemplate}
            className="bg-blue-brand hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Save Template Settings
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Template Name</label>
          <input
            type="text"
            value={template.name}
            onChange={e => onChangeTemplate({ ...template, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Header Style</label>
          <select
            value={template.headerStyle}
            onChange={e => onChangeTemplate({ ...template, headerStyle: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium"
          >
            <option value="standard">Standard Corporate (Navy Bar)</option>
            <option value="modern">Modern Minimal</option>
            <option value="compact">Compact Dense</option>
          </select>
        </div>
      </div>

      {/* Quotation Terms Management */}
      <div className="border-t border-slate-200 pt-4 text-xs space-y-2">
        <label className="block font-extrabold text-navy uppercase tracking-wider">
          Default Quotation Terms & Conditions ({template.defaultTermsQuotation.length})
        </label>

        <div className="space-y-1.5 max-h-52 overflow-auto bg-slate-50 p-3 border border-slate-200 rounded-xl">
          {template.defaultTermsQuotation.map((term, i) => (
            <div key={i} className="flex items-center justify-between gap-2 bg-white p-2 border border-slate-200 rounded-lg text-slate-700">
              <span className="flex-1 font-medium">{term}</span>
              <button
                type="button"
                onClick={() => handleRemoveQuotationTerm(i)}
                className="text-rose-500 hover:text-rose-700 p-1"
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
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
          />
          <button
            type="button"
            onClick={handleAddQuotationTerm}
            className="bg-blue-brand hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Term
          </button>
        </div>
      </div>

      {/* Invoice Terms Management */}
      <div className="border-t border-slate-200 pt-4 text-xs space-y-2">
        <label className="block font-extrabold text-navy uppercase tracking-wider">
          Default Tax Invoice Terms & Conditions ({template.defaultTermsInvoice.length})
        </label>

        <div className="space-y-1.5 max-h-52 overflow-auto bg-slate-50 p-3 border border-slate-200 rounded-xl">
          {template.defaultTermsInvoice.map((term, i) => (
            <div key={i} className="flex items-center justify-between gap-2 bg-white p-2 border border-slate-200 rounded-lg text-slate-700">
              <span className="flex-1 font-medium">{term}</span>
              <button
                type="button"
                onClick={() => handleRemoveInvoiceTerm(i)}
                className="text-rose-500 hover:text-rose-700 p-1"
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
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
          />
          <button
            type="button"
            onClick={handleAddInvoiceTerm}
            className="bg-blue-brand hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Term
          </button>
        </div>
      </div>
    </div>
  );
};
