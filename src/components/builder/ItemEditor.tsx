import React from 'react';
import { DocumentItem } from '../../types/document';
import { Plus, Trash2, Copy } from 'lucide-react';
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
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-secondary uppercase tracking-wider">
          Items & Services ({items.length})
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 bg-brand hover:bg-brand-600 text-white px-2.5 py-1 rounded-sm text-xs font-semibold transition-colors shadow-subtle"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto border border-line rounded-md bg-surface">
        <table className="w-full text-left text-xs min-w-[620px] border-collapse">
          <thead className="bg-page border-b border-line text-secondary font-bold uppercase tracking-wider text-[10.5px]">
            <tr>
              <th className="py-2 px-2.5 w-[5%] text-center">#</th>
              <th className="py-2 px-2.5 w-[36%]">Description</th>
              <th className="py-2 px-2.5 w-[12%] text-center">SAC/HSN</th>
              <th className="py-2 px-2.5 w-[10%] text-center">Qty</th>
              <th className="py-2 px-2.5 w-[15%] text-right">Rate ₹</th>
              <th className="py-2 px-2.5 w-[12%] text-right">Discount</th>
              <th className="py-2 px-2.5 w-[16%] text-right">Taxable Value</th>
              <th className="py-2 px-2.5 w-[8%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-primary">
            {items.map((item, idx) => (
              <tr
                key={item.id || idx}
                className={item.isIncluded ? 'bg-page/50' : 'hover:bg-page/70'}
              >
                {/* Index */}
                <td className="py-1.5 px-2.5 text-center font-bold text-secondary">
                  {idx + 1}
                </td>

                {/* Description */}
                <td className="py-1.5 px-2.5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                    className="w-full h-7 px-2 border border-line rounded-sm text-xs bg-surface text-primary focus:border-brand"
                  />
                  {item.isIncluded && (
                    <span className="text-[10px] text-secondary font-medium block mt-0.5">
                      Included with package
                    </span>
                  )}
                </td>

                {/* SAC/HSN */}
                <td className="py-1.5 px-2.5">
                  <input
                    type="text"
                    value={item.sacHsn}
                    onChange={e => handleItemChange(idx, 'sacHsn', e.target.value)}
                    className="w-full h-7 px-1.5 border border-line rounded-sm text-xs text-center bg-surface font-mono text-secondary focus:border-brand"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Qty */}
                <td className="py-1.5 px-2.5 text-center">
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full h-7 px-1 border border-line rounded-sm text-xs text-center font-medium bg-surface text-primary focus:border-brand"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Rate */}
                <td className="py-1.5 px-2.5 text-right">
                  <input
                    type="number"
                    value={item.isIncluded ? '' : item.rate}
                    onChange={e => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                    placeholder={item.isIncluded ? 'Included' : '0'}
                    className="w-full h-7 px-2 border border-line rounded-sm text-xs text-right font-medium bg-surface text-primary focus:border-brand"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Discount */}
                <td className="py-1.5 px-2.5 text-right">
                  <input
                    type="number"
                    value={item.isIncluded ? '' : item.discount}
                    onChange={e => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                    placeholder={item.isIncluded ? '—' : '0'}
                    className="w-full h-7 px-1.5 border border-line rounded-sm text-xs text-right bg-surface text-secondary focus:border-brand"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Taxable Value */}
                <td className="py-1.5 px-2.5 text-right font-bold text-primary">
                  {item.isIncluded ? (
                    <span className="text-secondary font-medium">Included</span>
                  ) : (
                    formatCurrency(item.taxableValue)
                  )}
                </td>

                {/* Actions */}
                <td className="py-1.5 px-2.5 text-center">
                  <div className="flex items-center justify-center space-x-0.5">
                    <button
                      type="button"
                      onClick={() => handleDuplicateItem(idx)}
                      title="Duplicate Item"
                      className="p-1 text-secondary hover:text-brand hover:bg-brand-50 rounded-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      title="Delete Item"
                      className="p-1 text-secondary hover:text-primary hover:bg-page rounded-xs transition-colors"
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

