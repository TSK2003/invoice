import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DocumentData, DocumentType } from './types/document';
import { CompanyProfile } from './types/document';
import { DocumentTemplateConfig } from './types/template';
import { storageService } from './services/storage/LocalStorageService';
import { DashboardStats } from './services/storage/IDocumentStorage';
import { Header } from './components/ui/Header';
import { Toast, ToastMessage } from './components/ui/Toast';
import { DocumentDashboard } from './components/dashboard/DocumentDashboard';
import { DocumentBuilder } from './components/builder/DocumentBuilder';
import { DocumentCreationHub } from './components/builder/DocumentCreationHub';
import { CompanyForm } from './components/builder/CompanyForm';
import { TemplateSettingsEditor } from './components/builder/TemplateSettingsEditor';
import { LoginPage } from './components/auth/LoginPage';
import { authService } from './services/authService';
import { DEFAULT_COMPANY_PROFILE } from './constants/defaultCompany';
import { AESCION_PROFESSIONAL_TEMPLATE } from './constants/initialTemplates';
import { AESCION_PACKAGES } from './constants/packages';
import { exportToPDF, printDocument } from './services/pdfExportService';
import { DEFAULT_QUOTATION_TERMS, DEFAULT_INVOICE_TERMS, DEFAULT_RECEIPT_TERMS } from './constants/defaultTerms';
import { SEAL_BASE64, SIGNATURE_BASE64 } from './constants/imageAssets';
import { DocumentRenderer } from './components/preview/DocumentRenderer';

export const App: React.FC = () => {
  // Authentication & Inactivity State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [sessionExpiredReason, setSessionExpiredReason] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<'dashboard' | 'builder' | 'company' | 'template'>('dashboard');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotations: 0,
    totalInvoices: 0,
    totalReceipts: 0,
    pendingPaymentsAmount: 0,
    paidAmount: 0,
    outstandingAmount: 0,
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [templateConfig, setTemplateConfig] = useState<DocumentTemplateConfig>(AESCION_PROFESSIONAL_TEMPLATE);
  
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
  const [exportingDoc, setExportingDoc] = useState<DocumentData | null>(null);
  const [autoSaveTime, setAutoSaveTime] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: `toast-${Date.now()}`,
      title,
      type,
    });
  };

  // 15-Minute Inactivity Auto-Logout Listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      authService.touchActivity();
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Check expiration every 5 seconds
    const intervalId = setInterval(() => {
      if (!authService.isAuthenticated()) {
        setIsAuthenticated(false);
        setSessionExpiredReason('Session expired due to 15 minutes of inactivity. Please sign in again.');
      }
    }, 5000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setSessionExpiredReason(null);
    refreshData();
    showToast('Signed in to AESCION Document Studio');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setSessionExpiredReason(null);
    showToast('Logged out successfully', 'info');
  };

  // Load all documents, stats, company profile & template settings
  const refreshData = useCallback(async () => {
    const allDocs = await storageService.getAllDocuments();
    const currentStats = await storageService.getStats();
    const loadedCompany = await storageService.getCompanyProfile();
    const loadedTemplate = await storageService.getTemplateConfig();
    setDocuments(allDocs);
    setStats(currentStats);
    setCompanyProfile(loadedCompany);
    setTemplateConfig(loadedTemplate);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSaveCompanyProfile = async (profileToSave?: CompanyProfile) => {
    const target = profileToSave || companyProfile;
    await storageService.saveCompanyProfile(target);
    setCompanyProfile(target);
    if (currentDocument) {
      const updatedDoc = { ...currentDocument, company: target };
      setCurrentDocument(updatedDoc);
      storageService.saveCurrentDraft(updatedDoc);
    }
    showToast('Company profile settings saved successfully');
  };

  const handleSaveTemplateConfig = async (configToSave?: DocumentTemplateConfig) => {
    const target = configToSave || templateConfig;
    await storageService.saveTemplateConfig(target);
    setTemplateConfig(target);
    showToast('Template settings saved successfully');
  };

  // Create a brand new document template
  const createNewDocument = async (type: DocumentType = 'quotation') => {
    const now = new Date().toISOString().split('T')[0];
    const nextDocNo = await storageService.generateNextDocumentNumber(type);

    const defaultPkg = AESCION_PACKAGES[1]; // Business Website default

    const termsToUse = type === 'quotation'
      ? templateConfig.defaultTermsQuotation
      : type === 'tax_invoice'
      ? templateConfig.defaultTermsInvoice
      : DEFAULT_RECEIPT_TERMS;

    const newDoc: DocumentData = {
      id: `doc-${Date.now()}`,
      type,
      documentNumber: nextDocNo,
      date: now,
      validUntilOrDueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: type === 'quotation' ? 'draft' : type === 'tax_invoice' ? 'draft' : 'generated',
      packageId: type === 'quotation' ? defaultPkg.id : undefined,
      packageName: type === 'quotation' ? defaultPkg.name : undefined,
      client: {
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        billingAddress: '',
        city: 'Chennai',
        state: 'Tamil Nadu',
        stateCode: '33',
        pincode: '600032',
        gstin: '',
        pan: '',
        placeOfSupply: 'Tamil Nadu (33)',
        website: '',
        notes: '',
      },
      company: companyProfile,
      items: type === 'quotation' ? [
        {
          id: `item-main-${Date.now()}`,
          sNo: 1,
          description: `${defaultPkg.name} Development — ${defaultPkg.maxPagesText}`,
          sacHsn: '998314',
          quantity: 1,
          rate: defaultPkg.basePrice,
          discount: 0,
          taxRate: 18,
          taxableValue: defaultPkg.basePrice,
          amount: defaultPkg.basePrice,
          isIncluded: false,
        },
        ...defaultPkg.includedServices.map((inc, i) => ({
          id: `item-inc-${Date.now()}-${i}`,
          sNo: i + 2,
          description: `${inc} (Included)`,
          sacHsn: '—',
          quantity: '—',
          rate: 0,
          discount: 0,
          taxRate: 0,
          taxableValue: 0,
          amount: 0,
          isIncluded: true,
        })),
      ] : [
        {
          id: `item-main-${Date.now()}`,
          sNo: 1,
          description: 'Software & Web Application Development Services',
          sacHsn: '998314',
          quantity: 1,
          rate: 15000,
          discount: 0,
          taxRate: 18,
          taxableValue: 15000,
          amount: 15000,
          isIncluded: false,
        }
      ],
      tax: {
        taxType: 'cgst_sgst',
        gstRate: 18,
        cgstPercent: 9,
        sgstPercent: 9,
        igstPercent: 0,
        roundOff: 0,
        taxableValueTotal: defaultPkg.basePrice,
        cgstAmount: Math.round(defaultPkg.basePrice * 0.09),
        sgstAmount: Math.round(defaultPkg.basePrice * 0.09),
        igstAmount: 0,
        taxTotal: Math.round(defaultPkg.basePrice * 0.18),
        grandTotal: Math.round(defaultPkg.basePrice * 1.18),
      },
      paymentTerms: {
        preset: '50_50',
        advancePercentage: 50,
        balancePercentage: 50,
        advanceAmount: Math.round((defaultPkg.basePrice * 1.18) * 0.5),
        balanceAmount: Math.round((defaultPkg.basePrice * 1.18) * 0.5),
        customTermsText: '50% advance, balance 50% upon deployment.',
        deliveryTimelineText: '10-14 working days from advance payment.',
      },
      receiptDetails: type === 'payment_receipt' ? {
        receivedFrom: '',
        invoiceReference: '',
        projectPurpose: 'Software Development Services',
        paymentMethod: 'UPI',
        transactionReference: '',
        amountReceived: 17700,
        invoiceTotal: 17700,
        balanceDue: 0,
        paymentStatus: 'Paid in Full',
      } : undefined,
      notes: '',
      termsAndConditions: termsToUse,
      signatureSeal: {
        showSeal: true,
        showSignature: true,
        sealImageUrl: SEAL_BASE64,
        signatureImageUrl: SIGNATURE_BASE64,
        signatoryTitle: 'Authorized Signatory',
        customerSignatoryTitle: 'Customer Representative',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentDocument(newDoc);
    setCurrentView('builder');
    showToast(`Created new ${type.replace(/_/g, ' ')} template`);
  };

  // Switch document type dynamically in builder
  const handleTypeSwitch = async (newType: DocumentType) => {
    if (!currentDocument) return;
    if (currentDocument.type === newType) return;

    const nextDocNo = await storageService.generateNextDocumentNumber(newType);
    const termsToUse = newType === 'quotation'
      ? templateConfig.defaultTermsQuotation
      : newType === 'tax_invoice'
      ? templateConfig.defaultTermsInvoice
      : DEFAULT_RECEIPT_TERMS;

    const updated: DocumentData = {
      ...currentDocument,
      type: newType,
      documentNumber: nextDocNo,
      status: newType === 'quotation' ? 'draft' : newType === 'tax_invoice' ? 'draft' : 'generated',
      termsAndConditions: termsToUse,
      signatureSeal: {
        ...currentDocument.signatureSeal,
        sealImageUrl: currentDocument.signatureSeal?.sealImageUrl || SEAL_BASE64,
        signatureImageUrl: currentDocument.signatureSeal?.signatureImageUrl || SIGNATURE_BASE64,
      },
      receiptDetails: newType === 'payment_receipt' && !currentDocument.receiptDetails ? {
        receivedFrom: currentDocument.client.companyName,
        invoiceReference: currentDocument.documentNumber,
        projectPurpose: 'Software Development Services',
        paymentMethod: 'UPI',
        transactionReference: '',
        amountReceived: currentDocument.tax.grandTotal || 0,
        invoiceTotal: currentDocument.tax.grandTotal || 0,
        balanceDue: 0,
        paymentStatus: 'Paid in Full',
      } : currentDocument.receiptDetails,
    };

    setCurrentDocument(updated);
    showToast(`Switched document type to ${newType.replace(/_/g, ' ')}`, 'info');
  };

  // Edit document
  const handleEditDocument = (docToEdit: DocumentData) => {
    const updatedDoc: DocumentData = {
      ...docToEdit,
      signatureSeal: {
        ...docToEdit.signatureSeal,
        sealImageUrl: docToEdit.signatureSeal?.sealImageUrl || SEAL_BASE64,
        signatureImageUrl: docToEdit.signatureSeal?.signatureImageUrl || SIGNATURE_BASE64,
      },
    };
    setCurrentDocument(updatedDoc);
    setCurrentView('builder');
  };

  // Duplicate document
  const handleDuplicateDocument = async (id: string) => {
    const dup = await storageService.duplicateDocument(id);
    if (dup) {
      await refreshData();
      showToast(`Duplicated as ${dup.documentNumber}`);
    }
  };

  // Save current document
  const handleSaveDocument = async () => {
    if (!currentDocument) return;
    const saved = await storageService.saveDocument(currentDocument);
    setCurrentDocument(saved);
    await refreshData();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAutoSaveTime(timeStr);
    showToast(`Saved document ${saved.documentNumber}`);
  };

  // Delete document
  const handleDeleteDocument = async (id: string) => {
    const success = await storageService.deleteDocument(id);
    if (success) {
      // If the deleted document was currently active in builder, reset currentDocument
      if (currentDocument?.id === id) {
        setCurrentDocument(null);
      }
      await refreshData();
      showToast('Document deleted', 'info');
    }
  };

  // Download PDF
  const handleDownloadPDF = async (docToExport?: DocumentData) => {
    const target = docToExport || currentDocument;
    if (!target) return;

    try {
      showToast(`Generating PDF for ${target.documentNumber}...`, 'info');

      if (currentDocument && (!docToExport || docToExport.id === currentDocument.id)) {
        await exportToPDF({
          elementId: 'document-print-canvas',
          fileName: `${target.documentNumber}_${target.client?.companyName || 'Document'}.pdf`,
        });
      } else {
        // Set exportingDoc to trigger portal render
        setExportingDoc(target);
        await new Promise(resolve => setTimeout(resolve, 200));
        await exportToPDF({
          elementId: 'document-print-canvas',
          fileName: `${target.documentNumber}_${target.client?.companyName || 'Document'}.pdf`,
        });
        setExportingDoc(null);
      }
      showToast('PDF downloaded successfully!');
    } catch (e) {
      console.error('PDF export failed, falling back to window.print()', e);
      setExportingDoc(null);
      printDocument();
    }
  };

  const activeDocumentForPrint = exportingDoc || currentDocument;

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          sessionExpiredReason={sessionExpiredReason}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-page flex flex-col font-sans text-primary">
      {/* Header Navbar */}
      <Header
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        onCreateNew={() => createNewDocument('quotation')}
        onLogout={handleLogout}
        autoSaveTime={autoSaveTime}
      />

      {/* Main Content Router */}
      <main className={`flex-1 w-full mx-auto ${currentView === 'builder' ? 'p-0 max-w-full' : 'max-w-[1680px] p-4 sm:p-6 lg:p-8'}`}>
        {currentView === 'dashboard' && (
          <DocumentDashboard
            documents={documents}
            stats={stats}
            onCreateNew={type => createNewDocument(type)}
            onEdit={handleEditDocument}
            onDuplicate={handleDuplicateDocument}
            onDownloadPDF={handleDownloadPDF}
            onDelete={handleDeleteDocument}
          />
        )}

        {currentView === 'builder' && (
          currentDocument ? (
            <DocumentBuilder
              document={currentDocument}
              onChangeDocument={doc => {
                setCurrentDocument(doc);
                storageService.saveCurrentDraft(doc);
                setAutoSaveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              }}
              onSaveDocument={handleSaveDocument}
              onDownloadPDF={() => handleDownloadPDF(currentDocument)}
              onPrint={printDocument}
              onTypeChange={handleTypeSwitch}
            />
          ) : (
            <DocumentCreationHub
              onCreateType={type => createNewDocument(type)}
              onGoToDashboard={() => setCurrentView('dashboard')}
            />
          )
        )}

        {currentView === 'company' && (
          <CompanyForm
            company={companyProfile}
            onChangeCompany={updated => {
              setCompanyProfile(updated);
              storageService.saveCompanyProfile(updated);
              if (currentDocument) {
                setCurrentDocument(prev => prev ? { ...prev, company: updated } : null);
              }
            }}
            onSaveProfile={() => handleSaveCompanyProfile()}
          />
        )}

        {currentView === 'template' && (
          <TemplateSettingsEditor
            template={templateConfig}
            onChangeTemplate={updated => {
              setTemplateConfig(updated);
              storageService.saveTemplateConfig(updated);
            }}
            onSaveTemplate={() => handleSaveTemplateConfig()}
          />
        )}
      </main>

      {/* ISOLATED PRINT & PDF ROOT (Mounted outside #root via React Portal) */}
      {activeDocumentForPrint && createPortal(
        <div id="document-print-root">
          <DocumentRenderer data={activeDocumentForPrint} containerId="document-print-canvas" />
        </div>,
        document.body
      )}

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

