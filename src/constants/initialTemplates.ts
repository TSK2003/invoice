import { DocumentTemplateConfig } from '../types/template';
import { DEFAULT_QUOTATION_TERMS, DEFAULT_INVOICE_TERMS, DEFAULT_RECEIPT_TERMS } from './defaultTerms';

export const AESCION_PROFESSIONAL_TEMPLATE: DocumentTemplateConfig = {
  id: 'aescion-professional',
  name: 'AESCION Professional',
  description: 'Clean, corporate A4 document template with navy header borders, soft blue highlights, and structured tables.',
  brandPrimaryColor: '#20254a',
  brandNavyColor: '#20254a',
  brandAccentColor: '#12b8ed',
  brandOrangeColor: '#f87516',
  headerStyle: 'standard',
  fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
  defaultTermsQuotation: DEFAULT_QUOTATION_TERMS,
  defaultTermsInvoice: DEFAULT_INVOICE_TERMS,
  defaultTermsReceipt: DEFAULT_RECEIPT_TERMS,
};
