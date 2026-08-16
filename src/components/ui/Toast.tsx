import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-primary" />;
      case 'info':
        return <Info className="w-4 h-4 text-brand" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-brand" />;
    }
  };

  return (
    <div className="no-print print:hidden fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2.5 bg-surface text-primary rounded-md shadow-subtle border border-line text-xs font-medium">
      {getIcon()}
      <span>{toast.title}</span>
      <button
        onClick={onClose}
        className="ml-2 text-secondary hover:text-primary p-0.5 rounded-xs transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

