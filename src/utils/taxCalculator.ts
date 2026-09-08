import { DocumentItem, TaxConfig, TaxType } from '../types/document';

/**
 * Calculates live taxable values, tax split, round-off, and grand total.
 */
export const calculateTaxTotals = (
  items: DocumentItem[],
  taxType: TaxType,
  gstRate: number,
  manualRoundOff = 0
): TaxConfig => {
  // Sum up all taxable amounts (ignoring non-chargeable included items)
  const taxableValueTotal = items.reduce((sum, item) => {
    if (item.isIncluded) return sum;
    const qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 1;
    const rate = item.rate || 0;
    const discount = item.discount || 0;
    const lineSubtotal = Math.max(0, (qty * rate) - discount);
    return sum + lineSubtotal;
  }, 0);

  let cgstPercent = 0;
  let sgstPercent = 0;
  let igstPercent = 0;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxType === 'cgst_sgst') {
    cgstPercent = gstRate / 2;
    sgstPercent = gstRate / 2;
    cgstAmount = Math.round(taxableValueTotal * (cgstPercent / 100));
    sgstAmount = Math.round(taxableValueTotal * (sgstPercent / 100));
  } else if (taxType === 'igst') {
    igstPercent = gstRate;
    igstAmount = Math.round(taxableValueTotal * (igstPercent / 100));
  }

  const taxTotal = cgstAmount + sgstAmount + igstAmount;
  const rawGrandTotal = taxableValueTotal + taxTotal + manualRoundOff;
  const grandTotal = Math.round(rawGrandTotal);

  return {
    taxType,
    gstRate,
    cgstPercent,
    sgstPercent,
    igstPercent,
    roundOff: manualRoundOff,
    taxableValueTotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxTotal,
    grandTotal,
  };
};
