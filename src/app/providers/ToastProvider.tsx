import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, ToastItem } from '../../components/ui/Toast';

interface ToastContextType {
  showToast: (title: string, type?: 'success' | 'error' | 'warning' | 'info', message?: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((
    title: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    message?: string
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, type, message }]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => showToast(title, 'success', message), [showToast]);
  const showError = useCallback((title: string, message?: string) => showToast(title, 'error', message), [showToast]);
  const showWarning = useCallback((title: string, message?: string) => showToast(title, 'warning', message), [showToast]);
  const showInfo = useCallback((title: string, message?: string) => showToast(title, 'info', message), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
