import React, { useState } from 'react';
import { DocumentItem } from '../../types/document';
import { Plus, Trash2, Copy, CheckCircle2, DollarSign, Table2, LayoutGrid } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface ItemEditorProps {
  items: DocumentItem[];
  onChangeItems: (items: DocumentItem[]) => void;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({
  items,
  onChangeItems,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index] };

    (target as any)[field] = value;

    // Auto recalculate taxable value & amount
    const qty = typeof target.quantity === 'number' ? target.quantity : (parseFloat(String(target.quantity)) || 1);
    const rate = target.rate || 0;
    const discount = target.discount || 0;

    target.taxableValue = target.isIncluded ? 0 : Math.max(0, (qty * rate) - discount);
    target.amount = target.taxableValue;

    updated[index] = target;
    onChangeItems(updated);
  };

  const handleToggleIncluded = (index: number) => {
    const updated = [...items];
    const target = { ...updated[index] };
    const willBeIncluded = !target.isIncluded;

    target.isIncluded = willBeIncluded;
    if (willBeIncluded) {
      target.taxableValue = 0;
      target.amount = 0;
      target.rate = 0;
      target.discount = 0;
      target.quantity = '—';
    } else {
      const qty = typeof target.quantity === 'number' && target.quantity > 0
        ? target.quantity
        : (parseFloat(String(target.quantity)) || 1);
      target.quantity = qty;
      target.rate = target.rate && target.rate > 0 ? target.rate : 2500;
      target.discount = target.discount || 0;
      target.taxableValue = Math.max(0, (qty * target.rate) - target.discount);
      target.amount = target.taxableValue;
    }

    updated[index] = target;
    onChangeItems(updated);
  };

  const handleAddBillableItem = () => {
    const newItem: DocumentItem = {
      id: `item-${Date.now()}`,
      sNo: items.length + 1,
      description: 'New Service / Custom Item',
      sacHsn: '998314',
      quantity: 1,
      rate: 5000,
      discount: 0,
      taxRate: 18,
      taxableValue: 5000,
      amount: 5000,
      isIncluded: false,
    };
    onChangeItems([...items, newItem]);
  };

  const handleAddIncludedItem = () => {
    const newItem: DocumentItem = {
      id: `item-inc-${Date.now()}`,
      sNo: items.length + 1,
      description: 'New Deliverable (Included)',
      sacHsn: '—',
      quantity: '—',
      rate: 0,
      discount: 0,
      taxRate: 0,
      taxableValue: 0,
      amount: 0,
      isIncluded: true,
    };
    onChangeItems([...items, newItem]);
  };

  const handleDuplicateItem = (index: number) => {
    const original = items[index];
    const duplicate: DocumentItem = {
      ...original,
      id: `item-${Date.now()}`,
      sNo: items.length + 1,
      description: `${original.description} (Copy)`,
    };
    onChangeItems([...items, duplicate]);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) {
      alert('At least one item is required in the document.');
      return;
    }
    const updated = items.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      sNo: idx + 1,
    }));
    onChangeItems(updated);
  };

  return (
    <div className="space-y-3">
      {/* Header Bar: Title, View Switcher & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-0.5">
        <div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-primary uppercase tracking-wider">
              Items & Services ({items.length})
            </label>
            {/* View Mode Toggle */}
            <div className="flex items-center bg-page p-0.5 rounded border border-line">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table View (Full details)"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10.5px] font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-surface text-brand shadow-xs border border-line'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Card View (Stacked & Mobile Friendly)"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10.5px] font-semibold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-surface text-brand shadow-xs border border-line'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
          <span className="text-[10.5px] text-secondary font-medium block mt-0.5">
            Toggle items between <b className="text-emerald-700">Included (Free)</b> and <b className="text-brand">Billable (₹)</b>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddBillableItem}
            className="flex items-center gap-1 bg-brand hover:bg-brand-600 text-white px-2.5 py-1.5 rounded-sm text-xs font-semibold transition-colors shadow-subtle"
            title="Add a chargeable service with custom price"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Billable</span>
          </button>

          <button
            type="button"
            onClick={handleAddIncludedItem}
            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-sm text-xs font-semibold transition-colors shadow-xs"
            title="Add a free deliverable included with package"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Add Included</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW (Generous, Non-Shrinking Column Widths) */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto border border-line rounded-md bg-surface shadow-xs">
          <table className="w-full text-left text-xs min-w-[980px] border-collapse">
            <thead className="bg-page border-b border-line text-secondary font-bold uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="py-2.5 px-2.5 w-10 min-w-[40px] text-center">#</th>
                <th className="py-2.5 px-3 min-w-[260px]">Description</th>
                <th className="py-2.5 px-2.5 w-40 min-w-[150px] text-center">Include in Bill?</th>
                <th className="py-2.5 px-2.5 w-28 min-w-[95px] text-center">SAC/HSN</th>
                <th className="py-2.5 px-2 w-20 min-w-[70px] text-center">Qty</th>
                <th className="py-2.5 px-2.5 w-32 min-w-[120px] text-right">Rate ₹</th>
                <th className="py-2.5 px-2 w-24 min-w-[85px] text-right">Discount</th>
                <th className="py-2.5 px-3 w-32 min-w-[125px] text-right">Taxable Value</th>
                <th className="py-2.5 px-2 w-20 min-w-[80px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-primary">
              {items.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className={item.isIncluded ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'hover:bg-page/70'}
                >
                  {/* Index */}
                  <td className="py-2 px-2.5 text-center font-bold text-secondary">
                    {idx + 1}
                  </td>

                  {/* Description */}
                  <td className="py-2 px-3 min-w-[260px]">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full min-w-[220px] h-8 px-2.5 border border-line rounded-sm text-xs bg-surface text-primary focus:border-brand font-medium"
                    />
                    {item.isIncluded && (
                      <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                        Included with package scope (₹0)
                      </span>
                    )}
                  </td>

                  {/* Include in Bill? Toggle */}
                  <td className="py-2 px-2.5 text-center whitespace-nowrap min-w-[150px]">
                    <button
                      type="button"
                      onClick={() => handleToggleIncluded(idx)}
                      title={item.isIncluded ? 'Click to make Billable (Add to bill)' : 'Click to make Included (Free in package)'}
                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold transition-all border shadow-xs w-full max-w-[140px] ${
                        item.isIncluded
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                          : 'bg-brand/10 text-brand border-brand/30 hover:bg-brand/20 hover:border-brand'
                      }`}
                    >
                      {item.isIncluded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Included (Free)</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-3.5 h-3.5 text-brand shrink-0" />
                          <span>Billable (₹)</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* SAC/HSN */}
                  <td className="py-2 px-2.5 min-w-[95px]">
                    <input
                      type="text"
                      value={item.sacHsn}
                      onChange={e => handleItemChange(idx, 'sacHsn', e.target.value)}
                      className="w-full min-w-[80px] h-8 px-1.5 border border-line rounded-sm text-xs text-center bg-surface font-mono text-secondary focus:border-brand disabled:bg-page"
                      disabled={item.isIncluded}
                    />
                  </td>

                  {/* Qty */}
                  <td className="py-2 px-2 text-center min-w-[70px]">
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full min-w-[55px] h-8 px-1 border border-line rounded-sm text-xs text-center font-medium bg-surface text-primary focus:border-brand disabled:bg-page"
                      disabled={item.isIncluded}
                    />
                  </td>

                  {/* Rate */}
                  <td className="py-2 px-2.5 text-right min-w-[120px]">
                    <input
                      type="number"
                      value={item.isIncluded ? '' : (item.rate || '')}
                      onChange={e => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                      placeholder={item.isIncluded ? 'Included' : '0'}
                      className="w-full min-w-[105px] h-8 px-2 border border-line rounded-sm text-xs text-right font-semibold bg-surface text-primary focus:border-brand disabled:bg-page disabled:text-secondary"
                      disabled={item.isIncluded}
                    />
                  </td>

                  {/* Discount */}
                  <td className="py-2 px-2 text-right min-w-[85px]">
                    <input
                      type="number"
                      value={item.isIncluded ? '' : (item.discount || '')}
                      onChange={e => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                      placeholder={item.isIncluded ? '—' : '0'}
                      className="w-full min-w-[70px] h-8 px-1.5 border border-line rounded-sm text-xs text-right bg-surface text-secondary focus:border-brand disabled:bg-page"
                      disabled={item.isIncluded}
                    />
                  </td>

                  {/* Taxable Value */}
                  <td className="py-2 px-3 text-right font-bold text-primary min-w-[125px]">
                    {item.isIncluded ? (
                      <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Included (₹0)
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-primary font-bold">
                        {formatCurrency(item.taxableValue)}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-2 text-center min-w-[80px]">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateItem(idx)}
                        title="Duplicate Item"
                        className="p-1.5 text-secondary hover:text-brand hover:bg-brand-50 rounded-xs transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        title="Delete Item"
                        className="p-1.5 text-secondary hover:text-primary hover:bg-page rounded-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* VIEW 2: RESPONSIVE CARDS VIEW (Fully stacked, zero clipping on any screen) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`p-3.5 rounded-md border transition-all ${
                item.isIncluded
                  ? 'bg-emerald-50/20 border-emerald-200'
                  : 'bg-surface border-line shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-line">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-page text-secondary text-xs font-bold flex items-center justify-center border border-line">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleIncluded(idx)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
                      item.isIncluded
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-brand/10 text-brand border-brand/30'
                    }`}
                  >
                    {item.isIncluded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Included (Free)</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-3.5 h-3.5 text-brand" />
                        <span>Billable (₹)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handleDuplicateItem(idx)}
                    title="Duplicate Item"
                    className="p-1.5 text-secondary hover:text-brand rounded transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(idx)}
                    title="Delete Item"
                    className="p-1.5 text-secondary hover:text-primary rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description Input */}
              <div className="mt-2.5">
                <label className="block text-[10.5px] font-semibold text-secondary mb-1">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={e => handleItemChange(idx, 'description', e.target.value)}
                  className="w-full h-8 px-2.5 border border-line rounded-sm text-xs bg-surface text-primary focus:border-brand font-medium"
                />
              </div>

              {/* Card Body: Pricing & Quantities */}
              {!item.isIncluded ? (
                <div className="mt-2.5 pt-2.5 border-t border-line space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-secondary mb-0.5">SAC/HSN</label>
                      <input
                        type="text"
                        value={item.sacHsn}
                        onChange={e => handleItemChange(idx, 'sacHsn', e.target.value)}
                        className="w-full h-8 px-1.5 border border-line rounded-sm text-xs text-center font-mono text-secondary bg-surface focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-secondary mb-0.5">Qty</label>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full h-8 px-1.5 border border-line rounded-sm text-xs text-center font-medium bg-surface text-primary focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-secondary mb-0.5">Rate (₹)</label>
                      <input
                        type="number"
                        value={item.rate || ''}
                        onChange={e => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full h-8 px-2 border border-line rounded-sm text-xs text-right font-bold text-primary bg-surface focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-secondary mb-0.5">Disc</label>
                      <input
                        type="number"
                        value={item.discount || ''}
                        onChange={e => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full h-8 px-1.5 border border-line rounded-sm text-xs text-right bg-surface text-secondary focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-page p-2 rounded-sm border border-line text-xs">
                    <span className="text-secondary font-medium">Taxable Subtotal</span>
                    <span className="font-bold text-primary text-sm font-mono">
                      {formatCurrency(item.taxableValue)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 p-2 bg-emerald-50 rounded-sm border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between font-medium">
                  <span>Scope Deliverable</span>
                  <span className="font-bold">Included (₹0)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Info Tip & Scroll Help */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-secondary bg-page px-3 py-1.5 rounded-sm border border-line gap-2">
        <span>
          💡 Use <b>Include in Bill?</b> to toggle items. {viewMode === 'table' && 'Scroll horizontally ↔ if on small screen.'}
        </span>
        <span className="font-semibold text-primary">
          Billed Items: {items.filter(i => !i.isIncluded).length} | Free Deliverables: {items.filter(i => i.isIncluded).length}
        </span>
      </div>
    </div>
  );
};

