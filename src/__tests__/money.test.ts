import { describe, it, expect } from 'vitest';
import { roundMoney, toFixedMoney, parseMoney, sumMoney } from '../utils/money';

describe('Money Utilities (2-decimal precision)', () => {
  it('correctly rounds values avoiding IEEE-754 precision issues', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
    expect(roundMoney(10.005)).toBe(10.01);
    expect(roundMoney(10.004)).toBe(10);
    expect(roundMoney(19999.999)).toBe(20000);
  });

  it('formats to fixed 2-decimal string', () => {
    expect(toFixedMoney(15000)).toBe('15000.00');
    expect(toFixedMoney(15000.5)).toBe('15000.50');
    expect(toFixedMoney(0)).toBe('0.00');
  });

  it('safely parses strings with currency symbols and decimals', () => {
    expect(parseMoney('₹15,000.50')).toBe(15000.5);
    expect(parseMoney('  ₹ 1,234.99 ')).toBe(1234.99);
    expect(parseMoney('')).toBe(0);
    expect(parseMoney(null)).toBe(0);
    expect(parseMoney(undefined)).toBe(0);
  });

  it('safely sums numbers with exact 2-decimal rounding', () => {
    expect(sumMoney(10.15, 20.25, 30.35)).toBe(60.75);
    expect(sumMoney(0.1, 0.2)).toBe(0.3);
  });
});
