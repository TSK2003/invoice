import React, { useState } from 'react';
import { DocumentData, DocumentType, DocumentStatus, DocumentItem, TaxConfig } from '../../types/document';
import { DocumentTypeSelector } from './DocumentTypeSelector';
import { PackageSelector } from './PackageSelector';
import { ClientForm } from './ClientForm';
import { ItemEditor } from './ItemEditor';
import { TaxEditor } from './TaxEditor';
import { PaymentTermsEditor } from './PaymentTermsEditor';
import { LivePreview } from '../preview/LivePreview';
import { FormErrors, validateDocumentForm } from '../../utils/validator';
import { ServicePackage } from '../../types/package';
import { calculateTaxTotals } from '../../utils/taxCalculator';
import { ChevronDown, ChevronUp, FileText, UserCheck, Package, ListOrdered, Percent, CreditCard, Save, Eye, Edit3, Lock, Columns } from 'lucide-react';

interface BuilderProps {
  document: DocumentData;
  onChangeDocument: (doc: DocumentData) => void;
  onSaveDocument: () => void;
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
  const [desktopLayout, setDesktopLayout] = useState<'split' | 'form' | 'preview'>('split');

  // Accordion Section States
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    typeAndMeta: true,
    client: true,
    package: true,
    items: true,
    tax: true,
    payment: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
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
    const updated = {
      ...doc,
      client: {
        ...doc.client,
        [field]: value,
      },
    };
    onChangeDocument(updated);
  };

  // Central financial engine to recalculate items, taxes, totals, and payment milestones
  const recalculateDocumentWithItems = (
    newItems: DocumentItem[],
    baseDoc: DocumentData = doc
  ): DocumentData => {
    // 1. Normalize line items
    const normalizedItems: DocumentItem[] = newItems.map((item, idx) => {
      const sNo = idx + 1;
      if (item.isIncluded) {
        return {
          ...item,
          sNo,
          rate: 0,
          discount: 0,
          taxableValue: 0,
          amount: 0,
        };
      }
      const qty = typeof item.quantity === 'number' ? item.quantity : (parseFloat(String(item.quantity)) || 1);
      const rate = item.rate || 0;
      const discount = item.discount || 0;
      const taxableValue = Math.max(0, (qty * rate) - discount);
      return {
        ...item,
        sNo,
        quantity: qty,
        rate,
        discount,
        taxableValue,
        amount: taxableValue,
      };
    });

    // 2. Recalculate tax subtotal, CGST, SGST, IGST, round-off and grand total
    const taxConfig = calculateTaxTotals(
      normalizedItems,
      baseDoc.tax.taxType,
      baseDoc.tax.gstRate,
      baseDoc.tax.roundOff
    );

    // 3. Recalculate payment milestone amounts based on new grandTotal
    const grandTotal = taxConfig.grandTotal;
    const advPct = baseDoc.paymentTerms?.advancePercentage ?? 50;
    const advanceAmount = Math.round(grandTotal * (advPct / 100));
    const balanceAmount = grandTotal - advanceAmount;

    // 4. Update receipt details if applicable
    const receiptDetails = baseDoc.receiptDetails ? {
      ...baseDoc.receiptDetails,
      invoiceTotal: grandTotal,
      balanceDue: Math.max(0, grandTotal - (baseDoc.receiptDetails.amountReceived || 0)),
    } : undefined;

    return {
      ...baseDoc,
      items: normalizedItems,
      tax: taxConfig,
      paymentTerms: {
        ...baseDoc.paymentTerms,
        advanceAmount,
        balanceAmount,
      },
      receiptDetails,
    };
  };

  const handleItemsChange = (newItems: DocumentItem[]) => {
    const updated = recalculateDocumentWithItems(newItems);
    onChangeDocument(updated);
  };

  // Handle Package Selection & auto-add inclusions
  const handleSelectPackage = (pkg: ServicePackage) => {
    // Build package main item
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

    // Build standard inclusion items
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

    // Keep any custom user add-ons that were added previously
    const customUserItems = doc.items.filter(item =>
      !item.id.startsWith('item-pkg-') &&
      !item.id.startsWith('item-inc-') &&
      !item.id.startsWith('item-main-')
    );

    const newItems = [mainItem, ...inclusionItems, ...customUserItems];
    const updated = recalculateDocumentWithItems(newItems, {
      ...doc,
      packageId: pkg.id,
      packageName: pkg.name,
    });

    onChangeDocument(updated);
  };

  const handleAddCustomAddon = (description: string, price: number, isIncluded: boolean = false) => {
    const newItem: DocumentItem = {
      id: `item-addon-${Date.now()}`,
      sNo: doc.items.length + 1,
      description,
      sacHsn: '998314',
      quantity: isIncluded ? '—' : 1,
      rate: isIncluded ? 0 : price,
      discount: 0,
      taxRate: doc.tax.gstRate || 18,
      taxableValue: isIncluded ? 0 : price,
      amount: isIncluded ? 0 : price,
      isIncluded,
    };

    const updated = recalculateDocumentWithItems([...doc.items, newItem]);
    onChangeDocument(updated);
  };

  const handleTaxChange = (newTax: TaxConfig) => {
    const grandTotal = newTax.grandTotal;
    const advPct = doc.paymentTerms?.advancePercentage ?? 50;
    const advanceAmount = Math.round(grandTotal * (advPct / 100));
    const balanceAmount = grandTotal - advanceAmount;

    onChangeDocument({
      ...doc,
      tax: newTax,
      paymentTerms: {
        ...doc.paymentTerms,
        advanceAmount,
        balanceAmount,
      },
    });
  };

  const handleSave = () => {
    const errs = validateDocumentForm({
      clientCompanyName: doc.client.companyName,
      clientEmail: doc.client.email,
      clientPhone: doc.client.phone,
      clientGstin: doc.client.gstin,
      documentNumber: doc.documentNumber,
    });

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      alert('Please correct the validation errors in the form before saving.');
      return;
    }

    onSaveDocument();
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-72px)]">
      {/* Mobile / Tablet Segmented Tab Switcher (< lg screens) */}
      <div className="no-print print:hidden lg:hidden flex items-center bg-surface border-b border-line p-2 sticky top-[72px] z-30 shadow-subtle">
        <button
          type="button"
          onClick={() => setMobileActiveTab('form')}
          className={`flex-1 py-2 text-xs font-semibold rounded-sm transition-all flex items-center justify-center gap-1.5 ${
            mobileActiveTab === 'form'
              ? 'bg-brand text-white shadow-subtle'
              : 'text-secondary hover:text-primary hover:bg-page'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Form</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-sm transition-all flex items-center justify-center gap-1.5 ${
            mobileActiveTab === 'preview'
              ? 'bg-brand text-white shadow-subtle'
              : 'text-secondary hover:text-primary hover:bg-page'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live A4 Preview</span>
        </button>
      </div>

      {/* Desktop Responsive Layout Switcher (>= lg screens) */}
      <div className="no-print print:hidden hidden lg:flex items-center justify-between bg-surface border-b border-line px-6 py-2 sticky top-[72px] z-30 shadow-subtle">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            {doc.type === 'quotation' ? 'Quotation Studio' : doc.type === 'tax_invoice' ? 'Tax Invoice Studio' : 'Payment Receipt Studio'}
          </span>
          <span className="text-[11px] bg-page border border-line text-brand px-2 py-0.5 rounded font-mono font-bold">
            {doc.documentNumber}
          </span>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1 bg-page p-0.5 rounded border border-line">
          <button
            type="button"
            onClick={() => setDesktopLayout('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              desktopLayout === 'split'
                ? 'bg-surface text-brand shadow-xs border border-line'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            type="button"
            onClick={() => setDesktopLayout('form')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              desktopLayout === 'form'
                ? 'bg-surface text-brand shadow-xs border border-line'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Form Focus (Full Width)</span>
          </button>

          <button
            type="button"
            onClick={() => setDesktopLayout('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all ${
              desktopLayout === 'preview'
                ? 'bg-surface text-brand shadow-xs border border-line'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Focus</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1">
        {/* LEFT PANEL */}
        <div className={`no-print print:hidden p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-112px)] bg-page border-r border-line ${
          mobileActiveTab === 'form' ? 'block' : 'hidden lg:block'
        } ${
          desktopLayout === 'form'
            ? 'lg:col-span-12'
            : desktopLayout === 'preview'
            ? 'lg:hidden'
            : 'lg:col-span-6 xl:col-span-7'
        }`}>
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xs font-bold text-primary uppercase tracking-wider">
              Document Form & Parameters
            </h2>
            <span className="text-[11px] text-secondary font-medium">
              Live preview synced
            </span>
          </div>

          {/* SECTION 1: DOCUMENT TYPE & METADATA */}
          <div className="bg-surface rounded-md border border-line shadow-subtle overflow-hidden">
          <div
            onClick={() => toggleSection('typeAndMeta')}
            className="p-3 bg-surface border-b border-line flex items-center justify-between cursor-pointer hover:bg-page transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-brand" />
              <span className="font-bold text-[11px] text-primary uppercase tracking-wider">
                01  Document Type & Metadata
              </span>
            </div>
            {openSections.typeAndMeta ? <ChevronUp className="w-3.5 h-3.5 text-secondary" /> : <ChevronDown className="w-3.5 h-3.5 text-secondary" />}
          </div>

          {openSections.typeAndMeta && (
            <div className="p-3.5 space-y-3.5">
              {/* Document Type Selector */}
              <DocumentTypeSelector
                selectedType={doc.type}
                onChange={type => onTypeChange(type)}
              />

              {/* Number, Date, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs border-t border-line pt-3">
                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">Doc Number</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={doc.documentNumber}
                      className="w-full h-9 pl-8 pr-16 bg-page border border-line rounded-sm font-mono font-bold text-primary text-xs cursor-not-allowed select-none opacity-95"
                    />
                    <Lock className="w-3.5 h-3.5 text-secondary absolute left-2.5 pointer-events-none" />
                    <span className="absolute right-2 text-[10px] text-secondary font-semibold uppercase tracking-wider bg-surface px-1.5 py-0.5 rounded border border-line pointer-events-none">
                      Fixed
                    </span>
                  </div>
                  <span className="text-[10px] text-secondary mt-0.5 block">Unique auto-generated ID (non-editable)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={doc.date}
                    onChange={e => updateField('date', e.target.value)}
                    className="w-full h-9 px-2 border border-line rounded-sm text-primary text-xs focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-secondary mb-1">
                    {doc.type === 'quotation' ? 'Valid Until' : doc.type === 'tax_invoice' ? 'Due Date' : 'Receipt Date'}
                  </label>
                  <input
                    type="date"
                    value={doc.validUntilOrDueDate}
                    onChange={e => updateField('validUntilOrDueDate', e.target.value)}
                    className="w-full h-9 px-2 border border-line rounded-sm text-primary text-xs focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Status</label>
                <select
                  value={doc.status}
                  onChange={e => updateField('status', e.target.value as DocumentStatus)}
                  className="w-full h-9 px-2.5 border border-line rounded-sm text-xs font-semibold bg-surface text-primary focus:border-brand"
                >
                  {doc.type === 'quotation' && (
                    <>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </>
                  )}

                  {doc.type === 'tax_invoice' && (
                    <>
                      <option value="draft">Draft</option>
                      <option value="issued">Issued</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}

                  {doc.type === 'payment_receipt' && (
                    <>
                      <option value="generated">Generated</option>
                      <option value="issued">Issued</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: CLIENT DETAILS */}
        <div className="bg-surface rounded-md border border-line shadow-subtle overflow-hidden">
          <div
            onClick={() => toggleSection('client')}
            className="p-3 bg-surface border-b border-line flex items-center justify-between cursor-pointer hover:bg-page transition-colors"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-brand" />
              <span className="font-bold text-[11px] text-primary uppercase tracking-wider">
                02  Client Information
              </span>
            </div>
            {openSections.client ? <ChevronUp className="w-3.5 h-3.5 text-secondary" /> : <ChevronDown className="w-3.5 h-3.5 text-secondary" />}
          </div>

          {openSections.client && (
            <div className="p-3.5">
              <ClientForm
                client={doc.client}
                onChange={updateClientField}
                errors={errors}
              />
            </div>
          )}
        </div>

        {/* SECTION 3: PACKAGE SELECTOR (For Quotation) */}
        {doc.type === 'quotation' && (
          <div className="bg-surface rounded-md border border-line shadow-subtle overflow-hidden">
            <div
              onClick={() => toggleSection('package')}
              className="p-3 bg-surface border-b border-line flex items-center justify-between cursor-pointer hover:bg-page transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-brand" />
                <span className="font-bold text-[11px] text-primary uppercase tracking-wider">
                  03  Package & Scope Configuration
                </span>
              </div>
              {openSections.package ? <ChevronUp className="w-3.5 h-3.5 text-secondary" /> : <ChevronDown className="w-3.5 h-3.5 text-secondary" />}
            </div>

            {openSections.package && (
              <div className="p-3.5">
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
          <div className="bg-surface rounded-md border border-line shadow-subtle overflow-hidden">
            <div
              onClick={() => toggleSection('items')}
              className="p-3 bg-surface border-b border-line flex items-center justify-between cursor-pointer hover:bg-page transition-colors"
            >
              <div className="flex items-center gap-2">
                <ListOrdered className="w-3.5 h-3.5 text-brand" />
                <span className="font-bold text-[11px] text-primary uppercase tracking-wider">
                  04  Items & Services ({doc.items.length})
                </span>
              </div>
              {openSections.items ? <ChevronUp className="w-3.5 h-3.5 text-secondary" /> : <ChevronDown className="w-3.5 h-3.5 text-secondary" />}
            </div>

            {openSections.items && (
              <div className="p-3.5">
                <ItemEditor
                  items={doc.items}
                  onChangeItems={handleItemsChange}
                />
              </div>
            )}
          </div>
        )}

        {/* RECEIPT SPECIFIC DETAILS */}
        {doc.type === 'payment_receipt' && (
          <div className="bg-surface rounded-md border border-line shadow-subtle overflow-hidden">
            <div className="p-3 bg-surface border-b border-line font-bold text-[11px] text-primary uppercase tracking-wider">
              Payment Receipt Transaction Details
            </div>
            <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Invoice Ref Number</label>
                <input
                  type="text"
                  placeholder="e.g. AES-INV-2026-001"
                  value={doc.receiptDetails?.invoiceReference || ''}
                  onChange={e =>
                    updateField('receiptDetails', {
                      ...doc.receiptDetails,
                      invoiceReference: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 border border-line rounded-sm font-mono text-primary text-xs focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Payment Method</label>
                <select
                  value={doc.receiptDetails?.paymentMethod || 'UPI'}
                  onChange={e =>
                    updateField('receiptDetails', {
                      ...doc.receiptDetails,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full h-9 px-2.5 border border-line rounded-sm bg-surface text-primary text-xs focus:border-brand"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Amount Received ₹</label>
                <input
                  type="number"
                  value={doc.receiptDetails?.amountReceived || 0}
                  onChange={e =>
                    updateField('receiptDetails', {
                      ...doc.receiptDetails,
                      amountReceived: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full h-9 px-3 border border-line rounded-sm font-bold text-brand text-xs focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">Transaction Ref / Txn ID</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/628491028471/HDFC"
                  value={doc.receiptDetails?.transactionReference || ''}
                  onChange={e =>
                    updateField('receiptDetails', {
                      ...doc.receiptDetails,
                      transactionReference: e.target.value,
                    })
                  }
                  className="w-full h-9 px-3 border border-line rounded-sm font-mono text-primary text-xs focus:border-brand"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: GST / TAX ENGINE */}
        {doc.type !== 'payment_receipt' && (
          <div className="bg-surface rounded-md border border-line shadow-subtle overflow-hidden">
            <div
              onClick={() => toggleSection('tax')}
              className="p-3 bg-surface border-b border-line flex items-center justify-between cursor-pointer hover:bg-page transition-colors"
            >
              <div className="flex items-center gap-2">
                <Percent className="w-3.5 h-3.5 text-brand" />
                <span className="font-bold text-[11px] text-primary uppercase tracking-wider">
                  05  GST & Tax Engine
                </span>
              </div>
              {openSections.tax ? <ChevronUp className="w-3.5 h-3.5 text-secondary" /> : <ChevronDown className="w-3.5 h-3.5 text-secondary" />}
            </div>

            {openSections.tax && (
              <div className="p-3.5">
                <TaxEditor
                  tax={doc.tax}
                  onChangeTax={handleTaxChange}
                  taxableSubtotal={doc.tax.taxableValueTotal}
                />
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: PAYMENT TERMS */}
        {doc.type === 'quotation' && (
          <div className="bg-surface rounded-md border border-line shadow-subtle overflow-hidden">
            <div
              onClick={() => toggleSection('payment')}
              className="p-3 bg-surface border-b border-line flex items-center justify-between cursor-pointer hover:bg-page transition-colors"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-brand" />
                <span className="font-bold text-[11px] text-primary uppercase tracking-wider">
                  06  Payment Milestone Terms
                </span>
              </div>
              {openSections.payment ? <ChevronUp className="w-3.5 h-3.5 text-secondary" /> : <ChevronDown className="w-3.5 h-3.5 text-secondary" />}
            </div>

            {openSections.payment && (
              <div className="p-3.5">
                <PaymentTermsEditor
                  terms={doc.paymentTerms}
                  onChangeTerms={terms => updateField('paymentTerms', terms)}
                  grandTotal={doc.tax.grandTotal}
                />
              </div>
            )}
          </div>
        )}

        {/* SAVE & SUBMIT */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-brand hover:bg-brand-600 text-white font-semibold text-xs py-2.5 rounded-sm shadow-subtle transition-colors flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            <Save className="w-3.5 h-3.5" />
            Save Document to System
          </button>
        </div>
      </div>

        {/* RIGHT PANEL - LIVE PREVIEW */}
        <div className={`h-full ${
          mobileActiveTab === 'preview' ? 'block' : 'hidden lg:block'
        } ${
          desktopLayout === 'preview'
            ? 'lg:col-span-12'
            : desktopLayout === 'form'
            ? 'lg:hidden'
            : 'lg:col-span-6 xl:col-span-5'
        }`}>
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

