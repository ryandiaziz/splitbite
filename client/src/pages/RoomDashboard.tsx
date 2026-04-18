import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { BillSplitter } from '../components/room/BillSplitter';
import { PaymentStatus } from '../components/room/PaymentStatus';

interface RoomDashboardProps {
  roomId: string;
  sessionId: string;
  myName: string;
  onLeave: () => void;
}

export const RoomDashboard: React.FC<RoomDashboardProps> = ({ roomId, sessionId, myName, onLeave }) => {
  const { isConnected, sendMessage, lastMessage } = useWebSocket(`ws://localhost:9000/api/room/${roomId}/ws?session_id=${sessionId}`);
  
  const [newItem, setNewItem] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newNote, setNewNote] = useState('');
  
  const [taxInput, setTaxInput] = useState('');
  const [discountInput, setDiscountInput] = useState('');

  const isHost = lastMessage?.hostId === sessionId;
  const participants = lastMessage?.participants || [];

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: 'JOIN_PARTICIPANT', data: { name: myName }});
    }
  }, [isConnected, sendMessage, myName]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim() && newPrice.trim()) {
      const item = { 
        name: newItem, 
        price: Number(newPrice) || 0, 
        note: newNote 
      };
      sendMessage({ type: 'ADD_ORDER', data: item });
      setNewItem('');
      setNewPrice('');
      setNewNote('');
    }
  };

  const handleUpdateFees = () => {
    sendMessage({ type: 'UPDATE_FEES', data: { additionalFees: Number(taxInput) || 0, discount: Number(discountInput) || 0 }});
  };

  const handleUploadReceipt = (base64: string) => {
    sendMessage({ type: 'UPLOAD_RECEIPT', data: { receipt: base64 }});
  };

  const handleConfirmPayment = (targetSessionId: string) => {
    sendMessage({ type: 'CONFIRM_PAYMENT', data: { targetSessionId }});
  };

  const globalTotal = participants.flatMap((p: any) => p.orders || []).reduce((a: number, o: any) => a + o.price, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">SplitBite</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 font-mono text-sm rounded-md font-semibold border border-slate-200">
              #{roomId}
            </span>
            {isHost && <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase">Host</span>}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-sm font-medium text-slate-500 hidden sm:block">{isConnected ? 'Live Sync' : 'Reconnecting...'}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={onLeave}>Leave</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Menu Overview</h2>
            <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              [Pilih menu dari kertas menu ini]
            </div>
          </div>

          {isHost && (
            <GlassCard className="p-6 bg-white border border-amber-200 shadow-amber-100/50" intensity="light">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Host Controls: Billing</h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Additional Fees (Tax/Delivery)</label>
                  <input type="number" value={taxInput} onChange={e => setTaxInput(e.target.value)} placeholder="e.g. 15000" className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Discount</label>
                  <input type="number" value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder="e.g. 0" className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
                <div className="flex items-end">
                  <Button variant="primary" onClick={handleUpdateFees}>Apply Rates</Button>
                </div>
              </div>
            </GlassCard>
          )}

          <GlassCard className="p-6 bg-white border border-slate-200" intensity="light">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex justify-between items-center">
              Global Order List
              <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-sm font-mono">
                Rp {globalTotal.toLocaleString()}
              </span>
            </h2>

            <div className="space-y-6">
              {participants.length === 0 && <p className="text-slate-400 text-sm italic">No participants yet.</p>}
              
              {participants.map((p: any, idx: number) => {
                const isMe = p.sessionId === sessionId;
                const pTotal = (p.orders || []).reduce((a: number, o: any) => a + o.price, 0);
                
                return (
                <div key={idx} className={`p-4 rounded-xl border ${isMe ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-700 tabular-nums">
                      {p.name} {isMe && <span className="text-xs font-normal bg-indigo-100 px-2 rounded-full text-indigo-700 ml-2">YOU</span>}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-slate-600">Rp {pTotal.toLocaleString()}</span>
                      {isHost && !isMe && pTotal > 0 && (
                        <PaymentStatus participant={p} isHost={isHost} onUploadReceipt={handleUploadReceipt} onConfirmPayment={handleConfirmPayment} />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {(p.orders || []).map((o: any, oIdx: number) => (
                      <div key={oIdx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-sm">
                        <div>
                          <p className="font-semibold text-slate-800">{o.itemName}</p>
                          {o.note && <p className="text-xs text-slate-500 italic mt-0.5">Note: {o.note}</p>}
                        </div>
                        <span className="font-mono text-slate-500">Rp {o.price.toLocaleString()}</span>
                      </div>
                    ))}
                    {(p.orders || []).length === 0 && <span className="text-xs text-slate-400 italic">Thinking...</span>}
                  </div>
                </div>
              )})}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6 bg-white shadow-lg border border-slate-200 relative overflow-hidden" intensity="light">
            <h2 className="text-slate-800 font-bold mb-4">Add My Order</h2>
            <form onSubmit={handleAddItem} className="space-y-3">
              <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Food name..." className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
              <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Price (Rp)" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
              <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Note (e.g. No onion)" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              <Button type="submit" variant="primary" className="w-full" size="sm">Add to Cart</Button>
            </form>
          </GlassCard>

          {lastMessage && <BillSplitter room={lastMessage} sessionId={sessionId} />}

          {lastMessage?.participants.find((p:any) => p.sessionId === sessionId)?.orders?.length > 0 && (
             <PaymentStatus 
                participant={lastMessage.participants.find((p:any) => p.sessionId === sessionId)} 
                isHost={false} 
                onUploadReceipt={handleUploadReceipt} 
                onConfirmPayment={handleConfirmPayment} 
             />
          )}
        </div>
      </main>
    </div>
  );
};
