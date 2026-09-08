import { describe, it, expect } from 'vitest';
import { 
  GSTIN_REGEX, 
  PAN_REGEX, 
  PINCODE_REGEX, 
  DocumentItemSchema, 
  CustomerSchema,
  validateDates 
} from '../services/validation/validators';

describe('Validation Schemas & Statutory Checks', () => {
  it('validates 15-digit Indian GSTIN format correctly', () => {
    // Valid Tamil Nadu GSTIN
    expect(GSTIN_REGEX.test('33AAAAA0000A1Z5')).toBe(true);
    // Valid Karnataka GSTIN
    expect(GSTIN_REGEX.test('29ABCDE1234F1Z5')).toBe(true);
    // Invalid length
    expect(GSTIN_REGEX.test('33AAAAA0000A1Z')).toBe(false);
    // Invalid 14th character (must be Z)
    expect(GSTIN_REGEX.test('33AAAAA0000A19Z')).toBe(false);
    // Invalid length (16 chars)
    expect(GSTIN_REGEX.test('33AAAAA0000A1Z59')).toBe(false);
  });

  it('validates 10-character PAN format correctly', () => {
    expect(PAN_REGEX.test('AAAAA0000A')).toBe(true);
    expect(PAN_REGEX.test('ABCDE1234F')).toBe(true);
    expect(PAN_REGEX.test('12345ABCDE')).toBe(false);
    expect(PAN_REGEX.test('ABCDE1234')).toBe(false);
  });

  it('validates 6-digit Indian Pincode format', () => {
    expect(PINCODE_REGEX.test('600032')).toBe(true);
    expect(PINCODE_REGEX.test('560001')).toBe(true);
    expect(PINCODE_REGEX.test('012345')).toBe(false); // First digit cannot be 0
    expect(PINCODE_REGEX.test('12345')).toBe(false);
  });

  it('enforces that item discount cannot exceed total item price', () => {
    const validItem = {
      id: 'item-1',
      sNo: 1,
      description: 'Web Design',
      sacHsn: '998311',
      quantity: 2,
      rate: 5000,
      discount: 2000, // 2000 <= 10000 -> Valid
      taxRate: 18,
      taxableValue: 8000,
      amount: 9440,
    };
    expect(DocumentItemSchema.safeParse(validItem).success).toBe(true);

    const invalidItem = {
      ...validItem,
      discount: 15000, // 15000 > 10000 -> Invalid
    };
    expect(DocumentItemSchema.safeParse(invalidItem).success).toBe(false);
  });

  it('validates customer schema fields correctly', () => {
    const validCustomer = {
      companyName: 'Infosys Limited',
      contactPerson: 'Manager',
      billingAddress: 'Electronics City',
      city: 'Bengaluru',
      state: 'Karnataka',
      stateCode: '29',
      pincode: '560100',
      gstin: '29AAAAA0000A1Z5',
      pan: 'AAAAA0000A',
    };
    expect(CustomerSchema.safeParse(validCustomer).success).toBe(true);

    const invalidCustomer = {
      ...validCustomer,
      companyName: '', // empty name -> Invalid
    };
    expect(CustomerSchema.safeParse(invalidCustomer).success).toBe(false);
  });

  it('validates that due date cannot be earlier than issue date', () => {
    expect(validateDates('2026-09-08', '2026-09-15').valid).toBe(true);
    expect(validateDates('2026-09-08', '2026-09-08').valid).toBe(true);
    expect(validateDates('2026-09-15', '2026-09-08').valid).toBe(false);
  });
});
