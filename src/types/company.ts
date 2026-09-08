export interface SignatureSealConfig {
  showSeal: boolean;
  showSignature: boolean;
  sealImageUrl?: string;
  signatureImageUrl?: string;
  signatoryTitle: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  customerSignatoryTitle: string;
}

export interface CompanyProfile {
  id?: string;
  companyName: string;
  legalName?: string;
  tagline: string;
  logoUrl: string;
  address: string;
  city?: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  website: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  signatureSeal?: SignatureSealConfig;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}
