import React, { useState, useEffect } from 'react';
import { Payment, PaymentMethod } from '../../types/payment';
import { DocumentData } from '../../types/document';
import { fetchDocuments, fetchPaymentsByInvoice, saveDocumentToFirestore, getNextDocumentNumber } from '../../services/firebase/firestore';
import { formatCurrency } from '../../utils/currency';
import { roundMoney } from '../../utils/money';
import { CreditCard, Calendar, Hash, FileText, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../../app/providers/ToastProvider';

interface PaymentFormProps {
  initialInvoiceId?: string;
  onSave: (payment: Payment) => Promise<void>;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialInvoiceId,
  onSave,
  onCancel,
}) => {
  const [invoices, setInvoices] = useState<DocumentData[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(initialInvoiceId || '');
  const [selectedInvoice, setSelectedInvoice] = useState<DocumentData | null>(null);
  const [existingPaid, setExistingPaid] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [autoCreateReceipt, setAutoCreateReceipt] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showSuccess } = useToast();

  // Load unpaid or partially paid invoices
  useEffect(() => {
    async function loadInvoices() {
      const allDocs = await fetchDocuments();
      const taxInvoices = allDocs.filter(
        (d) => d.type === 'tax_invoice' && d.status !== 'cancelled'
      );
      setInvoices(taxInvoices);
      if (initialInvoiceId) {
        const matched = taxInvoices.find((inv) => inv.id === initialInvoiceId);
        if (matched) setSelectedInvoice(matched);
      }
    }
    loadInvoices();
  }, [initialInvoiceId]);

  // When invoice selection changes, calculate balance due
  useEffect(() => {
    async function updateBalance() {
      if (!selectedInvoiceId) {
        setSelectedInvoice(null);
        setExistingPaid(0);
        return;
      }
      const inv = invoices.find((i) => i.id === selectedInvoiceId);
      if (inv) {
        setSelectedInvoice(inv);
        const payments = await fetchPaymentsByInvoice(inv.id);
        const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        setExistingPaid(totalPaid);
        const remaining = roundMoney((inv.tax?.grandTotal || 0) - totalPaid);
        setAmount(remaining > 0 ? String(remaining) : '0');
      }
    }
    updateBalance();
  }, [selectedInvoiceId, invoices]);

  const grandTotal = selectedInvoice?.tax?.grandTotal || 0;
  const balanceDue = roundMoney(Math.max(0, grandTotal - existingPaid));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedInvoice) {
      setError('Please select an invoice.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    setIsSaving(true);
    try {
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      let receiptId: string | undefined = undefined;
      let receiptNumber: string | undefined = undefined;

      // Automatically generate Payment Receipt if requested
      if (autoCreateReceipt) {
        receiptId = `rcp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        receiptNumber = await getNextDocumentNumber('payment_receipt');

        const isFull = numAmount >= balanceDue;
        const newBalance = roundMoney(Math.max(0, balanceDue - numAmount));

        const receiptDoc: DocumentData = {
          id: receiptId,
          type: 'payment_receipt',
          documentNumber: receiptNumber,
          date: paymentDate,
          validUntilOrDueDate: paymentDate,
          status: 'generated',
          customerId: selectedInvoice.customerId,
          sourceInvoiceId: selectedInvoice.id,
          isLocked: true,
          client: selectedInvoice.client,
          company: selectedInvoice.company,
          customerSnapshot: selectedInvoice.client,
          companySnapshot: selectedInvoice.company,
          items: selectedInvoice.items,
          tax: selectedInvoice.tax,
          paymentTerms: selectedInvoice.paymentTerms,
          receiptDetails: {
            receivedFrom: selectedInvoice.client.companyName,
            invoiceReference: selectedInvoice.documentNumber,
            projectPurpose: selectedInvoice.items[0]?.description || 'Services Rendered',
            paymentMethod,
            transactionReference: transactionReference || 'N/A',
            amountReceived: numAmount,
            invoiceTotal: grandTotal,
            balanceDue: newBalance,
            paymentStatus: isFull ? 'Paid in Full' : 'Partial Payment',
            paymentId,
            sourceInvoiceId: selectedInvoice.id,
          },
          notes: notes || 'Thank you for your business.',
          termsAndConditions: selectedInvoice.termsAndConditions || [],
          signatureSeal: selectedInvoice.signatureSeal,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await saveDocumentToFirestore(receiptDoc);
        showSuccess(`Receipt ${receiptNumber} generated!`);
      }

      const paymentRecord: Payment = {
        id: paymentId,
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.documentNumber,
        customerId: selectedInvoice.customerId || '',
        customerName: selectedInvoice.client.companyName,
        amount: numAmount,
        paymentDate,
        paymentMethod,
        transactionReference: transactionReference.trim(),
        notes: notes.trim(),
        receiptId,
        receiptNumber,
        createdAt: new Date().toISOString(),
      };

      await onSave(paymentRecord);
    } catch (err: any) {
      setError(err.message || 'Failed to save payment.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-xs">
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Select Invoice */}
      <div>
        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
          Select Tax Invoice *
        </label>
        <select
          required
          value={selectedInvoiceId}
          onChange={(e) => setSelectedInvoiceId(e.target.value)}
          className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
        >
          <option value="">-- Choose an Invoice to apply payment --</option>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.documentNumber} — {inv.client.companyName} ({formatCurrency(inv.tax.grandTotal)})
            </option>
          ))}
        </select>
      </div>

      {/* Invoice Details Card */}
      {selectedInvoice && (
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Client:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {selectedInvoice.client.companyName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Invoice Total:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCurrency(grandTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Previously Paid:</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(existingPaid)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Remaining Balance:</span>
            <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
              {formatCurrency(balanceDue)}
            </span>
          </div>
        </div>
      )}

      {/* Amount & Date Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Payment Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-10 pl-8 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:border-brand"
            />
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Payment Date *
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
            />
          </div>
        </div>

        {/* Method */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
            Payment Method *
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
          >
            <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
            <option value="Bank Transfer">Bank Transfer (IMPS / NEFT / RTGS)</option>
            <option value="Cheque">Cheque</option>
            <option value="Cash">Cash</option>
            <option value="Credit Card">Credit / Debit Card</option>
          </select>
        </div>

        {/* Transaction Reference */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Transaction Ref / UTR / Cheque #
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder="e.g. UTR12345678 or Cheque 00412"
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand font-mono"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Payment Remarks / Notes
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Received 50% advance for milestone 1"
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
          />
        </div>
      </div>

      {/* Auto-create Receipt Checkbox */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/50">
        <input
          type="checkbox"
          id="autoCreateReceipt"
          checked={autoCreateReceipt}
          onChange={(e) => setAutoCreateReceipt(e.target.checked)}
          className="w-4 h-4 rounded text-brand focus:ring-brand"
        />
        <label htmlFor="autoCreateReceipt" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
          Automatically generate official Payment Receipt document
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || !selectedInvoice}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-brand text-white hover:bg-brand-600 transition-colors shadow-xs disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          {isSaving ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
};
