/**
 * Financial rounding and currency utilities with 2-decimal precision.
 * Avoids IEEE-754 floating-point inaccuracies.
 */

export function roundMoney(value: number): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toFixedMoney(value: number): string {
  const rounded = roundMoney(value);
  return rounded.toFixed(2);
}

export function parseMoney(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : roundMoney(value);
  const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : roundMoney(parsed);
}

export function sumMoney(...values: number[]): number {
  const total = values.reduce((acc, curr) => acc + (isNaN(curr) ? 0 : curr), 0);
  return roundMoney(total);
}
