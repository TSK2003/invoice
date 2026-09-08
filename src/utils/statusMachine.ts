import { DocumentStatus, DocumentType } from '../types/document';

const QUOTATION_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  draft: ['sent', 'accepted', 'rejected', 'expired'],
  sent: ['accepted', 'rejected', 'expired'],
  accepted: ['converted'],
  rejected: ['draft'],
  expired: ['draft'],
  converted: [],
  issued: [],
  partially_paid: [],
  paid: [],
  overdue: [],
  cancelled: [],
  generated: [],
};

const INVOICE_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  issued: ['partially_paid', 'paid', 'overdue', 'cancelled'],
  partially_paid: ['paid', 'overdue', 'cancelled'],
  overdue: ['partially_paid', 'paid', 'cancelled'],
  paid: ['cancelled'],
  cancelled: [],
  draft: ['issued', 'cancelled'],
  sent: [],
  accepted: [],
  rejected: [],
  expired: [],
  converted: [],
  generated: [],
};

const RECEIPT_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  generated: [],
  draft: [],
  sent: [],
  accepted: [],
  rejected: [],
  expired: [],
  converted: [],
  issued: [],
  partially_paid: [],
  paid: [],
  overdue: [],
  cancelled: [],
};

export function getValidNextStatuses(type: DocumentType, currentStatus: DocumentStatus): DocumentStatus[] {
  if (type === 'quotation') {
    return QUOTATION_TRANSITIONS[currentStatus] || [];
  } else if (type === 'tax_invoice') {
    return INVOICE_TRANSITIONS[currentStatus] || [];
  } else {
    return RECEIPT_TRANSITIONS[currentStatus] || [];
  }
}

export function canTransition(type: DocumentType, from: DocumentStatus, to: DocumentStatus): boolean {
  if (from === to) return true;
  const validNext = getValidNextStatuses(type, from);
  return validNext.includes(to);
}

export interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export function getStatusStyle(status: DocumentStatus): StatusStyle {
  switch (status) {
    case 'draft':
      return { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    case 'sent':
      return { label: 'Sent', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' };
    case 'accepted':
      return { label: 'Accepted', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' };
    case 'rejected':
      return { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' };
    case 'expired':
      return { label: 'Expired', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' };
    case 'converted':
      return { label: 'Converted to Invoice', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' };
    case 'issued':
      return { label: 'Issued / Unpaid', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' };
    case 'partially_paid':
      return { label: 'Partially Paid', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' };
    case 'paid':
      return { label: 'Paid in Full', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' };
    case 'overdue':
      return { label: 'Overdue', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-slate-200', text: 'text-slate-600', border: 'border-slate-300' };
    case 'generated':
      return { label: 'Receipt Issued', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300' };
    default:
      return { label: String(status), bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  }
}
