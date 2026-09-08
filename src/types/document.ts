import { CompanyProfile, SignatureSealConfig } from './company';
export type { CompanyProfile, SignatureSealConfig };

export type DocumentType = 'quotation' | 'tax_invoice' | 'payment_receipt';

export type DocumentStatus = 
  // Quotation statuses
  | 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'
  // Invoice statuses
  | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
  // Receipt statuses
  | 'generated';

export interface DocumentItem {
  id: string;
  sNo: number;
  description: string;
  sacHsn: string;
  quantity: number | string;
  rate: number;
  discount: number;
  taxRate: number;
  taxableValue: number;
  amount: number;
  isIncluded?: boolean;
}

export type TaxType = 'none' | 'cgst_sgst' | 'igst';

export interface TaxConfig {
  taxType: TaxType;
  gstRate: number; // e.g. 18
  cgstPercent: number; // e.g. 9
  sgstPercent: number; // e.g. 9
  igstPercent: number; // e.g. 18
  roundOff: number;
  taxableValueTotal: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxTotal: number;
  grandTotal: number;
}

export type PaymentTermsPreset = '50_50' | '40_60' | '100_advance' | 'custom';

export interface PaymentTermsConfig {
  preset: PaymentTermsPreset;
  advancePercentage: number;
  balancePercentage: number;
  advanceAmount: number;
  balanceAmount: number;
  customTermsText: string;
  deliveryTimelineText: string;
}

export interface ClientInfo {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  pan: string;
  placeOfSupply: string;
  website: string;
  notes: string;
}

export interface ReceiptDetails {
  receivedFrom: string;
  invoiceReference: string;
  projectPurpose: string;
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Cheque' | 'Cash' | 'Credit Card';
  transactionReference: string;
  amountReceived: number;
  invoiceTotal: number;
  balanceDue: number;
  paymentStatus: 'Paid in Full' | 'Partial Payment' | 'Advance Payment';
  paymentId?: string;
  sourceInvoiceId?: string;
}

export interface DocumentData {
  id: string;
  type: DocumentType;
  documentNumber: string;
  date: string;
  validUntilOrDueDate: string;
  status: DocumentStatus;
  
  // Relationships & Lineage
  customerId?: string;
  sourceQuotationId?: string;
  sourceInvoiceId?: string;
  isLocked?: boolean;
  
  // Historical Snapshots (frozen at issuance)
  customerSnapshot?: ClientInfo;
  companySnapshot?: CompanyProfile;

  // References
  packageId?: string;
  packageName?: string;
  
  client: ClientInfo;
  company: CompanyProfile;
  
  items: DocumentItem[];
  tax: TaxConfig;
  paymentTerms: PaymentTermsConfig;
  receiptDetails?: ReceiptDetails;
  
  notes: string;
  termsAndConditions: string[];
  signatureSeal: SignatureSealConfig;
  
  companyId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}
