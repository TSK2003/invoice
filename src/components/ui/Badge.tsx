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
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'issued':
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'partially_paid':
      case 'partial payment':
      case 'advance payment':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'overdue':
      case 'expired':
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const formatText = (st: string) => {
    return st.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75" />
      {formatText(status)}
    </span>
  );
};
