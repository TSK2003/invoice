import { useState, useEffect, useCallback } from 'react';
import { Customer } from '../../types/customer';
import { fetchCustomers, saveCustomerToFirestore, deleteCustomerFromFirestore } from '../../services/firebase/firestore';
import { useToast } from '../../app/providers/ToastProvider';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      showError('Failed to load customers', err.message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const saveCustomer = async (cust: Customer) => {
    try {
      await saveCustomerToFirestore(cust);
      await loadCustomers();
      showSuccess('Customer saved successfully');
    } catch (err: any) {
      showError('Failed to save customer', err.message);
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await deleteCustomerFromFirestore(id);
      await loadCustomers();
      showSuccess('Customer removed successfully');
    } catch (err: any) {
      showError('Failed to delete customer', err.message);
      throw err;
    }
  };

  return {
    customers,
    loading,
    saveCustomer,
    deleteCustomer,
    refresh: loadCustomers,
  };
}
