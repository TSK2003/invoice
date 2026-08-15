import React from 'react';
import { DocumentStatus } from '../../types/document';

interface BadgeProps {
  status: DocumentStatus | string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const getBadgeStyle = (st: string) => {
    switch (st.toLowerCase()) {
      case 'accepted':
      case 'paid':
      case 'generated':
      case 'paid in full':
        return 'bg-brand-50 text-brand border-brand-200';
      case 'issued':
      case 'sent':
        return 'bg-brand-50 text-brand border-brand-200';
      case 'partially_paid':
      case 'partial payment':
      case 'advance payment':
        return 'bg-page text-primary border-line';
      case 'draft':
        return 'bg-page text-secondary border-line';
      case 'overdue':
      case 'expired':
      case 'rejected':
        return 'bg-slate-100 text-primary border-slate-300';
      case 'cancelled':
        return 'bg-slate-100 text-muted border-line';
      default:
        return 'bg-page text-secondary border-line';
    }
  };

  const formatText = (st: string) => {
    return st.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-semibold border ${getBadgeStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70" />
      {formatText(status)}
    </span>
  );
};

