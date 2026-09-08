import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DocumentData, DocumentType, DocumentItem } from '../../types/document';
import { DocumentBuilder } from '../../components/builder/DocumentBuilder';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useCompany } from '../../app/providers/CompanyProvider';
import { useToast } from '../../app/providers/ToastProvider';
import { 
  fetchDocumentById, 
  saveDocumentToFirestore, 
  getNextDocumentNumber,
  fetchCustomerById 
} from '../../services/firebase/firestore';
import { exportToPDF, printDocument } from '../../services/pdf/pdfService';
import { calculateDocumentTax, determineTaxType } from '../../services/tax/taxEngine';
import { AESCION_PACKAGES } from '../../constants/packages';
import { DocumentRenderer } from '../../components/preview/DocumentRenderer';

export const DocumentEditPage: React.FC = () => {
  const { id, type: routeType } = useParams<{ id?: string; type?: string }>();
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId');
  
  const { company, template } = useCompany();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize a new document
  const initNewDocument = useCallback(async (docType: DocumentType) => {
    setLoading(true);
    try {
      const docNumber = await getNextDocumentNumber(docType);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const validUntilStr = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Default package for quotation
      const defaultPackage = AESCION_PACKAGES[1] || AESCION_PACKAGES[0];
      let initialItems: DocumentItem[] = [];

      if (docType === 'quotation') {
        initialItems = [
          {
            id: `item-pkg-${Date.now()}`,
            sNo: 1,
            description: `${defaultPackage.name} Development — ${defaultPackage.maxPagesText}`,
            sacHsn: '998314',
            quantity: 1,
            rate: defaultPackage.basePrice,
            discount: 0,
            taxRate: 18,
            taxableValue: defaultPackage.basePrice,
            amount: defaultPackage.basePrice,
            isIncluded: false,
          },
          ...defaultPackage.includedServices.map((inc, idx) => ({
            id: `item-inc-${Date.now()}-${idx}`,
            sNo: idx + 2,
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
        ];
      } else {
        initialItems = [
          {
            id: `item-${Date.now()}`,
            sNo: 1,
            description: 'Custom EdTech Software Development & Architecture Services',
            sacHsn: '998314',
            quantity: 1,
            rate: 15000,
            discount: 0,
            taxRate: 18,
            taxableValue: 15000,
            amount: 15000,
            isIncluded: false,
          },
        ];
      }

      // If customerId is provided, preload customer info
      let clientInfo = {
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        billingAddress: '',
        city: '',
        state: 'Tamil Nadu',
        stateCode: '33',
        pincode: '',
        gstin: '',
        pan: '',
        placeOfSupply: 'Tamil Nadu (33)',
        website: '',
        notes: '',
      };

      if (customerIdParam) {
        const foundCustomer = await fetchCustomerById(customerIdParam);
        if (foundCustomer) {
          clientInfo = {
            companyName: foundCustomer.companyName,
            contactPerson: foundCustomer.contactPerson || '',
            email: foundCustomer.email || '',
            phone: foundCustomer.phone || '',
            billingAddress: foundCustomer.billingAddress || '',
            city: foundCustomer.city || '',
            state: foundCustomer.state || '',
            stateCode: foundCustomer.stateCode || '',
            pincode: foundCustomer.pincode || '',
            gstin: foundCustomer.gstin || '',
            pan: foundCustomer.pan || '',
            placeOfSupply: foundCustomer.placeOfSupply || '',
            website: foundCustomer.website || '',
            notes: foundCustomer.notes || '',
          };
        }
      }

      const taxType = determineTaxType(company.stateCode, clientInfo.stateCode);
      const taxResult = calculateDocumentTax(initialItems, taxType, 18, 0, false);

      const newDoc: DocumentData = {
        id: `doc_${Date.now()}`,
        type: docType,
        documentNumber: docNumber,
        date: dateStr,
        validUntilOrDueDate: validUntilStr,
        status: docType === 'tax_invoice' ? 'issued' : docType === 'payment_receipt' ? 'generated' : 'draft',
        customerId: customerIdParam || undefined,
        packageId: docType === 'quotation' ? defaultPackage.id : undefined,
        packageName: docType === 'quotation' ? defaultPackage.name : undefined,
        client: clientInfo,
        company,
        items: taxResult.items,
        tax: taxResult.tax,
        paymentTerms: {
          preset: '50_50',
          advancePercentage: 50,
          balancePercentage: 50,
          advanceAmount: Math.round(taxResult.tax.grandTotal * 0.5),
          balanceAmount: Math.round(taxResult.tax.grandTotal * 0.5),
          customTermsText: '',
          deliveryTimelineText: '3–4 Weeks from receipt of advance and scope sign-off',
        },
        receiptDetails: docType === 'payment_receipt' ? {
          receivedFrom: clientInfo.companyName,
          invoiceReference: '',
          projectPurpose: 'Software Services',
          paymentMethod: 'UPI',
          transactionReference: '',
          amountReceived: taxResult.tax.grandTotal,
          invoiceTotal: taxResult.tax.grandTotal,
          balanceDue: 0,
          paymentStatus: 'Paid in Full',
        } : undefined,
        notes: '',
        termsAndConditions:
          docType === 'quotation'
            ? template.defaultTermsQuotation || []
            : docType === 'tax_invoice'
            ? template.defaultTermsInvoice || []
            : template.defaultTermsReceipt || [],
        signatureSeal: company.signatureSeal || {
          showSeal: true,
          showSignature: true,
          signatoryTitle: 'Authorized Signatory',
          customerSignatoryTitle: 'Customer Representative',
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      setDocument(newDoc);
    } catch (err: any) {
      showError('Failed to initialize document', err.message);
    } finally {
      setLoading(false);
    }
  }, [company, template, customerIdParam, showError]);

  // Load existing document
  const loadExistingDocument = useCallback(async (docId: string) => {
    setLoading(true);
    try {
      const data = await fetchDocumentById(docId);
      if (data) {
        setDocument(data);
      } else {
        showError('Document Not Found', `No document with id ${docId} exists.`);
        navigate('/documents');
      }
    } catch (err: any) {
      showError('Failed to load document', err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate, showError]);

  useEffect(() => {
    if (id) {
      loadExistingDocument(id);
    } else {
      const validTypes: DocumentType[] = ['quotation', 'tax_invoice', 'payment_receipt'];
      const resolvedType: DocumentType = validTypes.includes(routeType as DocumentType)
        ? (routeType as DocumentType)
        : 'quotation';
      initNewDocument(resolvedType);
    }
  }, [id, routeType, loadExistingDocument, initNewDocument]);

  const handleSaveDocument = async () => {
    if (!document) return;
    try {
      await saveDocumentToFirestore(document);
      showSuccess('Saved to Cloud Database', `Document ${document.documentNumber} is saved.`);
      if (!id) {
        // Redirect to edit url with persistent ID
        navigate(`/documents/${document.id}`, { replace: true });
      }
    } catch (err: any) {
      showError('Save Error', err.message);
    }
  };

  const handleDownloadPDF = async () => {
    if (!document) return;
    try {
      await exportToPDF({
        elementId: 'live-preview-a4-canvas',
        fileName: `${document.documentNumber || 'Document'}.pdf`,
        documentNumber: document.documentNumber,
      });
      showSuccess('PDF Generated successfully!');
    } catch (err: any) {
      showError('PDF Export Failed', err.message);
    }
  };

  const handlePrint = () => {
    printDocument();
  };

  const handleTypeChange = async (newType: DocumentType) => {
    if (!document) return;
    const newDocNumber = await getNextDocumentNumber(newType);
    const newTerms =
      newType === 'quotation'
        ? template.defaultTermsQuotation || []
        : newType === 'tax_invoice'
        ? template.defaultTermsInvoice || []
        : template.defaultTermsReceipt || [];

    setDocument({
      ...document,
      type: newType,
      documentNumber: newDocNumber,
      termsAndConditions: newTerms,
    });
  };

  if (loading || !document) {
    return <LoadingSpinner fullPage text="Preparing Document Studio..." />;
  }

  return (
    <div>
      <DocumentBuilder
        document={document}
        onChangeDocument={setDocument}
        onSaveDocument={handleSaveDocument}
        onDownloadPDF={handleDownloadPDF}
        onPrint={handlePrint}
        onTypeChange={handleTypeChange}
      />

      {/* Off-screen canvas for high-DPI PDF generation */}
      <div id="document-print-root" style={{ display: 'none' }}>
        <div id="document-print-canvas">
          <DocumentRenderer data={document} />
        </div>
      </div>
    </div>
  );
};
