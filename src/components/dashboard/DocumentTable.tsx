import React, { useState, useMemo } from 'react';
import { DocumentData, DocumentType } from '../../types/document';
import { StatusBadge } from '../ui/Badge';
import { formatCurrency } from '../../utils/currency';
import { Search, Filter, Edit3, Copy, Download, Trash2, FileText, AlertCircle, X } from 'lucide-react';

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
  
  // Custom Modal State for Delete Confirmation
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
        return <span className="text-brand bg-brand-50 font-semibold px-2 py-0.5 rounded-xs text-[11px] border border-brand-200">Quotation</span>;
      case 'tax_invoice':
        return <span className="text-primary bg-page font-semibold px-2 py-0.5 rounded-xs text-[11px] border border-line">Tax Invoice</span>;
      case 'payment_receipt':
        return <span className="text-secondary bg-page font-semibold px-2 py-0.5 rounded-xs text-[11px] border border-line">Receipt</span>;
    }
  };

  const handleConfirmDelete = () => {
    if (deletingDoc) {
      onDelete(deletingDoc.id);
      setDeletingDoc(null);
    }
  };

  return (
    <div className="bg-surface rounded-md border border-line shadow-subtle overflow-hidden relative">
      {/* Table Toolbar */}
      <div className="p-3.5 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search by client, document number, or package..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-page border border-line rounded-sm text-xs text-primary focus:border-brand"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-secondary">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="bg-page border border-line rounded-sm px-2.5 py-1.5 text-xs text-primary focus:border-brand"
          >
            <option value="all">All Document Types</option>
            <option value="quotation">Quotations</option>
            <option value="tax_invoice">Tax Invoices</option>
            <option value="payment_receipt">Payment Receipts</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-page border border-line rounded-sm px-2.5 py-1.5 text-xs text-primary focus:border-brand"
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
        <table className="w-full min-w-[760px] text-left text-xs border-collapse">
          <thead className="bg-page border-b border-line text-secondary font-bold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3.5">Document No</th>
              <th className="py-2.5 px-3.5">Type</th>
              <th className="py-2.5 px-3.5">Client / Company</th>
              <th className="py-2.5 px-3.5">Date</th>
              <th className="py-2.5 px-3.5 text-right">Amount</th>
              <th className="py-2.5 px-3.5">Status</th>
              <th className="py-2.5 px-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-primary">
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-8 h-8 mb-1.5 stroke-1 text-muted" />
                    <p className="font-semibold text-xs text-secondary">No documents found</p>
                    <p className="text-[11px] text-muted mt-0.5">Try adjusting search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDocuments.map(doc => {
                const totalAmount = doc.type === 'payment_receipt'
                  ? (doc.receiptDetails?.amountReceived || 0)
                  : (doc.tax?.grandTotal || 0);

                return (
                  <tr key={doc.id} className="hover:bg-page transition-colors">
                    {/* Doc No */}
                    <td className="py-2.5 px-3.5 font-bold text-primary font-mono text-[11.5px]">
                      {doc.documentNumber}
                    </td>

                    {/* Type */}
                    <td className="py-2.5 px-3.5">
                      {getDocTypeLabel(doc.type)}
                    </td>

                    {/* Client */}
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-primary">{doc.client?.companyName || '—'}</div>
                      {doc.client?.contactPerson && (
                        <div className="text-[11px] text-secondary">{doc.client.contactPerson}</div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3.5 text-secondary">
                      {doc.date}
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-3.5 text-right font-bold text-primary">
                      {formatCurrency(totalAmount)}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3.5">
                      <StatusBadge status={doc.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Edit / View */}
                        <button
                          onClick={() => onEdit(doc)}
                          title="Edit Document"
                          className="p-1.5 text-secondary hover:text-brand hover:bg-brand-50 rounded-xs transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => onDuplicate(doc.id)}
                          title="Duplicate Document"
                          className="p-1.5 text-secondary hover:text-brand hover:bg-brand-50 rounded-xs transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => onDownloadPDF(doc)}
                          title="Download PDF"
                          className="p-1.5 text-secondary hover:text-brand hover:bg-brand-50 rounded-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingDoc(doc)}
                          title="Delete Document"
                          className="p-1.5 text-secondary hover:text-primary hover:bg-page rounded-xs transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg p-5 max-w-md w-full shadow-subtle border border-line">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-primary">Delete Document</h3>
                  <p className="text-xs text-secondary mt-0.5">
                    Are you sure you want to permanently delete this document?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeletingDoc(null)}
                className="text-secondary hover:text-primary p-0.5 rounded-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3.5 p-3 bg-page rounded-sm border border-line text-xs space-y-1">
              <div>Document No: <b className="text-primary font-mono">{deletingDoc.documentNumber}</b></div>
              <div>Type: <b className="capitalize text-primary">{deletingDoc.type.replace('_', ' ')}</b></div>
              <div>Client: <b className="text-primary">{deletingDoc.client?.companyName || '—'}</b></div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="px-3 py-1.5 bg-surface border border-line hover:bg-page text-primary text-xs font-medium rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 bg-brand hover:bg-brand-600 text-white text-xs font-semibold rounded-sm transition-colors shadow-subtle"
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

