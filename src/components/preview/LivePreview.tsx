import React from 'react';
import { DocumentData } from '../../types/document';
import { DocumentRenderer } from './DocumentRenderer';
import { Printer, Download, Save, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
  const [zoom, setZoom] = React.useState<number>(0.85);

  const handleZoomIn = () => setZoom(prev => Math.min(1.2, prev + 0.05));
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.05));
  const handleResetZoom = () => setZoom(0.85);

  return (
    <div className="flex flex-col h-full bg-[#EEF0F4] border-l border-line">
      {/* Sticky Preview Action Bar */}
      <div className="sticky top-[72px] z-20 bg-surface text-primary px-4 py-2 flex items-center justify-between border-b border-line shadow-subtle">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            A4 Document Preview
          </span>
          <span className="text-[10.5px] bg-page border border-line text-secondary px-1.5 py-0.5 rounded-xs font-mono font-medium">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center space-x-0.5 bg-page px-1.5 py-0.5 rounded-sm border border-line">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 text-secondary hover:text-primary rounded-xs hover:bg-surface transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1 text-secondary hover:text-primary rounded-xs hover:bg-surface transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 text-secondary hover:text-primary rounded-xs hover:bg-surface transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Export / Print / Save */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-1.5 bg-surface hover:bg-page text-primary border border-line px-3 py-1.5 rounded-sm text-xs font-medium transition-colors shadow-subtle"
          >
            <Save className="w-3.5 h-3.5 text-secondary" />
            Save Draft
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 bg-surface hover:bg-page text-primary border border-line px-3 py-1.5 rounded-sm text-xs font-medium transition-colors shadow-subtle"
          >
            <Printer className="w-3.5 h-3.5 text-secondary" />
            Print
          </button>

          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors shadow-subtle"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Scrollable Canvas Container */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start min-h-[600px] screen-only">
        <div
          className="transition-transform duration-100 origin-top shadow-a4"
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

