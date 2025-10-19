import React, { useMemo } from 'react';
import type { BakeSaleList, BakeSaleItem } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from './icons';

interface ListViewProps {
  list: BakeSaleList;
  onUpdateList: (list: BakeSaleList) => void;
  onBack: () => void;
}

const ListView: React.FC<ListViewProps> = ({ list, onUpdateList, onBack }) => {

  const handleItemChange = (itemId: string, field: keyof BakeSaleItem, value: string | number) => {
    const updatedItems = list.items.map(item => {
      if (item.id === itemId) {
        // Prevent NaN by defaulting empty strings to 0 for number fields
        const numericValue = (typeof value === 'string' && value.trim() === '') ? 0 : value;
        return { ...item, [field]: numericValue };
      }
      return item;
    });
    onUpdateList({ ...list, items: updatedItems });
  };

  const handleAddItem = () => {
    const newItem: BakeSaleItem = {
      id: Date.now().toString(),
      itemName: '',
      batches: 1,
      costPerBatch: 0,
      unitsPerBatch: 1,
      salePricePerUnit: 0,
    };
    onUpdateList({ ...list, items: [...list.items, newItem] });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = list.items.filter(item => item.id !== itemId);
    onUpdateList({ ...list, items: updatedItems });
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const calculations = useMemo(() => {
    return list.items.map(item => {
      const { batches, unitsPerBatch, costPerBatch, salePricePerUnit } = item;
      const totalUnits = batches > 0 && unitsPerBatch > 0 ? batches * unitsPerBatch : 0;
      const totalCost = batches * costPerBatch;
      const costPerUnit = unitsPerBatch > 0 ? costPerBatch / unitsPerBatch : 0;
      const profitPerUnit = salePricePerUnit - costPerUnit;
      const profitMargin = salePricePerUnit > 0 ? (profitPerUnit / salePricePerUnit) * 100 : 0;
      const potentialRevenue = totalUnits * salePricePerUnit;
      const potentialProfit = totalUnits * profitPerUnit;

      return {
        totalUnits,
        totalCost,
        costPerUnit,
        profitMargin,
        potentialRevenue,
        potentialProfit,
      };
    });
  }, [list.items]);

  const totals = useMemo(() => {
    return calculations.reduce(
      (acc, calc) => {
        acc.totalRevenue += calc.potentialRevenue;
        acc.totalProfit += calc.potentialProfit;
        acc.totalUnits += calc.totalUnits;
        acc.totalCost += calc.totalCost;
        return acc;
      },
      { totalRevenue: 0, totalProfit: 0, totalUnits: 0, totalCost: 0 }
    );
  }, [calculations]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const inputBaseClasses = "p-1 border border-gray-300 rounded-md bg-surface text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <ArrowLeftIcon className="h-6 w-6 text-text-secondary" />
        </button>
        <h2 className="text-2xl font-semibold text-text-primary">{list.name}</h2>
      </div>

      <div className="overflow-x-auto bg-surface rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Item Name', 'Batches', 'Cost/Batch', 'Total Cost', 'Units/Batch', 'Total Units', 'Sale Price/Unit', 'Cost/Unit', 'Profit Margin', 'Revenue', 'Profit', ''].map(header => (
                <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.items.map((item, index) => {
                const calc = calculations[index];
                const profitMarginColor = calc.profitMargin < 0 ? 'text-red-600' : 'text-green-600';

                return (
                    <tr key={item.id}>
                        <td className="px-4 py-2 min-w-[12rem]"><input type="text" value={item.itemName} onChange={e => handleItemChange(item.id, 'itemName', e.target.value)} placeholder="e.g. Cookies" className={`w-full ${inputBaseClasses}`}/></td>
                        <td className="px-4 py-2"><input type="number" min="0" value={item.batches} onFocus={handleFocus} onChange={e => handleItemChange(item.id, 'batches', e.target.value)} className={`w-20 ${inputBaseClasses}`}/></td>
                        <td className="px-4 py-2"><input type="number" min="0" step="0.01" value={item.costPerBatch} onFocus={handleFocus} onChange={e => handleItemChange(item.id, 'costPerBatch', e.target.value)} className={`w-24 ${inputBaseClasses}`}/></td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(calc.totalCost)}</td>
                        <td className="px-4 py-2"><input type="number" min="0" value={item.unitsPerBatch} onFocus={handleFocus} onChange={e => handleItemChange(item.id, 'unitsPerBatch', e.target.value)} className={`w-20 ${inputBaseClasses}`}/></td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{calc.totalUnits}</td>
                        <td className="px-4 py-2"><input type="number" min="0" step="0.01" value={item.salePricePerUnit} onFocus={handleFocus} onChange={e => handleItemChange(item.id, 'salePricePerUnit', e.target.value)} className={`w-24 ${inputBaseClasses}`}/></td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(calc.costPerUnit)}</td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${profitMarginColor}`}>{calc.profitMargin.toFixed(1)}%</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(calc.potentialRevenue)}</td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-medium ${calc.potentialProfit < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(calc.potentialProfit)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-right"><button onClick={() => handleDeleteItem(item.id)} className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5"/></button></td>
                    </tr>
                )
            })}
          </tbody>
           <tfoot className="bg-gray-50 font-bold">
              <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm text-text-primary uppercase tracking-wider">Totals</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{formatCurrency(totals.totalCost)}</td>
                  <td></td>
                  <td className="px-4 py-3 text-sm text-text-primary">{totals.totalUnits}</td>
                  <td colSpan={3}></td>
                  <td className="px-4 py-3 text-sm text-text-primary">{formatCurrency(totals.totalRevenue)}</td>
                  <td className={`px-4 py-3 text-sm ${totals.totalProfit < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(totals.totalProfit)}</td>
                  <td></td>
              </tr>
           </tfoot>
        </table>
      </div>
      <div className="flex justify-start">
        <button
          onClick={handleAddItem}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-pink-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Item</span>
        </button>
      </div>
    </div>
  );
};

export default ListView;