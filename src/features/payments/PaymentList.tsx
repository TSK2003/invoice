import React, { useState, useMemo } from 'react';
import { usePayments } from './usePayments';
import { Payment } from '../../types/payment';
import { PaymentForm } from './PaymentForm';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/currency';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  CreditCard, 
  Calendar, 
  Hash, 
  Trash2, 
  Receipt, 
  ArrowUpRight,
  Filter
} from 'lucide-react';

export const PaymentList: React.FC = () => {
  const { payments, loading, savePayment, deletePayment } = usePayments();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const invoiceFilterParam = searchParams.get('invoiceId') || undefined;

  const totalCollected = useMemo(() => {
    return payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let list = payments;
    if (invoiceFilterParam) {
      list = list.filter((p) => p.invoiceId === invoiceFilterParam);
    }
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase().trim();
    return list.filter(
      (p) =>
        (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(term)) ||
        (p.customerName && p.customerName.toLowerCase().includes(term)) ||
        p.paymentMethod.toLowerCase().includes(term) ||
        (p.transactionReference && p.transactionReference.toLowerCase().includes(term))
    );
  }, [payments, searchTerm, invoiceFilterParam]);

  const handleSavePayment = async (payment: Payment) => {
    await savePayment(payment);
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (paymentToDelete) {
      await deletePayment(paymentToDelete.id);
      setPaymentToDelete(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading payment records..." />;
  }

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Payments & Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track invoice settlements, payments received, and transaction receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-600 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Collected</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalCollected)}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Transactions Recorded</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {payments.length}
          </p>
        </div>
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Latest Payment</p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
            {payments.length > 0 ? payments[0].paymentDate : 'No payments yet'}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by invoice #, customer name, method (UPI, Bank), or reference..."
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand"
          />
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table of Payments */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No payments recorded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No payment entries matched "${searchTerm}".`
              : 'Record incoming customer payments against invoices to automatically update their payment status.'}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Record First Payment
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Invoice Reference</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Method & Reference</th>
                  <th className="py-3.5 px-4 text-right">Amount Received</th>
                  <th className="py-3.5 px-4 text-right">Receipt / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {payment.paymentDate}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-brand">
                      {payment.invoiceId ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/documents/${payment.invoiceId}/view`)}
                          className="hover:underline flex items-center gap-1 font-mono"
                        >
                          {payment.invoiceNumber || 'View Invoice'}
                          <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </button>
                      ) : (
                        <span className="text-slate-400">Direct Payment</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {payment.customerName || 'N/A'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {payment.paymentMethod}
                      </span>
                      {payment.transactionReference && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Ref: {payment.transactionReference}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {payment.receiptId && (
                          <button
                            type="button"
                            onClick={() => navigate(`/documents/${payment.receiptId}/view`)}
                            title="View Generated Receipt"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors text-[11px] font-semibold"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setPaymentToDelete(payment)}
                          title="Delete Payment Record"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Record Payment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Invoice Payment"
        maxWidth="lg"
      >
        <PaymentForm
          initialInvoiceId={invoiceFilterParam}
          onSave={handleSavePayment}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Payment Entry"
        message={`Are you sure you want to delete this payment of ${paymentToDelete ? formatCurrency(paymentToDelete.amount) : ''}? The associated invoice balance and status will be updated automatically.`}
        confirmText="Delete Payment"
        variant="danger"
      />
    </div>
  );
};
