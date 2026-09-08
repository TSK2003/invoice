export const VALID_GST_RATES = [0, 5, 12, 18, 28] as const;
export type ValidGstRate = typeof VALID_GST_RATES[number];

export const GST_RATE_OPTIONS = [
  { value: 0, label: '0% (Exempt/Nil)' },
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18% (Standard Services)' },
  { value: 28, label: '28%' }
];
