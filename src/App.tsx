import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/providers/AuthProvider';
import { CompanyProvider } from './app/providers/CompanyProvider';
import { ToastProvider } from './app/providers/ToastProvider';
import { AppRouter } from './app/Router';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CompanyProvider>
            <ToastProvider>
              <AppRouter />
            </ToastProvider>
          </CompanyProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
