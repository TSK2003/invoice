import React from 'react';
import { DocumentData } from '../../types/document';
import { DocumentRenderer } from './DocumentRenderer';
import { Printer, Download, Save, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface LivePreviewProps {
  data: DocumentData;
  onDownloadPDF: () => void;
  onPrint: () => void;
  onSaveDraft: () => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  data,
  onDownloadPDF,
  onPrint,
  onSaveDraft,
}) => {
  const [zoom, setZoom] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 480) return 0.44;
      if (window.innerWidth < 768) return 0.58;
      if (window.innerWidth < 1280) return 0.72;
    }
    return 0.85;
  });

  const handleZoomIn = () => setZoom(prev => Math.min(1.3, Number((prev + 0.05).toFixed(2))));
  const handleZoomOut = () => setZoom(prev => Math.max(0.35, Number((prev - 0.05).toFixed(2))));
  const handleResetZoom = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 480) {
        setZoom(0.44);
        return;
      }
      if (window.innerWidth < 768) {
        setZoom(0.58);
        return;
      }
    }
    setZoom(0.85);
  };

  const handleFitToWidth = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const targetWidth = width < 1024 ? width - 36 : Math.min(width * 0.46, 780);
      const calculatedZoom = Math.max(0.38, Math.min(1.2, Number((targetWidth / 794).toFixed(2))));
      setZoom(calculatedZoom);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#EEF0F4] border-l border-line">
      {/* Sticky Preview Action Bar */}
      <div className="no-print print:hidden sticky top-[72px] z-20 bg-surface text-primary px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between border-b border-line shadow-subtle gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Preview
          </span>
          <span className="text-[10px] sm:text-[10.5px] bg-page border border-line text-secondary px-1.5 py-0.5 rounded-xs font-mono font-medium">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Zoom Controls (Available on all screens) */}
        <div className="flex items-center space-x-0.5 bg-page px-1.5 py-0.5 rounded-sm border border-line">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 text-secondary hover:text-primary rounded-xs hover:bg-surface transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleFitToWidth}
            title="Fit to Window Width"
            className="p-1 text-secondary hover:text-primary rounded-xs hover:bg-surface transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1 text-secondary hover:text-primary rounded-xs hover:bg-surface transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 text-secondary hover:text-primary rounded-xs hover:bg-surface transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Export / Print / Save Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            onClick={onSaveDraft}
            title="Save Current Draft"
            className="flex items-center gap-1 bg-surface hover:bg-page text-primary border border-line px-2.5 sm:px-3 py-1.5 rounded-sm text-xs font-medium transition-colors shadow-subtle"
          >
            <Save className="w-3.5 h-3.5 text-secondary" />
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            title="Print Document"
            className="flex items-center gap-1 bg-surface hover:bg-page text-primary border border-line px-2.5 sm:px-3 py-1.5 rounded-sm text-xs font-medium transition-colors shadow-subtle"
          >
            <Printer className="w-3.5 h-3.5 text-secondary" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPDF}
            title="Download PDF"
            className="flex items-center gap-1 bg-brand hover:bg-brand-600 text-white px-3 sm:px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors shadow-subtle"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* Scrollable Canvas Container */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start min-h-[600px] print:p-0 print:overflow-visible print:bg-white">
        <div
          className="transition-transform duration-100 origin-top shadow-a4 print:shadow-none print:transform-none"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          <DocumentRenderer data={data} containerId="live-preview-a4-canvas" />
        </div>
      </div>
    </div>
  );
};

