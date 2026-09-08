import React from 'react';
import { DocumentItem } from '../../types/document';
import { Plus, Trash2, Copy, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { roundMoney } from '../../utils/money';
import { VALID_GST_RATES } from '../../constants/gstRates';
import { useToast } from '../../app/providers/ToastProvider';

interface ItemEditorProps {
  items: DocumentItem[];
  onChangeItems: (items: DocumentItem[]) => void;
  defaultTaxRate?: number;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({
  items,
  onChangeItems,
  defaultTaxRate = 18,
}) => {
  const { showWarning } = useToast();

  const handleItemChange = (index: number, field: keyof DocumentItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index] };

    (target as any)[field] = value;

    const qty = typeof target.quantity === 'number' ? target.quantity : parseFloat(String(target.quantity)) || 1;
    const rate = typeof target.rate === 'number' ? target.rate : parseFloat(String(target.rate)) || 0;
    let discount = typeof target.discount === 'number' ? target.discount : parseFloat(String(target.discount)) || 0;

    const lineTotal = roundMoney(qty * rate);
    if (discount > lineTotal) {
      discount = lineTotal;
      showWarning('Discount Capped', 'Discount cannot exceed total item price (Quantity × Rate).');
    }

    target.discount = discount;
    target.taxableValue = roundMoney(Math.max(0, lineTotal - discount));
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
      taxRate: defaultTaxRate,
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
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      sNo: items.length + 1,
      description: `${original.description} (Copy)`,
    };
    onChangeItems([...items, duplicate]);
  };

  const handleDeleteItem = (index: number) => {
    if (items.length <= 1) {
      showWarning('Cannot Delete', 'At least one line item is required in the document.');
      return;
    }
    const updated = items
      .filter((_, i) => i !== index)
      .map((item, idx) => ({
        ...item,
        sNo: idx + 1,
      }));
    onChangeItems(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Items & Services ({items.length})
        </label>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 bg-brand hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left text-xs min-w-[720px] border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10.5px]">
            <tr>
              <th className="py-2.5 px-3 w-[5%] text-center">#</th>
              <th className="py-2.5 px-3 w-[34%]">Description</th>
              <th className="py-2.5 px-3 w-[10%] text-center">SAC/HSN</th>
              <th className="py-2.5 px-3 w-[8%] text-center">Qty</th>
              <th className="py-2.5 px-3 w-[13%] text-right">Rate ₹</th>
              <th className="py-2.5 px-3 w-[10%] text-right">Discount</th>
              <th className="py-2.5 px-3 w-[10%] text-center">GST %</th>
              <th className="py-2.5 px-3 w-[12%] text-right">Taxable</th>
              <th className="py-2.5 px-3 w-[8%] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
            {items.map((item, idx) => (
              <tr
                key={item.id || idx}
                className={item.isIncluded ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'}
              >
                {/* Index */}
                <td className="py-2 px-3 text-center font-bold text-slate-400">
                  {idx + 1}
                </td>

                {/* Description */}
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="w-full h-8 px-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
                  />
                  {item.isIncluded && (
                    <span className="text-[10px] text-brand font-medium block mt-0.5">
                      Included with package
                    </span>
                  )}
                </td>

                {/* SAC/HSN */}
                <td className="py-2 px-3">
                  <input
                    type="text"
                    value={item.sacHsn}
                    onChange={(e) => handleItemChange(idx, 'sacHsn', e.target.value)}
                    className="w-full h-8 px-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-center bg-white dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300 focus:border-brand"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Qty */}
                <td className="py-2 px-3 text-center">
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-full h-8 px-1 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-center font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Rate */}
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={item.isIncluded ? '' : item.rate}
                    onChange={(e) => handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                    placeholder={item.isIncluded ? 'Included' : '0'}
                    className="w-full h-8 px-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-right font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Discount */}
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.isIncluded ? '' : item.discount}
                    onChange={(e) => handleItemChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                    placeholder={item.isIncluded ? '—' : '0'}
                    className="w-full h-8 px-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-right bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:border-brand"
                    disabled={item.isIncluded}
                  />
                </td>

                {/* Per-item Tax Rate */}
                <td className="py-2 px-3 text-center">
                  <select
                    value={item.taxRate !== undefined ? item.taxRate : defaultTaxRate}
                    onChange={(e) => handleItemChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                    disabled={item.isIncluded}
                    className="w-full h-8 px-1 text-center border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand disabled:opacity-50"
                  >
                    {VALID_GST_RATES.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}%
                      </option>
                    ))}
                  </select>
                </td>

                {/* Taxable Value */}
                <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                  {item.isIncluded ? (
                    <span className="text-slate-400 font-sans font-normal">Included</span>
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
                      aria-label="Duplicate Item"
                      className="p-1 text-slate-400 hover:text-brand hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      title="Delete Item"
                      aria-label="Delete Item"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
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
