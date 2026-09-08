import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';
import { DocumentData, DocumentStatus, DocumentType } from '../../types/document';
import { Customer } from '../../types/customer';
import { Payment } from '../../types/payment';
import { CompanyProfile } from '../../types/company';
import { DocumentTemplateConfig } from '../../types/template';
import { ServicePackage } from '../../types/package';
import { DEFAULT_COMPANY_PROFILE } from '../../constants/defaultCompany';
import { AESCION_PROFESSIONAL_TEMPLATE } from '../../constants/initialTemplates';
import { AESCION_PACKAGES } from '../../constants/packages';

// Collection references
const DOCS_COLLECTION = 'documents';
const CUSTOMERS_COLLECTION = 'customers';
const PAYMENTS_COLLECTION = 'payments';
const COMPANIES_COLLECTION = 'companies';
const TEMPLATES_COLLECTION = 'templates';
const PACKAGES_COLLECTION = 'packages';
const SEQUENCES_COLLECTION = 'documentSequences';

// ==================== DOCUMENTS ====================

export async function fetchDocuments(companyId?: string): Promise<DocumentData[]> {
  try {
    const colRef = collection(db, DOCS_COLLECTION);
    const q = companyId
      ? query(colRef, where('companyId', '==', companyId), orderBy('createdAt', 'desc'))
      : query(colRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as DocumentData));
  } catch (error) {
    console.error('Error fetching documents from Firestore:', error);
    // Fallback to query without orderBy if index is building or empty
    const colRef = collection(db, DOCS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const docs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as DocumentData));
    return docs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }
}

export async function fetchDocumentById(id: string): Promise<DocumentData | null> {
  const docRef = doc(db, DOCS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id } as DocumentData;
}

export async function saveDocumentToFirestore(data: DocumentData): Promise<void> {
  const docRef = doc(db, DOCS_COLLECTION, data.id);
  const now = new Date().toISOString();
  const payload = {
    ...data,
    updatedAt: now,
    createdAt: data.createdAt || now,
  };
  await setDoc(docRef, payload, { merge: true });
}

export async function updateDocumentStatusInFirestore(id: string, status: DocumentStatus): Promise<void> {
  const docRef = doc(db, DOCS_COLLECTION, id);
  const now = new Date().toISOString();
  await updateDoc(docRef, {
    status,
    updatedAt: now,
    // Lock document if finalized
    isLocked: ['sent', 'accepted', 'issued', 'partially_paid', 'paid', 'converted'].includes(status),
  });
}

export async function deleteDocumentFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, DOCS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ==================== CUSTOMERS ====================

export async function fetchCustomers(companyId?: string): Promise<Customer[]> {
  try {
    const colRef = collection(db, CUSTOMERS_COLLECTION);
    const q = companyId
      ? query(colRef, where('companyId', '==', companyId), orderBy('companyName', 'asc'))
      : query(colRef, orderBy('companyName', 'asc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Customer));
  } catch (error) {
    console.error('Error fetching customers:', error);
    const colRef = collection(db, CUSTOMERS_COLLECTION);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Customer));
  }
}

export async function fetchCustomerById(id: string): Promise<Customer | null> {
  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { ...snapshot.data(), id: snapshot.id } as Customer;
}

export async function saveCustomerToFirestore(customer: Customer): Promise<void> {
  const docRef = doc(db, CUSTOMERS_COLLECTION, customer.id);
  const now = new Date().toISOString();
  const payload = {
    ...customer,
    updatedAt: now,
    createdAt: customer.createdAt || now,
  };
  await setDoc(docRef, payload, { merge: true });
}

export async function deleteCustomerFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, CUSTOMERS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ==================== PAYMENTS ====================

export async function fetchPayments(companyId?: string): Promise<Payment[]> {
  try {
    const colRef = collection(db, PAYMENTS_COLLECTION);
    const q = companyId
      ? query(colRef, where('companyId', '==', companyId), orderBy('createdAt', 'desc'))
      : query(colRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Payment));
  } catch (error) {
    console.error('Error fetching payments:', error);
    const colRef = collection(db, PAYMENTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Payment));
  }
}

export async function fetchPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
  const colRef = collection(db, PAYMENTS_COLLECTION);
  const q = query(colRef, where('invoiceId', '==', invoiceId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Payment));
}

export async function savePaymentToFirestore(payment: Payment): Promise<void> {
  const docRef = doc(db, PAYMENTS_COLLECTION, payment.id);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...payment, createdAt: payment.createdAt || now }, { merge: true });

  // Update invoice status if balance is reached
  if (payment.invoiceId) {
    await updateInvoicePaymentStatus(payment.invoiceId);
  }
}

export async function deletePaymentFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, PAYMENTS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  const invoiceId = snapshot.data()?.invoiceId;
  await deleteDoc(docRef);
  if (invoiceId) {
    await updateInvoicePaymentStatus(invoiceId);
  }
}

export async function updateInvoicePaymentStatus(invoiceId: string): Promise<void> {
  try {
    const invDoc = await fetchDocumentById(invoiceId);
    if (!invDoc || invDoc.type !== 'tax_invoice') return;

    const payments = await fetchPaymentsByInvoice(invoiceId);
    const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const grandTotal = invDoc.tax.grandTotal || 0;

    let newStatus: DocumentStatus = invDoc.status;
    if (totalPaid >= grandTotal && grandTotal > 0) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partially_paid';
    } else if (invDoc.status === 'paid' || invDoc.status === 'partially_paid') {
      newStatus = 'issued';
    }

    if (newStatus !== invDoc.status) {
      await updateDocumentStatusInFirestore(invoiceId, newStatus);
    }
  } catch (err) {
    console.warn('Failed to update invoice payment status:', err);
  }
}

// ==================== COMPANY PROFILE ====================

export async function fetchCompanyProfile(companyId = 'default_company'): Promise<CompanyProfile> {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, companyId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as CompanyProfile;
    }
    // Return default profile
    return DEFAULT_COMPANY_PROFILE;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return DEFAULT_COMPANY_PROFILE;
  }
}

export async function saveCompanyProfileToFirestore(profile: CompanyProfile, companyId = 'default_company'): Promise<void> {
  const docRef = doc(db, COMPANIES_COLLECTION, companyId);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...profile, updatedAt: now }, { merge: true });
}

// ==================== TEMPLATES ====================

export async function fetchTemplateConfig(companyId = 'default_template'): Promise<DocumentTemplateConfig> {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, companyId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as DocumentTemplateConfig;
    }
    return AESCION_PROFESSIONAL_TEMPLATE;
  } catch (error) {
    console.error('Error fetching template:', error);
    return AESCION_PROFESSIONAL_TEMPLATE;
  }
}

export async function saveTemplateConfigToFirestore(template: DocumentTemplateConfig, companyId = 'default_template'): Promise<void> {
  const docRef = doc(db, TEMPLATES_COLLECTION, companyId);
  const now = new Date().toISOString();
  await setDoc(docRef, { ...template, updatedAt: now }, { merge: true });
}

// ==================== PACKAGES ====================

export async function fetchPackages(companyId = 'default'): Promise<ServicePackage[]> {
  try {
    const colRef = collection(db, PACKAGES_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return AESCION_PACKAGES;
    }
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as ServicePackage));
  } catch (error) {
    console.error('Error fetching packages:', error);
    return AESCION_PACKAGES;
  }
}

export async function savePackageToFirestore(pkg: ServicePackage): Promise<void> {
  const docRef = doc(db, PACKAGES_COLLECTION, pkg.id);
  await setDoc(docRef, pkg, { merge: true });
}

// ==================== NUMBERING SEQUENCE (ATOMIC) ====================

export async function getNextDocumentNumber(type: DocumentType, companyId = 'default'): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefixMap: Record<DocumentType, string> = {
    quotation: 'QTN',
    tax_invoice: 'INV',
    payment_receipt: 'RCP',
  };
  const prefix = prefixMap[type] || 'DOC';
  const sequenceId = `${companyId}_${type}_${currentYear}`;
  const seqDocRef = doc(db, SEQUENCES_COLLECTION, sequenceId);

  try {
    const nextNumber = await runTransaction(db, async (transaction) => {
      const seqDoc = await transaction.get(seqDocRef);
      let currentSeq = 0;
      if (seqDoc.exists()) {
        currentSeq = seqDoc.data().lastNumber || 0;
      }
      const newSeq = currentSeq + 1;
      transaction.set(seqDocRef, {
        companyId,
        type,
        year: currentYear,
        lastNumber: newSeq,
        updatedAt: new Date().toISOString(),
      });
      return newSeq;
    });

    const formattedSeq = String(nextNumber).padStart(3, '0');
    return `AES-${prefix}-${currentYear}-${formattedSeq}`;
  } catch (error) {
    console.warn('Atomic numbering transaction failed, generating fallback:', error);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `AES-${prefix}-${currentYear}-${randomSuffix}`;
  }
}
