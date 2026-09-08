import { useState, useEffect, useCallback } from 'react';
import { Payment } from '../../types/payment';
import { fetchPayments, savePaymentToFirestore, deletePaymentFromFirestore } from '../../services/firebase/firestore';
import { useToast } from '../../app/providers/ToastProvider';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPayments();
      setPayments(data);
    } catch (err: any) {
      console.error('Failed to load payments:', err);
      showError('Failed to load payments', err.message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const savePayment = async (payment: Payment) => {
    try {
      await savePaymentToFirestore(payment);
      await loadPayments();
      showSuccess('Payment recorded successfully');
    } catch (err: any) {
      showError('Failed to record payment', err.message);
      throw err;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await deletePaymentFromFirestore(id);
      await loadPayments();
      showSuccess('Payment entry deleted');
    } catch (err: any) {
      showError('Failed to delete payment', err.message);
      throw err;
    }
  };

  return {
    payments,
    loading,
    savePayment,
    deletePayment,
    refresh: loadPayments,
  };
}
