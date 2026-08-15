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
    <div className="flex flex-col h-full bg-slate-200 border-l border-slate-300">
      {/* Sticky Preview Action Bar */}
      <div className="sticky top-16 z-20 bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Live A4 Preview
          </span>
          <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center space-x-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700">
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Export / Print / Save */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSaveDraft}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-1.5 bg-orange-brand hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Scrollable Canvas Container */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start min-h-[600px] screen-only">
        <div
          className="transition-transform duration-150 origin-top shadow-2xl rounded-sm"
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
