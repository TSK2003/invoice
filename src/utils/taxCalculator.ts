import { DocumentItem, TaxConfig, TaxType } from '../types/document';
import { calculateDocumentTax } from '../services/tax/taxEngine';

/**
 * Legacy adapter function that forwards to the authoritative tax engine.
 */
export const calculateTaxTotals = (
  items: DocumentItem[],
  taxType: TaxType,
  gstRate: number,
  manualRoundOff = 0
): TaxConfig => {
  const result = calculateDocumentTax(items, taxType, gstRate, manualRoundOff, false);
  return result.tax;
};
