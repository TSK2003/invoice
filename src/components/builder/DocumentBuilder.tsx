import React, { useState } from 'react';
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
import { ChevronDown, ChevronUp, FileText, UserCheck, Package, ListOrdered, Percent, CreditCard } from 'lucide-react';

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

    const newItems = [mainItem, ...inclusionItems];

    // Recalculate tax
    const taxableTotal = pkg.basePrice;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (doc.tax.taxType === 'cgst_sgst') {
      const halfRate = (doc.tax.gstRate || 18) / 2;
      cgstAmount = Math.round(taxableTotal * (halfRate / 100));
      sgstAmount = Math.round(taxableTotal * (halfRate / 100));
    } else if (doc.tax.taxType === 'igst') {
      igstAmount = Math.round(taxableTotal * ((doc.tax.gstRate || 18) / 100));
    }

    const taxTotal = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = Math.round(taxableTotal + taxTotal + doc.tax.roundOff);

    // Recalculate payment terms
    const advAmt = Math.round(grandTotal * (doc.paymentTerms.advancePercentage / 100));
    const balAmt = grandTotal - advAmt;

    const updated: DocumentData = {
      ...doc,
      packageId: pkg.id,
      packageName: pkg.name,
      items: newItems,
      tax: {
        ...doc.tax,
        taxableValueTotal: taxableTotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        taxTotal,
        grandTotal,
      },
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

    // Recalculate subtotal
    const newTaxableTotal = newItems.reduce(
      (sum, item) => (item.isIncluded ? sum : sum + (item.taxableValue || 0)),
      0
    );

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (doc.tax.taxType === 'cgst_sgst') {
      const halfRate = (doc.tax.gstRate || 18) / 2;
      cgstAmount = Math.round(newTaxableTotal * (halfRate / 100));
      sgstAmount = Math.round(newTaxableTotal * (halfRate / 100));
    } else if (doc.tax.taxType === 'igst') {
      igstAmount = Math.round(newTaxableTotal * ((doc.tax.gstRate || 18) / 100));
    }

    const taxTotal = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = Math.round(newTaxableTotal + taxTotal + doc.tax.roundOff);

    const advAmt = Math.round(grandTotal * (doc.paymentTerms.advancePercentage / 100));
    const balAmt = grandTotal - advAmt;

    onChangeDocument({
      ...doc,
      items: newItems,
      tax: {
        ...doc.tax,
        taxableValueTotal: newTaxableTotal,
        cgstAmount,
        sgstAmount,
        igstAmount,
        taxTotal,
        grandTotal,
      },
      paymentTerms: {
        ...doc.paymentTerms,
        advanceAmount: advAmt,
        balanceAmount: balAmt,
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[calc(100vh-4rem)]">
      {/* LEFT PANEL (~42% width on desktop) */}
      <div className="lg:col-span-5 p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-4rem)] bg-slate-100/70 border-r border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-navy uppercase tracking-wider">
            Document Form & Settings
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Live auto-preview enabled
          </span>
        </div>

        {/* SECTION 1: DOCUMENT TYPE & METADATA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-panel overflow-hidden">
          <div
            onClick={() => toggleSection('typeAndMeta')}
            className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-brand" />
              <span className="font-extrabold text-xs text-navy uppercase tracking-wider">
                1. Document Type & Meta Info
              </span>
            </div>
            {openSections.typeAndMeta ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {openSections.typeAndMeta && (
            <div className="p-4 space-y-4">
              {/* Document Type Selector */}
              <DocumentTypeSelector
                selectedType={doc.type}
                onChange={type => onTypeChange(type)}
              />

              {/* Number, Date, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-slate-100 pt-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Doc Number</label>
                  <input
                    type="text"
                    value={doc.documentNumber}
                    onChange={e => updateField('documentNumber', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-navy focus:ring-2 focus:ring-blue-brand/30"
                  />
                  {errors.documentNumber && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">{errors.documentNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={doc.date}
                    onChange={e => updateField('date', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-blue-brand/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {doc.type === 'quotation' ? 'Valid Until' : doc.type === 'tax_invoice' ? 'Due Date' : 'Receipt Date'}
                  </label>
                  <input
                    type="date"
                    value={doc.validUntilOrDueDate}
                    onChange={e => updateField('validUntilOrDueDate', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-blue-brand/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Status</label>
                <select
                  value={doc.status}
                  onChange={e => updateField('status', e.target.value as DocumentStatus)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold bg-white focus:ring-2 focus:ring-blue-brand/30"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-panel overflow-hidden">
          <div
            onClick={() => toggleSection('client')}
            className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-brand" />
              <span className="font-extrabold text-xs text-navy uppercase tracking-wider">
                2. Client Information
              </span>
            </div>
            {openSections.client ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {openSections.client && (
            <div className="p-4">
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-panel overflow-hidden">
            <div
              onClick={() => toggleSection('package')}
              className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-brand" />
                <span className="font-extrabold text-xs text-navy uppercase tracking-wider">
                  3. AESCION Package & Add-ons
                </span>
              </div>
              {openSections.package ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-panel overflow-hidden">
            <div
              onClick={() => toggleSection('items')}
              className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-blue-brand" />
                <span className="font-extrabold text-xs text-navy uppercase tracking-wider">
                  4. Items & Services Builder ({doc.items.length})
                </span>
              </div>
              {openSections.items ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {openSections.items && (
              <div className="p-4">
                <ItemEditor
                  items={doc.items}
                  onChangeItems={items => updateField('items', items)}
                />
              </div>
            )}
          </div>
        )}

        {/* RECEIPT SPECIFIC DETAILS */}
        {doc.type === 'payment_receipt' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-panel overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-navy uppercase tracking-wider">
              Payment Receipt Transaction Details
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Ref Number</label>
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-navy"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={doc.receiptDetails?.paymentMethod || 'UPI'}
                  onChange={e =>
                    updateField('receiptDetails', {
                      ...doc.receiptDetails,
                      paymentMethod: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold bg-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Received ₹</label>
                <input
                  type="number"
                  value={doc.receiptDetails?.amountReceived || 0}
                  onChange={e =>
                    updateField('receiptDetails', {
                      ...doc.receiptDetails,
                      amountReceived: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-extrabold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Txn ID</label>
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
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: GST / TAX ENGINE */}
        {doc.type !== 'payment_receipt' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-panel overflow-hidden">
            <div
              onClick={() => toggleSection('tax')}
              className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-brand" />
                <span className="font-extrabold text-xs text-navy uppercase tracking-wider">
                  5. GST & Tax Engine
                </span>
              </div>
              {openSections.tax ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {openSections.tax && (
              <div className="p-4">
                <TaxEditor
                  tax={doc.tax}
                  onChangeTax={tax => updateField('tax', tax)}
                  taxableSubtotal={doc.tax.taxableValueTotal}
                />
              </div>
            )}
          </div>
        )}

        {/* SECTION 6: PAYMENT TERMS */}
        {doc.type === 'quotation' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-panel overflow-hidden">
            <div
              onClick={() => toggleSection('payment')}
              className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-brand" />
                <span className="font-extrabold text-xs text-navy uppercase tracking-wider">
                  6. Payment Milestone Terms
                </span>
              </div>
              {openSections.payment ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {openSections.payment && (
              <div className="p-4">
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
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-blue-brand hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all active:scale-[0.99] uppercase tracking-wider"
          >
            Save Document to System
          </button>
        </div>
      </div>

      {/* RIGHT PANEL (~58% width on desktop) - LIVE PREVIEW */}
      <div className="lg:col-span-7 h-full">
        <LivePreview
          data={doc}
          onDownloadPDF={onDownloadPDF}
          onPrint={onPrint}
          onSaveDraft={handleSave}
        />
      </div>
    </div>
  );
};
