/**
 * Validation rules for form fields in AESCION Document Studio.
 */

export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional
  const re = /^[0-9+\-\s()]{7,15}$/;
  return re.test(phone);
};

export const validateGSTIN = (gstin: string): boolean => {
  if (!gstin) return true; // Optional
  // Standard Indian 15-digit GSTIN pattern: 2 digits state, 10 alphanumeric PAN, 1 Z, 1 check digit
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  return re.test(gstin.trim());
};

export interface FormErrors {
  clientCompanyName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientGstin?: string;
  documentNumber?: string;
}

export const validateDocumentForm = (data: {
  clientCompanyName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientGstin?: string;
  documentNumber?: string;
}): FormErrors => {
  const errors: FormErrors = {};

  if (!data.clientCompanyName || !data.clientCompanyName.trim()) {
    errors.clientCompanyName = 'Client or Company Name is required';
  }

  if (data.clientEmail && !validateEmail(data.clientEmail)) {
    errors.clientEmail = 'Invalid email address format';
  }

  if (data.clientPhone && !validatePhone(data.clientPhone)) {
    errors.clientPhone = 'Invalid phone number format';
  }

  if (data.clientGstin && !validateGSTIN(data.clientGstin)) {
    errors.clientGstin = 'Invalid GSTIN format (15 characters, e.g. 33AAAAA0000A1Z5)';
  }

  if (!data.documentNumber || !data.documentNumber.trim()) {
    errors.documentNumber = 'Document Number is required';
  }

  return errors;
};
