import { describe, it, expect } from 'vitest';
import { calculateDocumentTax, calculateLineItem, determineTaxType } from '../services/tax/taxEngine';
import { DocumentItem } from '../types/document';

describe('GST Tax Engine', () => {
  it('correctly determines intra-state vs inter-state tax type from state codes', () => {
    // Same state (Tamil Nadu 33) -> Intra-state CGST + SGST
    expect(determineTaxType('33', '33')).toBe('cgst_sgst');
    // Padded 2-digit match
    expect(determineTaxType('33', '33')).toBe('cgst_sgst');
    // Different state (Tamil Nadu 33 -> Karnataka 29) -> Inter-state IGST
    expect(determineTaxType('33', '29')).toBe('igst');
    // Different state (Tamil Nadu 33 -> Delhi 07) -> Inter-state IGST
    expect(determineTaxType('33', '07')).toBe('igst');
  });

  it('accurately calculates line item with discount and 2-decimal precision', () => {
    const item: DocumentItem = {
      id: '1',
      sNo: 1,
      description: 'Web Development',
      sacHsn: '998314',
      quantity: 2,
      rate: 15000,
      discount: 2000,
      taxRate: 18,
      taxableValue: 0,
      amount: 0,
    };

    const calculated = calculateLineItem(item, 'cgst_sgst', 18);
    // Gross = 2 * 15000 = 30000. Less 2000 discount = 28000.
    expect(calculated.taxableValue).toBe(28000);
    // Tax at 18% on 28000 = 5040. Total = 33040.
    expect(calculated.amount).toBe(33040);
  });

  it('caps discount if discount exceeds total line item price', () => {
    const item: DocumentItem = {
      id: '2',
      sNo: 1,
      description: 'Consultation',
      sacHsn: '998314',
      quantity: 1,
      rate: 5000,
      discount: 7500, // Invalid discount greater than price
      taxRate: 18,
      taxableValue: 0,
      amount: 0,
    };

    const calculated = calculateLineItem(item, 'cgst_sgst', 18);
    expect(calculated.discount).toBe(5000);
    expect(calculated.taxableValue).toBe(0);
    expect(calculated.amount).toBe(0);
  });

  it('calculates intra-state CGST and SGST equal split on document', () => {
    const items: DocumentItem[] = [
      {
        id: '1',
        sNo: 1,
        description: 'Frontend Architecture',
        sacHsn: '998314',
        quantity: 1,
        rate: 50000,
        discount: 0,
        taxRate: 18,
        taxableValue: 50000,
        amount: 59000,
      },
    ];

    const { tax } = calculateDocumentTax(items, 'cgst_sgst', 18);
    expect(tax.taxableValueTotal).toBe(50000);
    expect(tax.cgstAmount).toBe(4500);
    expect(tax.sgstAmount).toBe(4500);
    expect(tax.igstAmount).toBe(0);
    expect(tax.taxTotal).toBe(9000);
    expect(tax.grandTotal).toBe(59000);
  });

  it('calculates inter-state IGST without splitting on document', () => {
    const items: DocumentItem[] = [
      {
        id: '1',
        sNo: 1,
        description: 'Cross-Border Cloud Service',
        sacHsn: '998314',
        quantity: 1,
        rate: 100000,
        discount: 0,
        taxRate: 18,
        taxableValue: 100000,
        amount: 118000,
      },
    ];

    const { tax } = calculateDocumentTax(items, 'igst', 18);
    expect(tax.taxableValueTotal).toBe(100000);
    expect(tax.cgstAmount).toBe(0);
    expect(tax.sgstAmount).toBe(0);
    expect(tax.igstAmount).toBe(18000);
    expect(tax.taxTotal).toBe(18000);
    expect(tax.grandTotal).toBe(118000);
  });

  it('correctly handles non-chargeable included items without adding to tax', () => {
    const items: DocumentItem[] = [
      {
        id: '1',
        sNo: 1,
        description: 'Business Website Package',
        sacHsn: '998314',
        quantity: 1,
        rate: 20000,
        discount: 0,
        taxRate: 18,
        taxableValue: 20000,
        amount: 23600,
        isIncluded: false,
      },
      {
        id: '2',
        sNo: 2,
        description: 'Domain & SSL (Included)',
        sacHsn: '—',
        quantity: '—',
        rate: 0,
        discount: 0,
        taxRate: 0,
        taxableValue: 0,
        amount: 0,
        isIncluded: true,
      },
    ];

    const { tax } = calculateDocumentTax(items, 'cgst_sgst', 18);
    expect(tax.taxableValueTotal).toBe(20000);
    expect(tax.taxTotal).toBe(3600);
    expect(tax.grandTotal).toBe(23600);
  });

  it('supports automatic integer round-off computation', () => {
    const items: DocumentItem[] = [
      {
        id: '1',
        sNo: 1,
        description: 'Service with odd cents',
        sacHsn: '998314',
        quantity: 1,
        rate: 1234.56,
        discount: 0,
        taxRate: 18,
        taxableValue: 1234.56,
        amount: 1456.78,
      },
    ];

    const { tax } = calculateDocumentTax(items, 'igst', 18, 0, true);
    // Pre-round = 1234.56 + 222.22 = 1456.78
    // Round to 1457 -> roundOff = +0.22
    expect(tax.grandTotal).toBe(1457);
    expect(tax.roundOff).toBe(0.22);
  });
});
