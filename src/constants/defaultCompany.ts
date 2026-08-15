import { CompanyProfile } from '../types/document';
import { LOGO_BASE64, SEAL_BASE64, SIGNATURE_BASE64 } from './imageAssets';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'AESCION EDTECH SOLUTIONS',
  tagline: 'EdTech & Digital Software Architecture',
  logoUrl: LOGO_BASE64,
  address: 'No. 42, Innovation Tech Park, GST Road, Chennai - 600032',
  gstin: '33AAAAA0000A1Z5',
  pan: 'AAAAA0000A',
  email: 'info@aesciontech.com',
  phone: '7550068877',
  website: 'www.aesciontech.com',
  bankName: 'HDFC Bank',
  accountName: 'AESCION EDTECH SOLUTIONS',
  accountNumber: '50200012345678',
  ifsc: 'HDFC0001234',
  upiId: 'aescion@hdfcbank',
  signatureSeal: {
    showSeal: true,
    showSignature: true,
    sealImageUrl: SEAL_BASE64,
    signatureImageUrl: SIGNATURE_BASE64,
    signatoryTitle: 'Authorized Signatory',
    customerSignatoryTitle: 'Customer Representative',
  },
};
