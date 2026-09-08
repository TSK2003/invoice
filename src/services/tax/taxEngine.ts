import { DocumentItem, TaxConfig, TaxType } from '../../types/document';
import { roundMoney, sumMoney } from '../../utils/money';

export interface LineTaxCalculation {
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
}

/**
 * Determines whether supply is intra-state (CGST + SGST) or inter-state (IGST).
 * State codes are 2-digit Indian GST state codes (e.g. "33" for Tamil Nadu).
 */
export function determineTaxType(
  companyStateCode?: string,
  customerStateCode?: string
): TaxType {
  if (!companyStateCode || !customerStateCode) {
    return 'cgst_sgst'; // Default for domestic unless interstate specified
  }

  const cleanCompany = companyStateCode.trim().padStart(2, '0');
  const cleanCustomer = customerStateCode.trim().padStart(2, '0');

  if (cleanCompany === cleanCustomer) {
    return 'cgst_sgst';
  } else {
    return 'igst';
  }
}

/**
 * Calculates a single line item's taxable value and gross amount.
 */
export function calculateLineItem(
  item: DocumentItem,
  taxType: TaxType,
  fallbackRate = 18
): DocumentItem {
  if (item.isIncluded) {
    return {
      ...item,
      taxableValue: 0,
      amount: 0,
    };
  }

  const qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 1;
  const rate = typeof item.rate === 'number' ? item.rate : parseFloat(String(item.rate)) || 0;
  const discount = typeof item.discount === 'number' ? item.discount : parseFloat(String(item.discount)) || 0;

  const grossLine = roundMoney(qty * rate);
  const effectiveDiscount = Math.min(grossLine, Math.max(0, discount));
  const taxableValue = roundMoney(Math.max(0, grossLine - effectiveDiscount));

  const effectiveTaxRate = item.taxRate !== undefined && !isNaN(item.taxRate)
    ? item.taxRate
    : fallbackRate;

  let lineTax = 0;
  if (taxType !== 'none' && effectiveTaxRate > 0) {
    lineTax = roundMoney(taxableValue * (effectiveTaxRate / 100));
  }

  const amount = roundMoney(taxableValue + lineTax);

  return {
    ...item,
    quantity: qty,
    rate,
    discount: effectiveDiscount,
    taxRate: effectiveTaxRate,
    taxableValue,
    amount,
  };
}

/**
 * Authoritative document tax calculation engine for AESCION Document Studio.
 * Computes per-item and document-wide tax totals with financial precision.
 */
export function calculateDocumentTax(
  items: DocumentItem[],
  taxType: TaxType,
  defaultGstRate = 18,
  manualRoundOff = 0,
  autoRoundOff = false
): { items: DocumentItem[]; tax: TaxConfig } {
  let taxableValueTotal = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  const processedItems = items.map((rawItem) => {
    const calculated = calculateLineItem(rawItem, taxType, defaultGstRate);
    if (!calculated.isIncluded) {
      taxableValueTotal = sumMoney(taxableValueTotal, calculated.taxableValue);

      if (taxType === 'cgst_sgst') {
        const itemTax = roundMoney(calculated.taxableValue * (calculated.taxRate / 100));
        const halfTax = roundMoney(itemTax / 2);
        cgstAmount = sumMoney(cgstAmount, halfTax);
        sgstAmount = sumMoney(sgstAmount, halfTax);
      } else if (taxType === 'igst') {
        const itemTax = roundMoney(calculated.taxableValue * (calculated.taxRate / 100));
        igstAmount = sumMoney(igstAmount, itemTax);
      }
    }
    return calculated;
  });

  const taxTotal = sumMoney(cgstAmount, sgstAmount, igstAmount);
  const preRoundGrandTotal = sumMoney(taxableValueTotal, taxTotal);

  let finalRoundOff = manualRoundOff;
  let grandTotal = 0;

  if (autoRoundOff) {
    const roundedInt = Math.round(preRoundGrandTotal);
    finalRoundOff = roundMoney(roundedInt - preRoundGrandTotal);
    grandTotal = roundedInt;
  } else {
    grandTotal = sumMoney(preRoundGrandTotal, finalRoundOff);
  }

  const cgstPercent = taxType === 'cgst_sgst' ? defaultGstRate / 2 : 0;
  const sgstPercent = taxType === 'cgst_sgst' ? defaultGstRate / 2 : 0;
  const igstPercent = taxType === 'igst' ? defaultGstRate : 0;

  const taxConfig: TaxConfig = {
    taxType,
    gstRate: defaultGstRate,
    cgstPercent,
    sgstPercent,
    igstPercent,
    roundOff: roundMoney(finalRoundOff),
    taxableValueTotal: roundMoney(taxableValueTotal),
    cgstAmount: roundMoney(cgstAmount),
    sgstAmount: roundMoney(sgstAmount),
    igstAmount: roundMoney(igstAmount),
    taxTotal: roundMoney(taxTotal),
    grandTotal: roundMoney(grandTotal),
  };

  return {
    items: processedItems,
    tax: taxConfig,
  };
}
