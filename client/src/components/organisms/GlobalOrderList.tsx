import React from 'react';
import { GlassCard } from '../atoms/GlassCard';
import { Button } from '../atoms/Button';
import { PaymentStatus } from './PaymentStatus';
import { IParticipant } from '../../types/room.types';
import { formatIDR } from '../../utils/formatters';
import { Pencil, User as UserIcon, Receipt, AlertCircle } from 'lucide-react';

export const GlobalOrderList: React.FC<GlobalOrderListProps> = ({
  participants,
  sessionId,
  isHost,
  globalTotal,
  editingOrderId,
  editName,
  setEditName,
  editPrice,
  setEditPrice,
  editQuantity,
  setEditQuantity,
  onStartEdit,
  onUpdateOrder,
  onCancelEdit,
  onUploadReceipt,
  onConfirmPayment,
  onViewReceipt,
}) => {
  const approvedParticipants = participants.filter((p) => p.isApproved && !p.isRejected);

  return (
    <GlassCard className="p-6 bg-white border border-slate-200" intensity="light">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center border border-[var(--brand-primary)]/20">
              <Receipt className="w-5 h-5 text-[var(--brand-primary)]" />
           </div>
           <h2 className="text-xl font-bold text-slate-800 tracking-tight">Global Order List</h2>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none mb-1">Total Bill</span>
           <span className="font-mono text-lg font-bold text-[var(--brand-primary-dark)]">
             Rp {globalTotal.toLocaleString()}
           </span>
        </div>
      </div>

      <div className="space-y-8">
        {approvedParticipants.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
            <UserIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm italic">Waiting for participants to join...</p>
          </div>
        )}
        
        {approvedParticipants.map((p, idx) => {
          const isMe = p.sessionId === sessionId;
          const pTotal = (p.orders || []).reduce((a, o) => a + (o.price * (o.quantity || 1)), 0);
          
          return (
            <div key={idx} className="relative">
              <div className="flex justify-between items-end mb-4 px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isMe ? 'bg-[var(--brand-primary)] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {p.name} 
                    {isMe && <span className="text-[9px] font-bold bg-[var(--brand-primary)]/10 px-2 py-0.5 rounded-full text-[var(--brand-primary)] uppercase tracking-wider">You</span>}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono font-bold text-slate-700">Rp {pTotal.toLocaleString()}</span>
                  {isHost && !isMe && pTotal > 0 && (
                    <PaymentStatus 
                      participant={p} 
                      isHost={isHost} 
                      onUploadReceipt={onUploadReceipt} 
                      onConfirmPayment={onConfirmPayment} 
                      onViewReceipt={onViewReceipt}
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-3 pl-10">
                {(p.orders || []).map((o, oIdx) => (
                  <div key={oIdx} className={`bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 ${editingOrderId === o.id ? 'ring-2 ring-[var(--brand-primary)] shadow-lg' : 'hover:border-slate-300 hover:shadow-md'}`}>
                    {editingOrderId === o.id ? (
                      <div className="p-4 space-y-4 bg-slate-50/50 rounded-2xl">
                        <div className="space-y-2">
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
                           <input 
                            type="text" 
                            value={editName} 
                            onChange={e => setEditName(e.target.value)}
                            className="w-full border-2 border-white rounded-xl px-4 py-2.5 font-semibold focus:border-[var(--brand-primary)] outline-none transition-all shadow-sm"
                            placeholder="Item Name..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest ml-1">Price (Rp)</label>
                            <input 
                              type="text" 
                              value={formatIDR(editPrice)} 
                              onChange={e => setEditPrice(e.target.value.replace(/\./g, ''))}
                              className="w-full border-2 border-white rounded-xl px-4 py-2.5 font-mono font-bold text-[var(--brand-primary-dark)] focus:border-[var(--brand-primary)] outline-none transition-all shadow-sm"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest ml-1">Qty</label>
                            <div className="flex items-center h-[50px] bg-white rounded-xl border-2 border-white shadow-sm px-2">
                              <button type="button" onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[var(--brand-primary)] transition-colors">-</button>
                              <input 
                                type="number" 
                                value={editQuantity} 
                                onChange={e => setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="flex-1 w-full text-center font-bold text-slate-700 outline-none bg-transparent"
                              />
                              <button type="button" onClick={() => setEditQuantity(editQuantity + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[var(--brand-primary)] transition-colors">+</button>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button 
                            onClick={onUpdateOrder} 
                            className="flex-1 py-3 text-xs font-bold uppercase tracking-widest"
                          >
                            Update
                          </Button>
                          <Button 
                            variant="secondary"
                            onClick={onCancelEdit} 
                            className="px-6 border-slate-200 text-xs font-bold uppercase tracking-widest"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center px-5 py-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex flex-col">
                            <p className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                              {o.itemName} 
                              {o.quantity > 1 && <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">x{o.quantity}</span>}
                            </p>
                          </div>
                          {o.note && <p className="text-[10px] text-slate-400 font-medium italic mt-1 flex items-center gap-1 opacity-70">
                             <div className="w-1 h-1 bg-slate-300 rounded-full" /> {o.note}
                          </p>}
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            {o.price === 0 ? (
                              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">
                                <AlertCircle className="w-3 h-3" /> Awaiting Price
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span className="font-mono text-slate-400 font-bold text-[9px] leading-none mb-1 opacity-60">
                                  {o.quantity > 1 ? `${o.quantity} x ${o.price.toLocaleString()}` : 'Individual'}
                                </span>
                                <span className="font-mono text-slate-700 font-bold text-sm leading-none">Rp {(o.price * (o.quantity || 1)).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          {isHost && (
                            <button 
                              onClick={() => onStartEdit(o)}
                              className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-all duration-300 border border-transparent hover:border-[var(--brand-primary)]/20 shadow-sm"
                              title="Edit Item"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {(p.orders || []).length === 0 && (
                   <p className="text-[10px] text-slate-400 italic font-medium uppercase tracking-widest opacity-50 ml-2">Empty list</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
