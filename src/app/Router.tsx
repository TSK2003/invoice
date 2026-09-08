import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Lazy loaded feature routes for fast bundle performance
const LoginPage = lazy(() => import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const DocumentListPage = lazy(() => import('../features/documents/DocumentListPage').then((m) => ({ default: m.DocumentListPage })));
const DocumentEditPage = lazy(() => import('../features/documents/DocumentEditPage').then((m) => ({ default: m.DocumentEditPage })));
const DocumentViewPage = lazy(() => import('../features/documents/DocumentViewPage').then((m) => ({ default: m.DocumentViewPage })));
const CustomerList = lazy(() => import('../features/customers/CustomerList').then((m) => ({ default: m.CustomerList })));
const PaymentList = lazy(() => import('../features/payments/PaymentList').then((m) => ({ default: m.PaymentList })));
const CompanyPage = lazy(() => import('../features/settings/CompanyPage').then((m) => ({ default: m.CompanyPage })));
const TemplatePage = lazy(() => import('../features/settings/TemplatePage').then((m) => ({ default: m.TemplatePage })));
const DataManagementPage = lazy(() => import('../features/settings/DataManagementPage').then((m) => ({ default: m.DataManagementPage })));

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullPage text="Loading Document Studio..." />}>
      <Routes>
        {/* Public Auth Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Protected Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DocumentListPage />} />
            <Route path="/documents" element={<DocumentListPage />} />
            <Route path="/documents/new" element={<Navigate to="/documents/new/quotation" replace />} />
            <Route path="/documents/new/:type" element={<DocumentEditPage />} />
            <Route path="/documents/:id" element={<DocumentEditPage />} />
            <Route path="/documents/:id/view" element={<DocumentViewPage />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/payments" element={<PaymentList />} />
            <Route path="/company" element={<CompanyPage />} />
            <Route path="/templates" element={<TemplatePage />} />
            <Route path="/settings/data" element={<DataManagementPage />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
