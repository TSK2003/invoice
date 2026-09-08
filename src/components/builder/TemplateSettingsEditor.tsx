import React, { useState } from 'react';
import { DocumentTemplateConfig } from '../../types/template';
import { Settings, Plus, Trash2, Palette, Check, Loader2 } from 'lucide-react';
import { useToast } from '../../app/providers/ToastProvider';

interface TemplateProps {
  template: DocumentTemplateConfig;
  onChangeTemplate: (tmpl: DocumentTemplateConfig) => void;
  onSaveTemplate?: () => Promise<void> | void;
}

export const TemplateSettingsEditor: React.FC<TemplateProps> = ({
  template,
  onChangeTemplate,
  onSaveTemplate,
}) => {
  const [newQuotationTerm, setNewQuotationTerm] = useState('');
  const [newInvoiceTerm, setNewInvoiceTerm] = useState('');
  const [newReceiptTerm, setNewReceiptTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { showSuccess, showError } = useToast();

  const handleAddQuotationTerm = () => {
    if (!newQuotationTerm.trim()) return;
    onChangeTemplate({
      ...template,
      defaultTermsQuotation: [...(template.defaultTermsQuotation || []), newQuotationTerm.trim()],
    });
    setNewQuotationTerm('');
  };

  const handleRemoveQuotationTerm = (index: number) => {
    onChangeTemplate({
      ...template,
      defaultTermsQuotation: (template.defaultTermsQuotation || []).filter((_, i) => i !== index),
    });
  };

  const handleAddInvoiceTerm = () => {
    if (!newInvoiceTerm.trim()) return;
    onChangeTemplate({
      ...template,
      defaultTermsInvoice: [...(template.defaultTermsInvoice || []), newInvoiceTerm.trim()],
    });
    setNewInvoiceTerm('');
  };

  const handleRemoveInvoiceTerm = (index: number) => {
    onChangeTemplate({
      ...template,
      defaultTermsInvoice: (template.defaultTermsInvoice || []).filter((_, i) => i !== index),
    });
  };

  const handleAddReceiptTerm = () => {
    if (!newReceiptTerm.trim()) return;
    onChangeTemplate({
      ...template,
      defaultTermsReceipt: [...(template.defaultTermsReceipt || []), newReceiptTerm.trim()],
    });
    setNewReceiptTerm('');
  };

  const handleRemoveReceiptTerm = (index: number) => {
    onChangeTemplate({
      ...template,
      defaultTermsReceipt: (template.defaultTermsReceipt || []).filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (onSaveTemplate) {
      setIsSaving(true);
      try {
        await onSaveTemplate();
        showSuccess('Template settings saved successfully!');
      } catch (err: any) {
        showError('Failed to save template', err.message);
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
            <Palette className="w-5 h-5 text-brand" />
            Document Template & Terms Configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active Template: <span className="font-bold text-slate-800 dark:text-slate-200">{template.name}</span>. Configure visual themes and default statutory legal terms.
          </p>
        </div>

        {onSaveTemplate && (
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Template'}</span>
          </button>
        )}
      </div>

      {/* Visual Design Settings */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
          Visual Layout & Branding Colors
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => onChangeTemplate({ ...template, name: e.target.value })}
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Header Style
            </label>
            <select
              value={template.headerStyle}
              onChange={(e) => onChangeTemplate({ ...template, headerStyle: e.target.value as any })}
              className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            >
              <option value="standard">Standard Corporate (Full Header Bar)</option>
              <option value="modern">Modern Minimalist</option>
              <option value="compact">Compact Dense (Maximum Rows)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={template.brandPrimaryColor || '#20254a'}
                onChange={(e) => onChangeTemplate({ ...template, brandPrimaryColor: e.target.value })}
                className="w-10 h-10 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={template.brandPrimaryColor || '#20254a'}
                onChange={(e) => onChangeTemplate({ ...template, brandPrimaryColor: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={template.brandAccentColor || '#12b8ed'}
                onChange={(e) => onChangeTemplate({ ...template, brandAccentColor: e.target.value })}
                className="w-10 h-10 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={template.brandAccentColor || '#12b8ed'}
                onChange={(e) => onChangeTemplate({ ...template, brandAccentColor: e.target.value })}
                className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Terms Management */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
          Default Quotation Terms ({template.defaultTermsQuotation?.length || 0})
        </div>

        <div className="space-y-2 max-h-52 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
          {(template.defaultTermsQuotation || []).map((term, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            >
              <span className="flex-1 font-medium text-slate-800 dark:text-slate-200">{term}</span>
              <button
                type="button"
                onClick={() => handleRemoveQuotationTerm(i)}
                aria-label={`Remove quotation term ${i + 1}`}
                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new quotation term..."
            value={newQuotationTerm}
            onChange={(e) => setNewQuotationTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuotationTerm())}
            className="flex-1 h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-brand"
          />
          <button
            type="button"
            onClick={handleAddQuotationTerm}
            className="bg-brand hover:bg-brand-600 text-white h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Term
          </button>
        </div>
      </div>

      {/* Invoice Terms Management */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
          Default Tax Invoice Terms ({template.defaultTermsInvoice?.length || 0})
        </div>

        <div className="space-y-2 max-h-52 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
          {(template.defaultTermsInvoice || []).map((term, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            >
              <span className="flex-1 font-medium text-slate-800 dark:text-slate-200">{term}</span>
              <button
                type="button"
                onClick={() => handleRemoveInvoiceTerm(i)}
                aria-label={`Remove invoice term ${i + 1}`}
                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new invoice term..."
            value={newInvoiceTerm}
            onChange={(e) => setNewInvoiceTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInvoiceTerm())}
            className="flex-1 h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-brand"
          />
          <button
            type="button"
            onClick={handleAddInvoiceTerm}
            className="bg-brand hover:bg-brand-600 text-white h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Term
          </button>
        </div>
      </div>

      {/* Receipt Terms Management */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
          Default Payment Receipt Terms ({template.defaultTermsReceipt?.length || 0})
        </div>

        <div className="space-y-2 max-h-52 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-200 dark:border-slate-700 rounded-xl">
          {(template.defaultTermsReceipt || []).map((term, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
            >
              <span className="flex-1 font-medium text-slate-800 dark:text-slate-200">{term}</span>
              <button
                type="button"
                onClick={() => handleRemoveReceiptTerm(i)}
                aria-label={`Remove receipt term ${i + 1}`}
                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add new receipt term..."
            value={newReceiptTerm}
            onChange={(e) => setNewReceiptTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReceiptTerm())}
            className="flex-1 h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:border-brand"
          />
          <button
            type="button"
            onClick={handleAddReceiptTerm}
            className="bg-brand hover:bg-brand-600 text-white h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Term
          </button>
        </div>
      </div>
    </div>
  );
};
