import { 
  saveDocumentToFirestore, 
  saveCompanyProfileToFirestore, 
  saveTemplateConfigToFirestore, 
  saveCustomerToFirestore,
  fetchDocuments
} from './firestore';
import { DocumentData } from '../../types/document';
import { CompanyProfile } from '../../types/company';
import { DocumentTemplateConfig } from '../../types/template';
import { Customer } from '../../types/customer';

const LEGACY_KEYS = {
  DOCS: 'aescion_documents',
  COMPANY: 'aescion_company_profile',
  TEMPLATE: 'aescion_template_config',
  MIGRATION_FLAG: 'aescion_migration_completed_v2',
};

export interface MigrationSummary {
  documentsCount: number;
  customersCount: number;
  companyMigrated: boolean;
  templateMigrated: boolean;
}

export function hasLegacyDataToMigrate(): boolean {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(LEGACY_KEYS.MIGRATION_FLAG) === 'true') return false;

  const hasDocs = !!localStorage.getItem(LEGACY_KEYS.DOCS);
  const hasCompany = !!localStorage.getItem(LEGACY_KEYS.COMPANY);
  const hasTemplate = !!localStorage.getItem(LEGACY_KEYS.TEMPLATE);

  return hasDocs || hasCompany || hasTemplate;
}

export async function migrateLegacyData(): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    documentsCount: 0,
    customersCount: 0,
    companyMigrated: false,
    templateMigrated: false,
  };

  // 1. Migrate Company
  try {
    const rawCompany = localStorage.getItem(LEGACY_KEYS.COMPANY);
    if (rawCompany) {
      const company: CompanyProfile = JSON.parse(rawCompany);
      await saveCompanyProfileToFirestore(company);
      summary.companyMigrated = true;
    }
  } catch (err) {
    console.warn('Failed to migrate legacy company profile:', err);
  }

  // 2. Migrate Template
  try {
    const rawTemplate = localStorage.getItem(LEGACY_KEYS.TEMPLATE);
    if (rawTemplate) {
      const template: DocumentTemplateConfig = JSON.parse(rawTemplate);
      await saveTemplateConfigToFirestore(template);
      summary.templateMigrated = true;
    }
  } catch (err) {
    console.warn('Failed to migrate legacy template:', err);
  }

  // 3. Migrate Documents & Auto-extract Customers
  try {
    const rawDocs = localStorage.getItem(LEGACY_KEYS.DOCS);
    if (rawDocs) {
      const docs: DocumentData[] = JSON.parse(rawDocs);
      const customerMap = new Map<string, Customer>();

      for (const doc of docs) {
        // Save document
        await saveDocumentToFirestore(doc);
        summary.documentsCount++;

        // Extract customer if not present
        if (doc.client && doc.client.companyName) {
          const clientKey = doc.client.companyName.trim().toLowerCase();
          if (!customerMap.has(clientKey)) {
            const customer: Customer = {
              id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              companyName: doc.client.companyName,
              contactPerson: doc.client.contactPerson || '',
              email: doc.client.email || '',
              phone: doc.client.phone || '',
              billingAddress: doc.client.billingAddress || '',
              city: doc.client.city || '',
              state: doc.client.state || '',
              stateCode: doc.client.stateCode || '',
              pincode: doc.client.pincode || '',
              gstin: doc.client.gstin || '',
              pan: doc.client.pan || '',
              placeOfSupply: doc.client.placeOfSupply || '',
              website: doc.client.website || '',
              notes: doc.client.notes || '',
              createdAt: doc.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            customerMap.set(clientKey, customer);
          }
        }
      }

      for (const cust of customerMap.values()) {
        await saveCustomerToFirestore(cust);
        summary.customersCount++;
      }
    }
  } catch (err) {
    console.warn('Failed to migrate legacy documents:', err);
  }

  // Mark migration complete
  localStorage.setItem(LEGACY_KEYS.MIGRATION_FLAG, 'true');
  return summary;
}

export function clearLegacyLocalStorage(): void {
  localStorage.removeItem(LEGACY_KEYS.DOCS);
  localStorage.removeItem(LEGACY_KEYS.COMPANY);
  localStorage.removeItem(LEGACY_KEYS.TEMPLATE);
  localStorage.removeItem('aescion_active_doc_id');
  localStorage.removeItem('aescion_current_draft');
}
