import { roundMoney } from './money';

/**
 * Formats a numeric value into Indian Rupee currency format with 2-decimal precision.
 * Example: 15000 -> ₹15,000.00 or ₹15,000 (if integer and decimal toggle is false)
 */
export const formatCurrency = (
  val: number | string | undefined | null,
  showSymbol = true,
  decimals = 2
): string => {
  if (val === null || val === undefined || val === '') {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num)) return showSymbol ? '₹0.00' : '0.00';

  const rounded = roundMoney(num);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rounded);

  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Parses currency strings safely into a 2-decimal rounded number.
 */
export const parseCurrency = (str: string | number | undefined | null): number => {
  if (str === undefined || str === null || str === '') return 0;
  if (typeof str === 'number') return isNaN(str) ? 0 : roundMoney(str);
  const clean = str.toString().replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : roundMoney(parsed);
};
