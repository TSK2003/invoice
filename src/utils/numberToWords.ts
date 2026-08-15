const a = [
  '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
  'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
];

const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

/**
 * Converts a number to Indian currency words representation.
 * Example: 15000 -> Rupees Fifteen Thousand Only
 */
export const numberToWords = (num: number): string => {
  if (isNaN(num) || num === null || num === undefined) return 'Zero Rupees Only';
  if (num === 0) return 'Rupees Zero Only';

  const n = Math.floor(Math.abs(num));
  let str = '';

  const convertLessThanThousand = (val: number): string => {
    let temp = '';
    if (val > 99) {
      temp += a[Math.floor(val / 100)] + 'Hundred ';
      val %= 100;
    }
    if (val > 19) {
      temp += b[Math.floor(val / 10)] + ' ' + a[val % 10];
    } else {
      temp += a[val];
    }
    return temp;
  };

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remainder = n % 1000;

  if (crore > 0) {
    str += convertLessThanThousand(crore) + 'Crore ';
  }
  if (lakh > 0) {
    str += convertLessThanThousand(lakh) + 'Lakh ';
  }
  if (thousand > 0) {
    str += convertLessThanThousand(thousand) + 'Thousand ';
  }
  if (remainder > 0) {
    str += convertLessThanThousand(remainder);
  }

  const result = str.trim();
  return result ? `Rupees ${result} Only` : 'Rupees Zero Only';
};
