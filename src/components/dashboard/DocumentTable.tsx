import React, { useState, useMemo } from 'react';
import { DocumentData, DocumentType } from '../../types/document';
import { StatusBadge } from '../ui/Badge';
import { formatCurrency } from '../../utils/currency';
import { Search, Filter, Edit3, Copy, Download, Trash2, FileText, AlertTriangle, X } from 'lucide-react';

interface TableProps {
  documents: DocumentData[];
  onEdit: (doc: DocumentData) => void;
  onDuplicate: (id: string) => void;
  onDownloadPDF: (doc: DocumentData) => void;
  onDelete: (id: string) => void;
}

export const DocumentTable: React.FC<TableProps> = ({
  documents,
  onEdit,
  onDuplicate,
  onDownloadPDF,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | DocumentType>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Custom Modal State for Delete Confirmation (avoids browser window.confirm blocks)
  const [deletingDoc, setDeletingDoc] = useState<DocumentData | null>(null);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Type Filter
      if (typeFilter !== 'all' && doc.type !== typeFilter) return false;

      // Status Filter
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesClient = (doc.client?.companyName || '').toLowerCase().includes(query) ||
                              (doc.client?.contactPerson || '').toLowerCase().includes(query);
        const matchesDocNo = (doc.documentNumber || '').toLowerCase().includes(query);
        const matchesPackage = (doc.packageName || '').toLowerCase().includes(query);
        
        return matchesClient || matchesDocNo || matchesPackage;
      }

      return true;
    });
  }, [documents, searchTerm, typeFilter, statusFilter]);

  const getDocTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'quotation':
        return <span className="text-blue-700 bg-blue-50 font-semibold px-2.5 py-0.5 rounded text-xs border border-blue-200">Quotation</span>;
      case 'tax_invoice':
        return <span className="text-purple-700 bg-purple-50 font-semibold px-2.5 py-0.5 rounded text-xs border border-purple-200">Tax Invoice</span>;
      case 'payment_receipt':
        return <span className="text-emerald-700 bg-emerald-50 font-semibold px-2.5 py-0.5 rounded text-xs border border-emerald-200">Receipt</span>;
    }
  };

  const handleConfirmDelete = () => {
    if (deletingDoc) {
      onDelete(deletingDoc.id);
      setDeletingDoc(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, document no, or project..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-brand/30 focus:border-blue-brand"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          >
            <option value="all">All Document Types</option>
            <option value="quotation">Quotations</option>
            <option value="tax_invoice">Tax Invoices</option>
            <option value="payment_receipt">Payment Receipts</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-brand/30"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Document No</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Client / Company</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
                    <p className="font-semibold text-sm text-slate-600">No documents found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDocuments.map(doc => {
                const totalAmount = doc.type === 'payment_receipt'
                  ? (doc.receiptDetails?.amountReceived || 0)
                  : (doc.tax?.grandTotal || 0);

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Doc No */}
                    <td className="py-3.5 px-4 font-extrabold text-navy">
                      {doc.documentNumber}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      {getDocTypeLabel(doc.type)}
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{doc.client?.companyName || '[No Client Name]'}</div>
                      {doc.client?.contactPerson && (
                        <div className="text-[11px] text-slate-500">{doc.client.contactPerson}</div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {doc.date}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                      {formatCurrency(totalAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={doc.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Edit / View */}
                        <button
                          onClick={() => onEdit(doc)}
                          title="Edit Document"
                          className="p-1.5 text-slate-600 hover:text-blue-brand hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => onDuplicate(doc.id)}
                          title="Duplicate Document"
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => onDownloadPDF(doc)}
                          title="Download PDF"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Delete Button (Opens custom in-app confirmation modal) */}
                        <button
                          onClick={() => setDeletingDoc(doc)}
                          title="Delete Document"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CUSTOM IN-APP DELETE CONFIRMATION MODAL */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 rounded-full text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Delete Document</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Are you sure you want to permanently delete this document?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeletingDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>Document No: <b className="text-navy">{deletingDoc.documentNumber}</b></div>
              <div>Type: <b className="capitalize">{deletingDoc.type.replace('_', ' ')}</b></div>
              <div>Client: <b>{deletingDoc.client?.companyName || '—'}</b></div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
              >
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
