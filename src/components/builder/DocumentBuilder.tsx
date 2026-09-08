import React, { useState, useEffect } from 'react';
import { DocumentData, DocumentType, DocumentStatus, DocumentItem } from '../../types/document';
import { DocumentTypeSelector } from './DocumentTypeSelector';
import { PackageSelector } from './PackageSelector';
import { ClientForm } from './ClientForm';
import { ItemEditor } from './ItemEditor';
import { TaxEditor } from './TaxEditor';
import { PaymentTermsEditor } from './PaymentTermsEditor';
import { LivePreview } from '../preview/LivePreview';
import { FormErrors, validateDocumentForm } from '../../utils/validator';
import { ServicePackage } from '../../types/package';
import { calculateDocumentTax, determineTaxType } from '../../services/tax/taxEngine';
import { getNextDocumentNumber, saveDocumentToFirestore } from '../../services/firebase/firestore';
import { useToast } from '../../app/providers/ToastProvider';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  UserCheck, 
  Package, 
  ListOrdered, 
  Percent, 
  CreditCard, 
  Save, 
  Eye, 
  Edit3,
  Lock,
  ArrowRightLeft,
  FileCheck,
  AlignLeft,
  Copy
} from 'lucide-react';
import { roundMoney } from '../../utils/money';
import { useNavigate } from 'react-router-dom';

interface BuilderProps {
  document: DocumentData;
  onChangeDocument: (doc: DocumentData) => void;
  onSaveDocument: () => Promise<void> | void;
  onDownloadPDF: () => void;
  onPrint: () => void;
  onTypeChange: (newType: DocumentType) => void;
}

export const DocumentBuilder: React.FC<BuilderProps> = ({
  document: doc,
  onChangeDocument,
  onSaveDocument,
  onDownloadPDF,
  onPrint,
  onTypeChange,
}) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [mobileActiveTab, setMobileActiveTab] = useState<'form' | 'preview'>('form');
  const [isConverting, setIsConverting] = useState(false);
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();

  // Accordion Section States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    typeAndMeta: true,
    client: true,
    package: true,
    items: true,
    tax: true,
    payment: true,
    notesAndTerms: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Field change handlers
  const updateField = (field: keyof DocumentData, value: any) => {
    const updated = {
      ...doc,
      [field]: value,
    };
    onChangeDocument(updated);
  };

  const updateClientField = (field: string, value: string) => {
    const updatedClient = {
      ...doc.client,
      [field]: value,
    };

    // Auto update tax type if state code changed
    let currentTaxType = doc.tax.taxType;
    if (field === 'stateCode' || field === 'state') {
      currentTaxType = determineTaxType(doc.company.stateCode, updatedClient.stateCode);
    }

    const taxResult = calculateDocumentTax(
      doc.items,
      currentTaxType,
      doc.tax.gstRate,
      doc.tax.roundOff,
      false
    );

    const updated = {
      ...doc,
      client: updatedClient,
      tax: taxResult.tax,
    };
    onChangeDocument(updated);
  };

  // Items change handler with automatic tax recalculation
  const handleItemsChange = (newItems: DocumentItem[]) => {
    const taxResult = calculateDocumentTax(
      newItems,
      doc.tax.taxType,
      doc.tax.gstRate,
      doc.tax.roundOff,
      false
    );

    const grandTotal = taxResult.tax.grandTotal;
    const advAmt = roundMoney(grandTotal * (doc.paymentTerms.advancePercentage / 100));
    const balAmt = roundMoney(grandTotal - advAmt);

    onChangeDocument({
      ...doc,
      items: taxResult.items,
      tax: taxResult.tax,
      paymentTerms: {
        ...doc.paymentTerms,
        advanceAmount: advAmt,
        balanceAmount: balAmt,
      },
    });
  };

  // Handle Package Selection & auto-add inclusions using taxEngine
  const handleSelectPackage = (pkg: ServicePackage) => {
    const mainItem: DocumentItem = {
      id: `item-pkg-${Date.now()}`,
      sNo: 1,
      description: `${pkg.name} Development — ${pkg.maxPagesText}`,
      sacHsn: '998314',
      quantity: 1,
      rate: pkg.basePrice,
      discount: 0,
      taxRate: doc.tax.gstRate || 18,
      taxableValue: pkg.basePrice,
      amount: pkg.basePrice,
      isIncluded: false,
    };

    const inclusionItems: DocumentItem[] = pkg.includedServices.map((inc, i) => ({
      id: `item-inc-${Date.now()}-${i}`,
      sNo: i + 2,
      description: `${inc} (Included)`,
      sacHsn: '—',
      quantity: '—',
      rate: 0,
      discount: 0,
      taxRate: 0,
      taxableValue: 0,
      amount: 0,
      isIncluded: true,
    }));

    const newItems = [mainItem, ...inclusionItems];
    const taxResult = calculateDocumentTax(
      newItems,
      doc.tax.taxType,
      doc.tax.gstRate,
      doc.tax.roundOff,
      false
    );

    const grandTotal = taxResult.tax.grandTotal;
    const advAmt = roundMoney(grandTotal * (doc.paymentTerms.advancePercentage / 100));
    const balAmt = roundMoney(grandTotal - advAmt);

    const updated: DocumentData = {
      ...doc,
      packageId: pkg.id,
      packageName: pkg.name,
      items: taxResult.items,
      tax: taxResult.tax,
      paymentTerms: {
        ...doc.paymentTerms,
        advanceAmount: advAmt,
        balanceAmount: balAmt,
      },
    };

    onChangeDocument(updated);
  };

  const handleAddCustomAddon = (description: string, price: number) => {
    const newItem: DocumentItem = {
      id: `item-addon-${Date.now()}`,
      sNo: doc.items.length + 1,
      description,
      sacHsn: '998314',
      quantity: 1,
      rate: price,
      discount: 0,
      taxRate: doc.tax.gstRate || 18,
      taxableValue: price,
      amount: price,
      isIncluded: false,
    };

    const newItems = [...doc.items, newItem];
    const taxResult = calculateDocumentTax(
      newItems,
      doc.tax.taxType,
      doc.tax.gstRate,
      doc.tax.roundOff,
      false
    );

    const grandTotal = taxResult.tax.grandTotal;
    const advAmt = roundMoney(grandTotal * (doc.paymentTerms.advancePercentage / 100));
    const balAmt = roundMoney(grandTotal - advAmt);

    onChangeDocument({
      ...doc,
      items: taxResult.items,
      tax: taxResult.tax,
      paymentTerms: {
        ...doc.paymentTerms,
        advanceAmount: advAmt,
        balanceAmount: balAmt,
      },
    });
  };

  // Convert Quotation to Invoice
  const handleConvertToInvoice = async () => {
    setIsConverting(true);
    try {
      const invoiceNumber = await getNextDocumentNumber('tax_invoice');
      const invoiceId = `doc_inv_${Date.now()}`;
      const now = new Date().toISOString();

      const newInvoice: DocumentData = {
        ...doc,
        id: invoiceId,
        type: 'tax_invoice',
        documentNumber: invoiceNumber,
        status: 'issued',
        sourceQuotationId: doc.id,
        date: now.split('T')[0],
        validUntilOrDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isLocked: false,
        createdAt: now,
        updatedAt: now,
      };

      // Mark quotation as converted
      const updatedQuotation: DocumentData = {
        ...doc,
        status: 'converted',
        isLocked: true,
      };
      await saveDocumentToFirestore(updatedQuotation);
      await saveDocumentToFirestore(newInvoice);

      showSuccess(`Quotation converted to Invoice ${invoiceNumber}!`);
      navigate(`/documents/${invoiceId}`);
    } catch (err: any) {
      showError('Conversion Failed', err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSave = async () => {
    const errs = validateDocumentForm({
      clientCompanyName: doc.client.companyName,
      clientEmail: doc.client.email,
      clientPhone: doc.client.phone,
      clientGstin: doc.client.gstin,
      documentNumber: doc.documentNumber,
    });

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      showError('Validation Error', 'Please complete all required fields highlighted in red.');
      return;
    }

    try {
      await onSaveDocument();
    } catch (e: any) {
      showError('Failed to save document', e.message);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)]">
      {/* Finalized Document Integrity Banner */}
      {doc.isLocked && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <b>Locked Document:</b> This document has been finalized or issued. Changes are restricted to preserve statutory tax audit trails.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const duplicate: DocumentData = {
                ...doc,
                id: `doc_${Date.now()}`,
                status: 'draft',
                isLocked: false,
                documentNumber: `${doc.documentNumber}-REV`,
              };
              onChangeDocument(duplicate);
              showSuccess('Created editable revision copy!');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 transition-colors shadow-xs shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate as New Revision</span>
          </button>
        </div>
      )}

      {/* Mobile / Tablet Segmented Tab Switcher (< lg screens) */}
      <div className="no-print print:hidden lg:hidden flex items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 sticky top-[70px] z-30 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileActiveTab('form')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileActiveTab === 'form'
              ? 'bg-brand text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Parameters</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mobileActiveTab === 'preview'
              ? 'bg-brand text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live A4 Preview</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1">
        {/* LEFT PANEL: Form inputs */}
        <div
          className={`no-print print:hidden lg:col-span-6 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-70px)] bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 ${
            mobileActiveTab === 'form' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Document Parameters & Content
            </h2>
            {doc.type === 'quotation' && ['accepted', 'sent', 'draft'].includes(doc.status) && (
              <button
                type="button"
                disabled={isConverting}
                onClick={handleConvertToInvoice}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{isConverting ? 'Converting...' : 'Convert to Tax Invoice'}</span>
              </button>
            )}
          </div>

          {/* SECTION 1: DOCUMENT TYPE & METADATA */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div
              onClick={() => toggleSection('typeAndMeta')}
              className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  01  Document Type & Details
                </span>
              </div>
              {openSections.typeAndMeta ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSections.typeAndMeta && (
              <div className="p-4 space-y-4">
                <DocumentTypeSelector
                  selectedType={doc.type}
                  onChange={(type) => onTypeChange(type)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Document Number *
                    </label>
                    <input
                      type="text"
                      value={doc.documentNumber}
                      onChange={(e) => updateField('documentNumber', e.target.value)}
                      className={`w-full h-10 px-3 border rounded-lg font-mono font-bold text-slate-900 dark:text-white text-xs bg-white dark:bg-slate-800 focus:border-brand ${
                        errors.documentNumber ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                    {errors.documentNumber && (
                      <p className="text-[10px] text-rose-500 font-medium mt-1">
                        {errors.documentNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      value={doc.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs bg-white dark:bg-slate-800 focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {doc.type === 'quotation'
                        ? 'Valid Until'
                        : doc.type === 'tax_invoice'
                        ? 'Due Date'
                        : 'Receipt Date'}
                    </label>
                    <input
                      type="date"
                      value={doc.validUntilOrDueDate}
                      onChange={(e) => updateField('validUntilOrDueDate', e.target.value)}
                      className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs bg-white dark:bg-slate-800 focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Document Lifecycle Status
                  </label>
                  <select
                    value={doc.status}
                    onChange={(e) => updateField('status', e.target.value as DocumentStatus)}
                    className="w-full h-10 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
                  >
                    {doc.type === 'quotation' && (
                      <>
                        <option value="draft">Draft (Editing)</option>
                        <option value="sent">Sent to Client</option>
                        <option value="accepted">Accepted by Client</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                        <option value="converted">Converted to Tax Invoice</option>
                      </>
                    )}

                    {doc.type === 'tax_invoice' && (
                      <>
                        <option value="issued">Issued / Unpaid</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="paid">Paid in Full</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    )}

                    {doc.type === 'payment_receipt' && (
                      <>
                        <option value="generated">Receipt Generated</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: CLIENT DETAILS */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div
              onClick={() => toggleSection('client')}
              className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  02  Client Information & Destination State
                </span>
              </div>
              {openSections.client ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSections.client && (
              <div className="p-4">
                <ClientForm
                  client={doc.client}
                  onChange={updateClientField}
                  onSelectCustomer={(cust) => updateField('customerId', cust.id)}
                  errors={errors}
                />
              </div>
            )}
          </div>

          {/* SECTION 3: PACKAGE SELECTOR (For Quotation) */}
          {doc.type === 'quotation' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection('package')}
                className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    03  Package & Scope Presets
                  </span>
                </div>
                {openSections.package ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSections.package && (
                <div className="p-4">
                  <PackageSelector
                    selectedPackageId={doc.packageId}
                    onSelectPackage={handleSelectPackage}
                    onAddCustomAddon={handleAddCustomAddon}
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: ITEMS & SERVICES BUILDER */}
          {doc.type !== 'payment_receipt' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection('items')}
                className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-brand" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    04  Items & Services ({doc.items.length})
                  </span>
                </div>
                {openSections.items ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSections.items && (
                <div className="p-4">
                  <ItemEditor
                    items={doc.items}
                    onChangeItems={handleItemsChange}
                    defaultTaxRate={doc.tax.gstRate || 18}
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: GST / TAX ENGINE */}
          {doc.type !== 'payment_receipt' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection('tax')}
                className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-brand" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    05  GST & Tax Engine
                  </span>
                </div>
                {openSections.tax ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSections.tax && (
                <div className="p-4">
                  <TaxEditor
                    tax={doc.tax}
                    items={doc.items}
                    onChangeTax={(tax) => updateField('tax', tax)}
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: PAYMENT TERMS */}
          {doc.type === 'quotation' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div
                onClick={() => toggleSection('payment')}
                className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand" />
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    06  Payment Milestone Terms
                  </span>
                </div>
                {openSections.payment ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {openSections.payment && (
                <div className="p-4">
                  <PaymentTermsEditor
                    terms={doc.paymentTerms}
                    onChangeTerms={(terms) => updateField('paymentTerms', terms)}
                    grandTotal={doc.tax.grandTotal}
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 7: NOTES & TERMS */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div
              onClick={() => toggleSection('notesAndTerms')}
              className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-brand" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  07  Notes & Document Specific Terms
                </span>
              </div>
              {openSections.notesAndTerms ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {openSections.notesAndTerms && (
              <div className="p-4 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Special Remarks / Client Notes
                  </label>
                  <textarea
                    rows={2}
                    value={doc.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    placeholder="Optional notes or project delivery details..."
                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Terms & Conditions (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={(doc.termsAndConditions || []).join('\n')}
                    onChange={(e) =>
                      updateField(
                        'termsAndConditions',
                        e.target.value.split('\n').filter((s) => s.trim().length > 0)
                      )
                    }
                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:border-brand"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SAVE & SUBMIT */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full bg-brand hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              Save Document to Cloud Database
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW */}
        <div
          className={`lg:col-span-6 h-full ${
            mobileActiveTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <LivePreview
            data={doc}
            onDownloadPDF={onDownloadPDF}
            onPrint={onPrint}
            onSaveDraft={handleSave}
          />
        </div>
      </div>
    </div>
  );
};
