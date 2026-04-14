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
  const totalCartValue = allOrders.reduce((a: number, o: any) => a + o.price, 0);
  
  const me = room.participants.find((p: any) => p.sessionId === sessionId);
  const myOrders = me?.orders || [];
  const myTotal = myOrders.reduce((a: number, o: any) => a + o.price, 0);

  let myShareOfExtra = 0;
  if (totalCartValue > 0) {
    myShareOfExtra = (myTotal / totalCartValue) * netExtra;
  }

  const myFinalBill = myTotal + myShareOfExtra;

  return (
    <GlassCard className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl mt-6 border-white/20">
      <h3 className="text-lg font-bold mb-4 opacity-90 drop-shadow-sm">Your Actual Split</h3>
      
      <div className="space-y-2 text-sm font-medium">
        <div className="flex justify-between">
          <span className="opacity-80">Your Orders ({myOrders.length} items)</span>
          <span>Rp {myTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-80">Proportional Tax & Fees</span>
          <span>+ Rp {Math.ceil(myShareOfExtra).toLocaleString()}</span>
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
