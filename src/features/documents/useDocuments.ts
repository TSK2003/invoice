import { useState, useEffect, useCallback, useMemo } from 'react';
import { DocumentData, DocumentType } from '../../types/document';
import { 
  fetchDocuments, 
  saveDocumentToFirestore, 
  deleteDocumentFromFirestore,
  fetchPayments,
  getNextDocumentNumber 
} from '../../services/firebase/firestore';
import { useToast } from '../../app/providers/ToastProvider';
import { roundMoney } from '../../utils/money';

export interface CalculatedStats {
  totalQuotations: number;
  totalInvoices: number;
  totalReceipts: number;
  paidAmount: number;
  outstandingAmount: number;
  pendingPaymentsAmount: number;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [docs, payments] = await Promise.all([
        fetchDocuments(),
        fetchPayments(),
      ]);
      setDocuments(docs);
      const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
      setPaymentsTotal(totalPaid);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      showError('Failed to load documents', err.message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveDocument = async (doc: DocumentData) => {
    try {
      await saveDocumentToFirestore(doc);
      await loadData();
      showSuccess(`Document ${doc.documentNumber} saved to cloud!`);
    } catch (err: any) {
      showError('Failed to save document', err.message);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await deleteDocumentFromFirestore(id);
      await loadData();
      showSuccess('Document deleted');
    } catch (err: any) {
      showError('Failed to delete document', err.message);
      throw err;
    }
  };

  const duplicateDocument = async (id: string) => {
    const original = documents.find((d) => d.id === id);
    if (!original) return;

    try {
      const newDocNumber = await getNextDocumentNumber(original.type);
      const newId = `doc_${Date.now()}`;
      const now = new Date().toISOString();

      const duplicated: DocumentData = {
        ...original,
        id: newId,
        documentNumber: newDocNumber,
        status: 'draft',
        isLocked: false,
        date: now.split('T')[0],
        validUntilOrDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: now,
        updatedAt: now,
      };

      await saveDocumentToFirestore(duplicated);
      await loadData();
      showSuccess(`Duplicated as ${newDocNumber}`);
      return duplicated;
    } catch (err: any) {
      showError('Failed to duplicate document', err.message);
      throw err;
    }
  };

  // Precise, non-duplicated stats calculation
  const stats: CalculatedStats = useMemo(() => {
    let totalQuotations = 0;
    let totalInvoices = 0;
    let totalReceipts = 0;
    let invoicesTotal = 0;
    let pendingQuotationsTotal = 0;

    documents.forEach((d) => {
      if (d.type === 'quotation') {
        totalQuotations++;
        if (d.status === 'sent' || d.status === 'accepted') {
          pendingQuotationsTotal += d.tax?.grandTotal || 0;
        }
      } else if (d.type === 'tax_invoice') {
        totalInvoices++;
        if (d.status !== 'cancelled') {
          invoicesTotal += d.tax?.grandTotal || 0;
        }
      } else if (d.type === 'payment_receipt') {
        totalReceipts++;
      }
    });

    const outstanding = Math.max(0, invoicesTotal - paymentsTotal);

    return {
      totalQuotations,
      totalInvoices,
      totalReceipts,
      paidAmount: roundMoney(paymentsTotal),
      outstandingAmount: roundMoney(outstanding),
      pendingPaymentsAmount: roundMoney(pendingQuotationsTotal),
    };
  }, [documents, paymentsTotal]);

  return {
    documents,
    stats,
    loading,
    saveDocument,
    deleteDocument,
    duplicateDocument,
    refresh: loadData,
  };
}
