import React from 'react';
import { GlassCard } from '../ui/GlassCard';

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
    <GlassCard className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl mt-6 border-white/20">
      <div className="mb-6 pb-4 border-b border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">Room Billing Summary</h3>
        <div className="space-y-1.5 text-xs opacity-90 font-medium">
          <div className="flex justify-between">
            <span>Room Subtotal</span>
            <span>Rp {totalCartValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-emerald-300">
            <span>Host Discount</span>
            <span>- Rp {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-amber-300">
            <span>Tax & Delivery</span>
            <span>+ Rp {additionalFees.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-4 opacity-90 drop-shadow-sm">Your Actual Split</h3>
      
      <div className="space-y-2 text-sm font-medium">
        <div className="flex justify-between">
          <span className="opacity-80">Your Orders ({myTotalItems} items)</span>
          <span>Rp {myTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80">Proportional Tax & Fees</span>
          <span>{myShareOfExtra >= 0 ? '+' : '-'} Rp {Math.abs(Math.ceil(myShareOfExtra)).toLocaleString()}</span>
        </div>
        
        <div className="border-t border-white/30 mt-4 pt-4 flex justify-between items-center">
          <span className="text-base font-bold">Total to Pay</span>
          <span className="text-2xl font-black tracking-tight">
            Rp {Math.ceil(myFinalBill).toLocaleString()}
          </span>
        </div>
      </div>
    </GlassCard>
  );
};
