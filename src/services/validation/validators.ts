import { z } from 'zod';
import { VALID_GST_RATES } from '../../constants/gstRates';

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
export const PHONE_REGEX = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const GstinValidator = z.string().trim().refine((val) => {
  if (!val) return true; // Optional for non-GST clients
  return GSTIN_REGEX.test(val.toUpperCase());
}, { message: 'Invalid 15-digit Indian GSTIN format (e.g., 33AAAAA0000A1Z5)' });

export const PanValidator = z.string().trim().refine((val) => {
  if (!val) return true;
  return PAN_REGEX.test(val.toUpperCase());
}, { message: 'Invalid 10-character PAN format (e.g., AAAAA0000A)' });

export const PincodeValidator = z.string().trim().refine((val) => {
  if (!val) return true;
  return PINCODE_REGEX.test(val);
}, { message: 'Invalid 6-digit Indian Pincode' });

export const PhoneValidator = z.string().trim().refine((val) => {
  if (!val) return true;
  const digits = val.replace(/[^0-9]/g, '');
  return digits.length >= 10 && digits.length <= 13;
}, { message: 'Invalid phone number (minimum 10 digits)' });

export const IfscValidator = z.string().trim().refine((val) => {
  if (!val) return true;
  return IFSC_REGEX.test(val.toUpperCase());
}, { message: 'Invalid IFSC code (e.g., HDFC0001234)' });

export const CustomerSchema = z.object({
  companyName: z.string().min(2, 'Company/Client name is required'),
  contactPerson: z.string().optional().default(''),
  email: z.string().trim().email('Invalid email address').or(z.literal('')).optional().default(''),
  phone: PhoneValidator.optional().default(''),
  billingAddress: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  stateCode: z.string().length(2, '2-digit state code is required'),
  pincode: PincodeValidator.optional().default(''),
  gstin: GstinValidator.optional().default(''),
  pan: PanValidator.optional().default(''),
  placeOfSupply: z.string().optional().default(''),
  website: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const DocumentItemSchema = z.object({
  id: z.string(),
  sNo: z.number(),
  description: z.string().min(1, 'Item description is required'),
  sacHsn: z.string().optional().default('998311'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  rate: z.number().nonnegative('Rate cannot be negative'),
  discount: z.number().nonnegative('Discount cannot be negative'),
  taxRate: z.number().refine((rate) => VALID_GST_RATES.includes(rate as any), {
    message: 'Tax rate must be 0, 5, 12, 18, or 28%',
  }),
  taxableValue: z.number(),
  amount: z.number(),
  isIncluded: z.boolean().optional(),
}).refine((item) => {
  const lineTotal = item.quantity * item.rate;
  return item.discount <= lineTotal;
}, {
  message: 'Discount cannot exceed total item price (Quantity × Rate)',
  path: ['discount'],
});

export const PaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice reference is required'),
  customerId: z.string().min(1, 'Customer reference is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(['UPI', 'Bank Transfer', 'Cheque', 'Cash', 'Credit Card']),
  transactionReference: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export const CompanyProfileSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  legalName: z.string().optional().default(''),
  tagline: z.string().optional().default(''),
  logoUrl: z.string().optional().default(''),
  address: z.string().min(3, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  stateCode: z.string().length(2, '2-digit state code is required'),
  pincode: PincodeValidator.optional().default(''),
  gstin: GstinValidator,
  pan: PanValidator,
  email: z.string().email('Invalid email address'),
  phone: PhoneValidator,
  website: z.string().optional().default(''),
  bankName: z.string().min(2, 'Bank name is required'),
  accountName: z.string().min(2, 'Account name is required'),
  accountNumber: z.string().min(6, 'Valid account number is required'),
  ifsc: IfscValidator,
  upiId: z.string().optional().default(''),
  signatoryName: z.string().optional().default(''),
  signatoryDesignation: z.string().optional().default(''),
});

export function validateDates(issueDate: string, validUntilOrDueDate: string): { valid: boolean; error?: string } {
  if (!issueDate || !validUntilOrDueDate) return { valid: true };
  const d1 = new Date(issueDate);
  const d2 = new Date(validUntilOrDueDate);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return { valid: true };
  if (d2 < d1) {
    return { valid: false, error: 'Due/Validity date cannot be earlier than Issue date' };
  }
  return { valid: true };
}
