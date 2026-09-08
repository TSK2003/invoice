import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullPage = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-brand`} />
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-xs">
        <div className="bg-white rounded-xl p-4 shadow-xl border border-slate-200">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
