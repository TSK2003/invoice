import { DocumentData, DocumentType, CompanyProfile } from '../../types/document';
import { DocumentTemplateConfig } from '../../types/template';
import { DashboardStats, IDocumentStorageService } from './IDocumentStorage';
import { DEFAULT_COMPANY_PROFILE } from '../../constants/defaultCompany';
import { AESCION_PROFESSIONAL_TEMPLATE } from '../../constants/initialTemplates';
import { DEFAULT_QUOTATION_TERMS, DEFAULT_INVOICE_TERMS, DEFAULT_RECEIPT_TERMS } from '../../constants/defaultTerms';
import { SIGNATURE_BASE64, SEAL_BASE64 } from '../../constants/imageAssets';

const STORAGE_KEY = 'aescion_documents_v2';
const DRAFT_KEY = 'aescion_current_draft_v2';
const COMPANY_KEY = 'aescion_company_profile_v2';
const TEMPLATE_KEY = 'aescion_template_config_v2';

const getInitialSeedDocuments = (): DocumentData[] => {
  const now = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'doc-seed-001',
      type: 'quotation',
      documentNumber: 'AES-QTN-2026-001',
      date: now,
      validUntilOrDueDate: '2026-09-12',
      status: 'accepted',
      packageId: 'business-website',
      packageName: 'Business Website',
      client: {
        companyName: 'Apex Logistics Pvt Ltd',
        contactPerson: 'Mr. Rajesh Kumar',
        email: 'rajesh@apexlogistics.com',
        phone: '9840112233',
        billingAddress: 'Suite 402, Trade Towers, Mount Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        stateCode: '33',
        pincode: '600002',
        gstin: '33AAACA1234F1Z1',
        pan: 'AAACA1234F',
        placeOfSupply: 'Tamil Nadu (33)',
        website: 'www.apexlogistics.com',
        notes: 'Requirement discussed for corporate website redesign.',
      },
      company: DEFAULT_COMPANY_PROFILE,
      items: [
        {
          id: 'item-1',
          sNo: 1,
          description: 'Business Website Development — Up to 10 Pages',
          sacHsn: '998314',
          quantity: 1,
          rate: 15000,
          discount: 0,
          taxRate: 18,
          taxableValue: 15000,
          amount: 15000,
          isIncluded: false,
        },
        {
          id: 'item-2',
          sNo: 2,
          description: 'Domain — 1 Year (Included)',
          sacHsn: '—',
          quantity: '—',
          rate: 0,
          discount: 0,
          taxRate: 0,
          taxableValue: 0,
          amount: 0,
          isIncluded: true,
        },
        {
          id: 'item-3',
          sNo: 3,
          description: 'Hosting — 1 Year (Included)',
          sacHsn: '—',
          quantity: '—',
          rate: 0,
          discount: 0,
          taxRate: 0,
          taxableValue: 0,
          amount: 0,
          isIncluded: true,
        },
        {
          id: 'item-4',
          sNo: 4,
          description: 'Deployment & SSL Certificate (Included)',
          sacHsn: '—',
          quantity: '—',
          rate: 0,
          discount: 0,
          taxRate: 0,
          taxableValue: 0,
          amount: 0,
          isIncluded: true,
        },
        {
          id: 'item-5',
          sNo: 5,
          description: '3 Months Technical Support & Monitoring (Included)',
          sacHsn: '—',
          quantity: '—',
          rate: 0,
          discount: 0,
          taxRate: 0,
          taxableValue: 0,
          amount: 0,
          isIncluded: true,
        },
      ],
      tax: {
        taxType: 'cgst_sgst',
        gstRate: 18,
        cgstPercent: 9,
        sgstPercent: 9,
        igstPercent: 0,
        roundOff: 0,
        taxableValueTotal: 15000,
        cgstAmount: 1350,
        sgstAmount: 1350,
        igstAmount: 0,
        taxTotal: 2700,
        grandTotal: 17700,
      },
      paymentTerms: {
        preset: '50_50',
        advancePercentage: 50,
        balancePercentage: 50,
        advanceAmount: 8850,
        balanceAmount: 8850,
        customTermsText: '50% advance payment, balance 50% upon project completion.',
        deliveryTimelineText: '10 working days from advance payment.',
      },
      notes: 'Includes responsive design and SEO setup.',
      termsAndConditions: DEFAULT_QUOTATION_TERMS,
      signatureSeal: {
        showSeal: true,
        showSignature: true,
        sealImageUrl: SEAL_BASE64,
        signatureImageUrl: SIGNATURE_BASE64,
        signatoryTitle: 'Authorized Signatory',
        customerSignatoryTitle: 'Customer Representative',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'doc-seed-002',
      type: 'tax_invoice',
      documentNumber: 'AES-INV-2026-001',
      date: now,
      validUntilOrDueDate: '2026-08-19',
      status: 'issued',
      client: {
        companyName: 'Apex Logistics Pvt Ltd',
        contactPerson: 'Mr. Rajesh Kumar',
        email: 'rajesh@apexlogistics.com',
        phone: '9840112233',
        billingAddress: 'Suite 402, Trade Towers, Mount Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        stateCode: '33',
        pincode: '600002',
        gstin: '33AAACA1234F1Z1',
        pan: 'AAACA1234F',
        placeOfSupply: 'Tamil Nadu (33)',
        website: 'www.apexlogistics.com',
        notes: '',
      },
      company: DEFAULT_COMPANY_PROFILE,
      items: [
        {
          id: 'item-inv-1',
          sNo: 1,
          description: 'Business Website Development — Up to 10 Pages (50% Advance)',
          sacHsn: '998314',
          quantity: 1,
          rate: 7500,
          discount: 0,
          taxRate: 18,
          taxableValue: 7500,
          amount: 7500,
          isIncluded: false,
        },
      ],
      tax: {
        taxType: 'cgst_sgst',
        gstRate: 18,
        cgstPercent: 9,
        sgstPercent: 9,
        igstPercent: 0,
        roundOff: 0,
        taxableValueTotal: 7500,
        cgstAmount: 675,
        sgstAmount: 675,
        igstAmount: 0,
        taxTotal: 1350,
        grandTotal: 8850,
      },
      paymentTerms: {
        preset: '50_50',
        advancePercentage: 50,
        balancePercentage: 50,
        advanceAmount: 8850,
        balanceAmount: 0,
        customTermsText: 'Advance payment invoice.',
        deliveryTimelineText: '',
      },
      notes: 'Invoice for 50% project advance.',
      termsAndConditions: DEFAULT_INVOICE_TERMS,
      signatureSeal: {
        showSeal: true,
        showSignature: true,
        sealImageUrl: SEAL_BASE64,
        signatureImageUrl: SIGNATURE_BASE64,
        signatoryTitle: 'Authorized Signatory',
        customerSignatoryTitle: 'Customer Representative',
      },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'doc-seed-003',
      type: 'payment_receipt',
      documentNumber: 'AES-RCP-2026-001',
      date: now,
      validUntilOrDueDate: now,
      status: 'generated',
      client: {
        companyName: 'Apex Logistics Pvt Ltd',
        contactPerson: 'Mr. Rajesh Kumar',
        email: 'rajesh@apexlogistics.com',
        phone: '9840112233',
        billingAddress: 'Suite 402, Trade Towers, Mount Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        stateCode: '33',
        pincode: '600002',
        gstin: '33AAACA1234F1Z1',
        pan: 'AAACA1234F',
        placeOfSupply: 'Tamil Nadu (33)',
        website: 'www.apexlogistics.com',
        notes: '',
      },
      company: DEFAULT_COMPANY_PROFILE,
      items: [],
      tax: {
        taxType: 'none',
        gstRate: 0,
        cgstPercent: 0,
        sgstPercent: 0,
        igstPercent: 0,
        roundOff: 0,
        taxableValueTotal: 8850,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        taxTotal: 0,
        grandTotal: 8850,
      },
      paymentTerms: {
        preset: '50_50',
        advancePercentage: 50,
        balancePercentage: 50,
        advanceAmount: 8850,
        balanceAmount: 8850,
        customTermsText: '',
        deliveryTimelineText: '',
      },
      receiptDetails: {
        receivedFrom: 'Apex Logistics Pvt Ltd',
        invoiceReference: 'AES-INV-2026-001',
        projectPurpose: 'Business Website 50% Advance',
        paymentMethod: 'UPI',
        transactionReference: 'UPI/628491028471/HDFC',
        amountReceived: 8850,
        invoiceTotal: 17700,
        balanceDue: 8850,
        paymentStatus: 'Advance Payment',
      },
      notes: 'Payment received successfully via UPI.',
      termsAndConditions: DEFAULT_RECEIPT_TERMS,
      signatureSeal: {
        showSeal: true,
        showSignature: true,
        sealImageUrl: SEAL_BASE64,
        signatureImageUrl: SIGNATURE_BASE64,
        signatoryTitle: 'Authorized Signatory',
        customerSignatoryTitle: 'Customer Representative',
      },
      createdAt: now,
      updatedAt: now,
    },
  ];
};

export class LocalStorageService implements IDocumentStorageService {
  private loadDocumentsFromStorage(): DocumentData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const seed = getInitialSeedDocuments();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load documents from localStorage', e);
      return getInitialSeedDocuments();
    }
  }

  private saveDocumentsToStorage(docs: DocumentData[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch (e) {
      console.error('Failed to save documents to localStorage', e);
    }
  }

  async getAllDocuments(): Promise<DocumentData[]> {
    return this.loadDocumentsFromStorage();
  }

  async getDocumentById(id: string): Promise<DocumentData | null> {
    const docs = this.loadDocumentsFromStorage();
    return docs.find(d => d.id === id) || null;
  }

  async saveDocument(doc: DocumentData): Promise<DocumentData> {
    const docs = this.loadDocumentsFromStorage();
    const existingIndex = docs.findIndex(d => d.id === doc.id);
    const updatedDoc = {
      ...doc,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      docs[existingIndex] = updatedDoc;
    } else {
      docs.unshift(updatedDoc);
    }

    this.saveDocumentsToStorage(docs);
    return updatedDoc;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const docs = this.loadDocumentsFromStorage();
    const filtered = docs.filter(d => d.id !== id);
    if (filtered.length === docs.length) return false;
    this.saveDocumentsToStorage(filtered);
    return true;
  }

  async duplicateDocument(id: string): Promise<DocumentData | null> {
    const original = await this.getDocumentById(id);
    if (!original) return null;

    const nextDocNo = await this.generateNextDocumentNumber(original.type);
    const now = new Date().toISOString().split('T')[0];

    const duplicate: DocumentData = {
      ...JSON.parse(JSON.stringify(original)),
      id: `doc-${Date.now()}`,
      documentNumber: nextDocNo,
      status: original.type === 'quotation' ? 'draft' : original.type === 'tax_invoice' ? 'draft' : 'generated',
      date: now,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveDocument(duplicate);
  }

  async getStats(): Promise<DashboardStats> {
    const docs = this.loadDocumentsFromStorage();
    
    let totalQuotations = 0;
    let totalInvoices = 0;
    let totalReceipts = 0;

    let pendingPaymentsAmount = 0;
    let paidAmount = 0;
    let outstandingAmount = 0;

    docs.forEach(doc => {
      if (doc.type === 'quotation') {
        totalQuotations++;
      } else if (doc.type === 'tax_invoice') {
        totalInvoices++;
        const total = doc.tax.grandTotal || 0;
        if (doc.status === 'paid') {
          paidAmount += total;
        } else if (doc.status === 'partially_paid') {
          const paid = (doc.paymentTerms.advanceAmount || 0);
          paidAmount += paid;
          outstandingAmount += (total - paid);
          pendingPaymentsAmount += (total - paid);
        } else if (doc.status === 'issued' || doc.status === 'overdue' || doc.status === 'draft') {
          outstandingAmount += total;
          pendingPaymentsAmount += total;
        }
      } else if (doc.type === 'payment_receipt') {
        totalReceipts++;
        if (doc.receiptDetails) {
          paidAmount += (doc.receiptDetails.amountReceived || 0);
        }
      }
    });

    return {
      totalQuotations,
      totalInvoices,
      totalReceipts,
      pendingPaymentsAmount,
      paidAmount,
      outstandingAmount,
    };
  }

  async generateNextDocumentNumber(type: DocumentType): Promise<string> {
    const docs = this.loadDocumentsFromStorage();
    const currentYear = new Date().getFullYear();
    
    let prefix = 'AES-QTN';
    if (type === 'tax_invoice') prefix = 'AES-INV';
    if (type === 'payment_receipt') prefix = 'AES-RCP';

    const regex = new RegExp(`^${prefix}-${currentYear}-(\\d+)`);
    let maxNumber = 0;

    docs.forEach(doc => {
      if (doc.type === type) {
        const match = doc.documentNumber.match(regex);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      }
    });

    const nextNumStr = String(maxNumber + 1).padStart(3, '0');
    return `${prefix}-${currentYear}-${nextNumStr}`;
  }

  // Draft Autosave helper
  saveCurrentDraft(doc: DocumentData): void {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        doc,
        savedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.error('Failed to save draft to localStorage', e);
    }
  }

  loadCurrentDraft(): { doc: DocumentData; savedAt: string } | null {
    try {
      const data = localStorage.getItem(DRAFT_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  clearCurrentDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
  }

  // Company Profile Persistence
  async getCompanyProfile(): Promise<CompanyProfile> {
    try {
      const raw = localStorage.getItem(COMPANY_KEY);
      if (raw) {
        return JSON.parse(raw) as CompanyProfile;
      }
    } catch (e) {
      console.error('Failed to load company profile from localStorage', e);
    }
    return DEFAULT_COMPANY_PROFILE;
  }

  async saveCompanyProfile(profile: CompanyProfile): Promise<CompanyProfile> {
    try {
      localStorage.setItem(COMPANY_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save company profile to localStorage', e);
    }
    return profile;
  }

  // Template Settings Persistence
  async getTemplateConfig(): Promise<DocumentTemplateConfig> {
    try {
      const raw = localStorage.getItem(TEMPLATE_KEY);
      if (raw) {
        return JSON.parse(raw) as DocumentTemplateConfig;
      }
    } catch (e) {
      console.error('Failed to load template config from localStorage', e);
    }
    return AESCION_PROFESSIONAL_TEMPLATE;
  }

  async saveTemplateConfig(config: DocumentTemplateConfig): Promise<DocumentTemplateConfig> {
    try {
      localStorage.setItem(TEMPLATE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save template config to localStorage', e);
    }
    return config;
  }
}

export const storageService = new LocalStorageService();

