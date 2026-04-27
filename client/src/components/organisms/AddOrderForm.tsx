import React from 'react';
import { GlassCard } from '../atoms/GlassCard';
import { Button } from '../atoms/Button';
import { formatIDR, parseIDR } from '../../utils/formatters';
import { Lock, Plus, Minus, ShoppingCart } from 'lucide-react';

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
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <Lock className="w-8 h-8 text-rose-500 opacity-60" />
          </div>
          <h2 className="text-slate-800 font-bold uppercase tracking-widest text-xs mb-2">Orders Closed</h2>
          <p className="text-[11px] text-slate-500 leading-relaxed italic">Host has finalized the menu.<br/>New entries are disabled.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
              <Plus className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-slate-800 font-bold uppercase tracking-widest text-xs">Add My Order</h2>
          </div>

          <form onSubmit={onAddItem} className="space-y-4">
            <div className="flex gap-2">
              <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Food name..." className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" required />
              <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 px-1">
                <button type="button" onClick={() => setNewQuantity(Math.max(1, newQuantity - 1))} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-slate-700">{newQuantity}</span>
                <button type="button" onClick={() => setNewQuantity(newQuantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <input 
                type="text" 
                value={formatIDR(newPrice)} 
                onChange={e => setNewPrice(parseIDR(e.target.value))} 
                placeholder="Price (Rp)" 
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" 
              />
              {!newPrice && <span className="absolute right-4 top-3 text-[10px] text-slate-400 italic uppercase tracking-wider font-bold opacity-60">Optional</span>}
            </div>

            <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Note (e.g. No onion)" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400" />
            
            <Button type="submit" variant="primary" className="w-full py-4 text-xs font-bold uppercase tracking-widest gap-2" size="sm">
              <ShoppingCart className="w-3.5 h-3.5" /> Add to List
            </Button>
          </form>
        </>
      )}
    </GlassCard>
  );
};
