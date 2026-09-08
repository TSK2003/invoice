import { describe, it, expect } from 'vitest';
import { canTransition, getValidNextStatuses } from '../utils/statusMachine';

describe('Document Status State Machine', () => {
  it('allows valid quotation status transitions', () => {
    expect(canTransition('quotation', 'draft', 'sent')).toBe(true);
    expect(canTransition('quotation', 'draft', 'accepted')).toBe(true);
    expect(canTransition('quotation', 'sent', 'accepted')).toBe(true);
    expect(canTransition('quotation', 'accepted', 'converted')).toBe(true);
    expect(canTransition('quotation', 'rejected', 'draft')).toBe(true);
  });

  it('prevents invalid quotation transitions', () => {
    // Converted quotation cannot revert to draft or sent
    expect(canTransition('quotation', 'converted', 'draft')).toBe(false);
    expect(canTransition('quotation', 'converted', 'sent')).toBe(false);
  });

  it('allows valid invoice transitions', () => {
    expect(canTransition('tax_invoice', 'draft', 'issued')).toBe(true);
    expect(canTransition('tax_invoice', 'issued', 'partially_paid')).toBe(true);
    expect(canTransition('tax_invoice', 'partially_paid', 'paid')).toBe(true);
    expect(canTransition('tax_invoice', 'issued', 'overdue')).toBe(true);
  });

  it('prevents invalid transitions between incompatible document types', () => {
    expect(canTransition('tax_invoice', 'paid', 'converted')).toBe(false);
  });
});
