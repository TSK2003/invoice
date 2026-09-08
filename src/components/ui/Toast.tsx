import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="no-print print:hidden fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timeout = toast.duration ?? 4000;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, timeout);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          container: 'bg-white border-rose-200 shadow-lg shadow-rose-500/10 text-slate-800',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          container: 'bg-white border-amber-200 shadow-lg shadow-amber-500/10 text-slate-800',
        };
      case 'info':
        return {
          icon: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
          container: 'bg-white border-sky-200 shadow-lg shadow-sky-500/10 text-slate-800',
        };
      default:
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          container: 'bg-white border-emerald-200 shadow-lg shadow-emerald-500/10 text-slate-800',
        };
    }
  };

  const style = getStyle();

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border text-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${style.container}`}
    >
      {style.icon}
      <div className="flex-1 min-w-0">
        <p className="font-semibold leading-snug">{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Backwards compatibility for single-toast callers
export interface ToastMessage {
  id: string;
  title: string;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<{ toast: ToastMessage | null; onClose: () => void }> = ({ toast, onClose }) => {
  if (!toast) return null;
  return <ToastContainer toasts={[toast]} onDismiss={() => onClose()} />;
};
