import React from 'react';
import { GlassCard } from '../atoms/GlassCard';
import { Button } from '../atoms/Button';
import { formatIDR, parseIDR } from '../../utils/formatters';
import { IParticipant } from '../../types/room.types';
import { Camera, Loader2, Receipt, Unlock, Lock, Trash2, Check, Settings, UserPlus, FileText, CreditCard } from 'lucide-react';

interface HostControlsProps {
  participants: IParticipant[];
  menuDescInput: string;
  setMenuDescInput: (val: string) => void;
  onMenuDescUpdate: () => void;
  onMenuFileClick: () => void;
  hasMenuImage: boolean;
  taxInput: string;
  setTaxInput: (val: string) => void;
  discountInput: string;
  setDiscountInput: (val: string) => void;
  onUpdateFees: () => void;
  uploadingReceipt: boolean;
  onHostReceiptClick: () => void;
  hasHostReceipt: boolean;
  isOrderLocked: boolean;
  onToggleLock: () => void;
  onCloseRoom: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const HostControls: React.FC<HostControlsProps> = ({
  participants,
  menuDescInput,
  setMenuDescInput,
  onMenuDescUpdate,
  onMenuFileClick,
  hasMenuImage,
  taxInput,
  setTaxInput,
  discountInput,
  setDiscountInput,
  onUpdateFees,
  uploadingReceipt,
  onHostReceiptClick,
  hasHostReceipt,
  isOrderLocked,
  onToggleLock,
  onCloseRoom,
  onApprove,
  onReject,
}) => {
  const joinRequests = participants.filter((p) => !p.isApproved && !p.isRejected);

  return (
    <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm" intensity="light">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
           <Settings className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none mb-1">Host Dashboard</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management Console</p>
        </div>
      </div>

      {/* Join Requests */}
      {joinRequests.length > 0 && (
        <div className="mb-8 bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            Join Requests ({joinRequests.length})
          </h3>
          <div className="space-y-3">
            {joinRequests.map((p) => (
              <div key={p.sessionId} className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm gap-4">
                <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onApprove(p.sessionId)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-colors uppercase tracking-wider"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => onReject(p.sessionId)}
                    className="bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 text-[10px] font-bold px-4 py-2 rounded-lg transition-colors uppercase tracking-wider"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Menu Notes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session Notes</label>
          </div>
          <div className="flex flex-col gap-2">
            <textarea
              value={menuDescInput}
              onChange={e => setMenuDescInput(e.target.value)}
              placeholder="Add info about the menu or venue..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-400 bg-slate-50/30"
            />
            <Button variant="secondary" size="sm" onClick={onMenuDescUpdate} className="text-[10px] font-bold uppercase tracking-widest border-slate-200">Update Notes</Button>
          </div>
          {hasMenuImage && (
            <Button variant="secondary" size="sm" onClick={onMenuFileClick} className="w-full text-[10px] font-bold uppercase tracking-widest gap-2 border-slate-200">
              <Camera className="w-3.5 h-3.5" /> Re-upload Photo
            </Button>
          )}
        </div>

        {/* Billing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fees & Billing</label>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider ml-1">Tax / Delivery</label>
                <input type="text" value={formatIDR(taxInput)} onChange={e => setTaxInput(parseIDR(e.target.value))} placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider ml-1">Discount</label>
                <input type="text" value={formatIDR(discountInput)} onChange={e => setDiscountInput(parseIDR(e.target.value))} placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all" />
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={onUpdateFees} className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest">Recalculate Totals</Button>
            
            <div className="pt-2">
               <label className="block text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-wider ml-1">Session Receipt</label>
               <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" disabled={uploadingReceipt} onClick={onHostReceiptClick} className="text-[10px] font-bold uppercase tracking-widest gap-2 border-slate-200 py-2.5">
                  {uploadingReceipt ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
                  {hasHostReceipt ? 'Update Receipt' : 'Upload Receipt'}
                </Button>
                {hasHostReceipt && (
                  <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg border border-emerald-100">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Controls */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onToggleLock}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border-2 ${
              isOrderLocked
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 shadow-sm'
            }`}
          >
            {isOrderLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {isOrderLocked ? 'Re-open Orders' : 'Finalize & Lock Orders'}
          </button>
          
          <button 
            onClick={onCloseRoom}
            className="px-6 py-3.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-2xl transition-all duration-300 group"
          >
            <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-3 font-medium italic opacity-70">
          {isOrderLocked 
            ? 'The session is currently locked. Participants cannot edit their orders.' 
            : 'Lock the session once all orders have been submitted to prevent further changes.'}
        </p>
      </div>
    </GlassCard>
  );
};
