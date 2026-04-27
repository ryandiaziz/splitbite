import React from 'react';
import { GlassCard } from '../atoms/GlassCard';
import { Button } from '../atoms/Button';
import { formatIDR, parseIDR } from '../../utils/formatters';

interface AddOrderFormProps {
  isOrderLocked: boolean;
  newItem: string;
  setNewItem: (val: string) => void;
  newPrice: string;
  setNewPrice: (val: string) => void;
  newNote: string;
  setNewNote: (val: string) => void;
  newQuantity: number;
  setNewQuantity: (val: number) => void;
  onAddItem: (e: React.FormEvent) => void;
}

export const AddOrderForm: React.FC<AddOrderFormProps> = ({
  isOrderLocked,
  newItem,
  setNewItem,
  newPrice,
  setNewPrice,
  newNote,
  setNewNote,
  newQuantity,
  setNewQuantity,
  onAddItem,
}) => {
  return (
    <GlassCard className="p-6 bg-white shadow-lg border border-slate-200 relative overflow-hidden" intensity="light">
      {isOrderLocked ? (
        <div className="text-center py-6">
          <span className="text-4xl mb-3 block">🔒</span>
          <h2 className="text-slate-800 font-bold mb-2">Orders Closed</h2>
          <p className="text-sm text-slate-500">Host has closed orders.<br/>Cannot add new items.</p>
        </div>
      ) : (
        <>
          <h2 className="text-slate-800 font-bold mb-4">Add My Order</h2>
          <form onSubmit={onAddItem} className="space-y-3">
            <div className="flex gap-2">
              <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Food name..." className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
              <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 px-1">
                <button type="button" onClick={() => setNewQuantity(Math.max(1, newQuantity - 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-indigo-600 font-bold transition-colors">-</button>
                <span className="w-8 text-center text-sm font-bold text-slate-700">{newQuantity}</span>
                <button type="button" onClick={() => setNewQuantity(newQuantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-indigo-600 font-bold transition-colors">+</button>
              </div>
            </div>
            <div className="relative">
              <input 
                type="text" 
                value={formatIDR(newPrice)} 
                onChange={e => setNewPrice(parseIDR(e.target.value))} 
                placeholder="Price (Rp) - Let empty if unknown" 
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
              {!newPrice && <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 italic">Optional</span>}
            </div>
            <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Note (e.g. No onion)" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <Button type="submit" variant="primary" className="w-full" size="sm">Add to Cart</Button>
          </form>
        </>
      )}
    </GlassCard>
  );
};
