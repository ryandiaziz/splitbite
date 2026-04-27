import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { PaymentStatus } from './PaymentStatus';
import { IParticipant } from '../../types/room.types';
import { formatIDR } from '../../utils/formatters';

interface GlobalOrderListProps {
  participants: IParticipant[];
  sessionId: string;
  isHost: boolean;
  globalTotal: number;
  editingOrderId: string | null;
  editName: string;
  setEditName: (val: string) => void;
  editPrice: string;
  setEditPrice: (val: string) => void;
  editQuantity: number;
  setEditQuantity: (val: number) => void;
  onStartEdit: (order: any) => void;
  onUpdateOrder: () => void;
  onCancelEdit: () => void;
  onUploadReceipt: (base64: string) => void;
  onConfirmPayment: (id: string) => void;
  onViewReceipt: (url: string) => void;
}

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
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex justify-between items-center">
        Global Order List
        <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-sm font-mono">
          Rp {globalTotal.toLocaleString()}
        </span>
      </h2>

      <div className="space-y-6">
        {approvedParticipants.length === 0 && <p className="text-slate-400 text-sm italic">No participants yet.</p>}
        
        {approvedParticipants.map((p, idx) => {
          const isMe = p.sessionId === sessionId;
          const pTotal = (p.orders || []).reduce((a, o) => a + (o.price * (o.quantity || 1)), 0);
          
          return (
            <div key={idx} className={`p-4 rounded-xl border ${isMe ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-700 tabular-nums">
                  {p.name} {isMe && <span className="text-xs font-normal bg-indigo-100 px-2 rounded-full text-indigo-700 ml-2">YOU</span>}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-600">Rp {pTotal.toLocaleString()}</span>
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
              
              <div className="space-y-2">
                {(p.orders || []).map((o, oIdx) => (
                  <div key={oIdx} className={`bg-white rounded-lg border border-slate-100 shadow-sm text-sm overflow-hidden ${editingOrderId === o.id ? ' ring-2 ring-indigo-500 ring-inset' : ''}`}>
                    {editingOrderId === o.id ? (
                      <div className="p-4 space-y-4 bg-indigo-50/30">
                        <div className="space-y-2">
                           <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Name</label>
                           <input 
                            type="text" 
                            value={editName} 
                            onChange={e => setEditName(e.target.value)}
                            className="w-full border-2 border-white rounded-xl px-4 py-2.5 font-semibold focus:border-indigo-500 outline-none transition-all shadow-sm"
                            placeholder="Item Name..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Price (Rp)</label>
                            <input 
                              type="text" 
                              value={formatIDR(editPrice)} 
                              onChange={e => setEditPrice(e.target.value.replace(/\./g, ''))}
                              className="w-full border-2 border-white rounded-xl px-4 py-2.5 font-mono font-bold text-indigo-700 focus:border-indigo-400 outline-none transition-all shadow-sm"
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Quantity</label>
                            <div className="flex items-center h-[46px] bg-white rounded-xl border-2 border-white shadow-sm px-2">
                              <button type="button" onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))} className="w-8 h-8 flex items-center justify-center text-indigo-600 font-black hover:bg-indigo-50 rounded-lg transition-colors">-</button>
                              <input 
                                type="number" 
                                value={editQuantity} 
                                onChange={e => setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                className="flex-1 w-full text-center font-bold text-indigo-700 outline-none bg-transparent"
                              />
                              <button type="button" onClick={() => setEditQuantity(editQuantity + 1)} className="w-8 h-8 flex items-center justify-center text-indigo-600 font-black hover:bg-indigo-50 rounded-lg transition-colors">+</button>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button 
                            onClick={onUpdateOrder} 
                            className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]"
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={onCancelEdit} 
                            className="px-6 bg-white text-slate-500 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center p-2.5">
                        <div className="flex-1 max-w-full overflow-hidden pr-2">
                          <div className="flex flex-col">
                            <p className="font-semibold text-slate-800 break-words">
                              {o.itemName} 
                              {o.quantity > 1 && <span className="ml-1.5 text-indigo-600 font-bold">x{o.quantity}</span>}
                            </p>
                          </div>
                          {o.note && <p className="text-xs text-slate-500 italic mt-0.5 break-words">Note: {o.note}</p>}
                        </div>
                        
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            {o.price === 0 ? (
                              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">Waiting for price...</span>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span className="font-mono text-slate-500 font-bold text-[10px] opacity-60 leading-none mb-1">
                                  {o.quantity > 1 ? `${o.quantity} x ${o.price.toLocaleString()}` : ''}
                                </span>
                                <span className="font-mono text-slate-700 font-bold leading-none">Rp {(o.price * (o.quantity || 1)).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          {isHost && (
                            <button 
                              onClick={() => onStartEdit(o)}
                              className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 hover:text-white hover:bg-indigo-500 transition-all duration-300 shadow-sm"
                              title="Edit Item"
                            >
                              ✎
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {(p.orders || []).length === 0 && <span className="text-xs text-slate-400 italic">Thinking...</span>}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};
