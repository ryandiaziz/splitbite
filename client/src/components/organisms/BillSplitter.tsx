import React from 'react';
import { GlassCard } from '../atoms/GlassCard';
import { CreditCard, Info, CheckCircle } from 'lucide-react';

interface BillSplitterProps {
  room: any;
  sessionId: string;
}

export const BillSplitter: React.FC<BillSplitterProps> = ({ room, sessionId }) => {
  if (!room || !room.participants) return null;

  const additionalFees = room.additionalFees || 0;
  const discount = room.discount || 0;
  const netExtra = additionalFees - discount;

  const allOrders = room.participants.flatMap((p: any) => p.orders || []);
  const totalCartValue = allOrders.reduce((a: number, o: any) => a + (o.price * (o.quantity || 1)), 0);
  
  const me = room.participants.find((p: any) => p.sessionId === sessionId);
  const myOrders = me?.orders || [];
  const myTotal = myOrders.reduce((a: number, o: any) => a + (o.price * (o.quantity || 1)), 0);
  const myTotalItems = myOrders.reduce((a: number, o: any) => a + (o.quantity || 1), 0);

  let myShareOfExtra = 0;
  if (totalCartValue > 0) {
    myShareOfExtra = (myTotal / totalCartValue) * netExtra;
  }

  const myFinalBill = myTotal + myShareOfExtra;

  return (
    <GlassCard className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl mt-6 border-white/20 relative overflow-hidden">
      
      <div className="mb-8 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 mb-4 opacity-60">
           <Info className="w-3.5 h-3.5" />
           <h3 className="text-[10px] font-bold uppercase tracking-widest leading-none">Room Billing Summary</h3>
        </div>
        <div className="space-y-2 text-[11px] opacity-80 font-bold uppercase tracking-wider">
          <div className="flex justify-between">
            <span className="opacity-60">Subtotal</span>
            <span>Rp {totalCartValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span className="opacity-60">Discount</span>
            <span>- Rp {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-amber-400">
            <span className="opacity-60">Tax & Fees</span>
            <span>+ Rp {additionalFees.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
              <CreditCard className="w-4 h-4 text-white" />
           </div>
           <h3 className="text-sm font-bold opacity-90 tracking-tight">Your Personal Split</h3>
        </div>
        
        <div className="space-y-3 text-xs font-bold uppercase tracking-wider">
          <div className="flex justify-between">
            <span className="opacity-40">Orders ({myTotalItems} items)</span>
            <span className="opacity-90">Rp {myTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-40">Shared Extra Fees</span>
            <span className="opacity-90">{myShareOfExtra >= 0 ? '+' : '-'} Rp {Math.abs(Math.ceil(myShareOfExtra)).toLocaleString()}</span>
          </div>
          
          <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Total to Pay</span>
                <span className="text-2xl font-black tracking-tight text-white">
                  Rp {Math.ceil(myFinalBill).toLocaleString()}
                </span>
              </div>
              <div className="w-10 h-10 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--brand-primary)]/20 border border-white/20">
                 <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
