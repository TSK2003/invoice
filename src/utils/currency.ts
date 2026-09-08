/**
 * Formats a numeric value into Indian Rupee currency format.
 * Example: 15000 -> ₹15,000
 */
export const formatCurrency = (val: number, showSymbol = true): string => {
  if (isNaN(val) || val === null || val === undefined) return showSymbol ? '₹0' : '0';
  
  const rounded = Math.round(val);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(rounded);

  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Parses integer currency strings safely.
 */
export const parseCurrency = (str: string | number): number => {
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  if (!str) return 0;
  const clean = str.toString().replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};
