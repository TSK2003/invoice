import React, { useState, useMemo } from 'react';
import { useCustomers } from './useCustomers';
import { Customer } from '../../types/customer';
import { CustomerForm } from './CustomerForm';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  FilePlus, 
  ExternalLink 
} from 'lucide-react';

export const CustomerList: React.FC = () => {
  const { customers, loading, saveCustomer, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const navigate = useNavigate();

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.companyName.toLowerCase().includes(term) ||
        c.contactPerson.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.gstin.toLowerCase().includes(term)
    );
  }, [customers, searchTerm]);

  const handleCreateNew = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSave = async (customer: Customer) => {
    await saveCustomer(customer);
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Loading customers..." />;
  }

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage client profiles, GSTIN details, and billing relationships. ({customers.length} total)
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-600 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company name, contact person, phone, email, city, or GSTIN..."
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand"
          />
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customers Table / Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No customers found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No matching customer profiles found for "${searchTerm}". Try a different search query.`
              : 'Your customer database is empty. Add your first customer profile to start generating professional documents.'}
          </p>
          {!searchTerm && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Company / Client</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Tax Identifiers</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Company & Contact Person */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/50 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                          {cust.companyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">
                            {cust.companyName}
                          </p>
                          {cust.contactPerson && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Attn: {cust.contactPerson}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {cust.city ? `${cust.city}, ` : ''}{cust.state}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        State Code: {cust.stateCode}
                      </span>
                    </td>

                    {/* Tax Identifiers */}
                    <td className="py-3.5 px-4">
                      {cust.gstin ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            GSTIN: {cust.gstin}
                          </span>
                          {cust.pan && (
                            <p className="text-[10px] font-mono text-slate-500">
                              PAN: {cust.pan}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Non-GST / Unregistered</span>
                      )}
                    </td>

                    {/* Contact Details */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {cust.phone && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{cust.phone}</span>
                        </div>
                      )}
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{cust.email}</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/documents/new/quotation?customerId=${cust.id}`)}
                          title="Create Quotation for Customer"
                          className="p-1.5 text-brand hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg transition-colors"
                        >
                          <FilePlus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(cust)}
                          title="Edit Customer"
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerToDelete(cust)}
                          title="Delete Customer"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
        maxWidth="2xl"
      >
        <CustomerForm
          initialData={editingCustomer}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Profile"
        message={`Are you sure you want to delete ${customerToDelete?.companyName}? Past documents generated for this customer will preserve their frozen snapshot.`}
        confirmText="Delete Customer"
        variant="danger"
      />
    </div>
  );
};
