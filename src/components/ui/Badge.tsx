import React from 'react';
import { DocumentStatus } from '../../types/document';
import { getStatusStyle } from '../../utils/statusMachine';

interface BadgeProps {
  status: DocumentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const style = getStatusStyle(status as DocumentStatus);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-80" />
      {style.label}
    </span>
  );
};
