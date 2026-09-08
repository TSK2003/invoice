import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DocumentData } from '../../types/document';
import { fetchDocumentById } from '../../services/firebase/firestore';
import { DocumentRenderer } from '../../components/preview/DocumentRenderer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { exportToPDF, printDocument } from '../../services/pdf/pdfService';
import { useToast } from '../../app/providers/ToastProvider';
import { ArrowLeft, Edit3, Download, Printer } from 'lucide-react';

export const DocumentViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDoc() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchDocumentById(id);
        if (data) {
          setDoc(data);
        } else {
          showError('Document Not Found', `Document ${id} could not be located.`);
          navigate('/documents');
        }
      } catch (err: any) {
        showError('Load Error', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [id, navigate, showError]);

  const handleDownloadPDF = async () => {
    if (!doc) return;
    try {
      await exportToPDF({
        elementId: 'document-view-canvas',
        fileName: `${doc.documentNumber || 'Document'}.pdf`,
        documentNumber: doc.documentNumber,
      });
      showSuccess('PDF Downloaded!');
    } catch (err: any) {
      showError('PDF Generation Error', err.message);
    }
  };

  if (loading || !doc) {
    return <LoadingSpinner fullPage text="Loading document..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      {/* Top Floating Control Bar */}
      <div className="no-print print:hidden max-w-[850px] mx-auto mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-md flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/documents')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/documents/${doc.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => printDocument()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-600 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>

      {/* A4 Render Canvas */}
      <div className="flex justify-center">
        <div id="document-view-canvas" className="shadow-2xl rounded-sm">
          <DocumentRenderer data={doc} />
        </div>
      </div>
    </div>
  );
};
