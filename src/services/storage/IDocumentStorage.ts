import { DocumentData, DocumentType, CompanyProfile } from '../../types/document';
import { DocumentTemplateConfig } from '../../types/template';

export interface DashboardStats {
  totalQuotations: number;
  totalInvoices: number;
  totalReceipts: number;
  pendingPaymentsAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

export interface IDocumentStorageService {
  getAllDocuments(): Promise<DocumentData[]>;
  getDocumentById(id: string): Promise<DocumentData | null>;
  saveDocument(doc: DocumentData): Promise<DocumentData>;
  deleteDocument(id: string): Promise<boolean>;
  duplicateDocument(id: string): Promise<DocumentData | null>;
  getStats(): Promise<DashboardStats>;
  generateNextDocumentNumber(type: DocumentType): Promise<string>;
  getCompanyProfile(): Promise<CompanyProfile>;
  saveCompanyProfile(profile: CompanyProfile): Promise<CompanyProfile>;
  getTemplateConfig(): Promise<DocumentTemplateConfig>;
  saveTemplateConfig(config: DocumentTemplateConfig): Promise<DocumentTemplateConfig>;
}

