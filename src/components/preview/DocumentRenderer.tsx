import React from 'react';
import { DocumentData } from '../../types/document';
import { QuotationDocument } from './QuotationDocument';
import { TaxInvoiceDocument } from './TaxInvoiceDocument';
import { PaymentReceiptDocument } from './PaymentReceiptDocument';

export interface DocumentRendererProps {
  data: DocumentData;
  containerId?: string;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  data,
  containerId = 'live-preview-a4-canvas',
}) => {
  switch (data.type) {
    case 'quotation':
      return <QuotationDocument data={data} containerId={containerId} />;

    case 'tax_invoice':
      return <TaxInvoiceDocument data={data} containerId={containerId} />;

    case 'payment_receipt':
      return <PaymentReceiptDocument data={data} containerId={containerId} />;

    default:
      return <QuotationDocument data={data} containerId={containerId} />;
  }
};
