export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Cheque' | 'Cash' | 'Credit Card';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  customerId: string;
  customerName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  notes: string;
  receiptId?: string;
  receiptNumber?: string;
  companyId?: string;
  createdBy?: string;
  createdAt: string;
}

export type PaymentInput = Omit<Payment, 'id' | 'createdAt'>;
