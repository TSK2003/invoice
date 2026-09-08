import React, { useState } from 'react';
import { useDocuments } from './useDocuments';
import { DocumentDashboard } from '../../components/dashboard/DocumentDashboard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { exportToPDF } from '../../services/pdf/pdfService';
import { DocumentRenderer } from '../../components/preview/DocumentRenderer';
import { DocumentData } from '../../types/document';
import { useNavigate } from 'react-router-dom';

export const DocumentListPage: React.FC = () => {
  const { documents, stats, loading, deleteDocument, duplicateDocument } = useDocuments();
  const [docForPdf, setDocForPdf] = useState<DocumentData | null>(null);
  const navigate = useNavigate();

  const handleCreateNew = (type = 'quotation') => {
    navigate(`/documents/new/${type}`);
  };

  const handleEdit = (doc: DocumentData) => {
    navigate(`/documents/${doc.id}`);
  };

  const handleDownloadPDF = async (doc: DocumentData) => {
    setDocForPdf(doc);
    setTimeout(async () => {
      try {
        await exportToPDF({
          elementId: 'document-print-canvas',
          fileName: `${doc.documentNumber || 'Document'}.pdf`,
          documentNumber: doc.documentNumber,
        });
      } finally {
        setDocForPdf(null);
      }
    }, 150);
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading cloud documents..." />;
  }

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DocumentDashboard
        documents={documents}
        stats={stats}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onDuplicate={duplicateDocument}
        onDownloadPDF={handleDownloadPDF}
        onDelete={deleteDocument}
      />

      {/* Hidden Print Root for PDF capture if requested from list */}
      <div id="document-print-root" style={{ display: 'none' }}>
        {docForPdf && (
          <div id="document-print-canvas">
            <DocumentRenderer data={docForPdf} />
          </div>
        )}
      </div>
    </div>
  );
};
