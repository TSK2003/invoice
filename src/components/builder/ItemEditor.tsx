import React from 'react';
import { DocumentItem } from '../../types/document';
import { Plus, Trash2, Copy, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface ItemEditorProps {
  items: DocumentItem[];
  onChangeItems: (items: DocumentItem[]) => void;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({
  items,
  onChangeItems,
}) => {
  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index] };

    (target as any)[field] = value;

    // Auto recalculate taxable value & amount
    const qty = typeof target.quantity === 'number' ? target.quantity : parseFloat(target.quantity) || 1;
    const rate = target.rate || 0;
    const discount = target.discount || 0;

    target.taxableValue = Math.max(0, (qty * rate) - discount);
    target.amount = target.taxableValue;

    updated[index] = target;
    onChangeItems(updated);
  };

  const handleAddItem = () => {
    const newItem: DocumentItem = {
      id: `item-${Date.now()}`,
      sNo: items.length + 1,
      description: 'New Service / Custom Feature Item',
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
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Items & Services List ({items.length})
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 bg-blue-brand hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 w-[5%] text-center">#</th>
              <th className="py-2.5 px-3 w-[35%]">Description</th>
              <th className="py-2.5 px-3 w-[12%] text-center">SAC/HSN</th>
              <th className="py-2.5 px-3 w-[10%] text-center">Qty</th>
              <th className="py-2.5 px-3 w-[15%] text-right">Rate ₹</th>
              <th className="py-2.5 px-3 w-[13%] text-right">Discount ₹</th>
              <th className="py-2.5 px-3 w-[18%] text-right">Taxable Value</th>
              <th className="py-2.5 px-3 w-[8%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr
                key={item.id || idx}
                className={item.isIncluded ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}
              >
                {/* Index */}
                <td className="py-2 px-3 text-center font-bold text-slate-500">
                  {idx + 1}
                </td>

                {/* Description */}
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-medium focus:border-blue-brand"
                  />
                  {item.isIncluded && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3" /> Standard Inclusion (Non-chargeable)
                    </span>
                  )}
                </td>

                {/* SAC/HSN */}
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={item.sacHsn}
                    onChange={e => handleItemChange(idx, 'sacHsn', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Qty */}
                <td className="py-2 px-3 text-center">
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center font-bold"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Rate */}
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    value={item.isIncluded ? '' : item.rate}
                    onChange={e => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                    placeholder={item.isIncluded ? 'Included' : '0'}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-right font-semibold"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Discount */}
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    value={item.isIncluded ? '' : item.discount}
                    onChange={e => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                    placeholder={item.isIncluded ? '—' : '0'}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-right"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Taxable Value */}
                <td className="py-2 px-3 text-right font-extrabold text-navy">
                  {item.isIncluded ? (
                    <span className="text-emerald-700 font-extrabold">Included</span>
                  ) : (
                    formatCurrency(item.taxableValue)
                  )}
                </td>

                {/* Actions */}
                <td className="py-2 px-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateItem(idx)}
                      title="Duplicate Item"
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      title="Delete Item"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
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
    </div>
  );
};
