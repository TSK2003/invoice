export interface DocumentTemplateConfig {
  id: string;
  name: string;
  description: string;
  brandPrimaryColor: string;
  brandNavyColor: string;
  brandAccentColor: string;
  brandOrangeColor: string;
  headerStyle: 'standard' | 'modern' | 'compact';
  fontFamily: string;
  defaultTermsQuotation: string[];
  defaultTermsInvoice: string[];
  defaultTermsReceipt: string[];
  companyId?: string;
  updatedAt?: string;
}
