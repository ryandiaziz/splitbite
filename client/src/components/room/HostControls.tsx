import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { formatIDR, parseIDR } from '../../utils/formatters';
import { IParticipant } from '../../types/room.types';

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
    <GlassCard className="p-6 bg-white border border-amber-200 shadow-amber-100/50" intensity="light">
      <h2 className="text-lg font-bold text-slate-800 mb-5 text-indigo-600">Host Dashboard</h2>

      {/* Join Requests */}
      {joinRequests.length > 0 && (
        <div className="mb-6 bg-indigo-50/50 rounded-xl border border-indigo-100 p-4">
          <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
            Join Requests ({joinRequests.length})
          </h3>
          <div className="space-y-3">
            {joinRequests.map((p) => (
              <div key={p.sessionId} className="flex flex-col xs:flex-row items-center justify-between bg-white p-3 rounded-lg border border-indigo-100 shadow-sm gap-3">
                <span className="font-bold text-slate-700">{p.name}</span>
                <div className="flex gap-2 w-full xs:w-auto">
                  <button 
                    onClick={() => onApprove(p.sessionId)}
                    className="flex-1 xs:flex-none bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => onReject(p.sessionId)}
                    className="flex-1 xs:flex-none bg-rose-100 hover:bg-rose-200 text-rose-600 text-xs font-bold px-4 py-2 rounded-md transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu description input */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Menu Notes</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={menuDescInput}
            onChange={e => setMenuDescInput(e.target.value)}
            placeholder="e.g. Nasi goreng sold out, promo buy 2 get 1..."
            rows={2}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
          />
          <Button variant="secondary" size="sm" onClick={onMenuDescUpdate} className="w-full sm:w-auto h-fit">Update</Button>
        </div>
      </div>

      {/* Re-upload menu button */}
      {hasMenuImage && (
        <div className="mb-5">
          <Button variant="secondary" size="sm" onClick={onMenuFileClick}>
            📷 Change Menu Photo
          </Button>
        </div>
      )}

      {/* Billing */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Billing</label>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:flex-1">
            <label className="block text-[10px] text-slate-400 mb-1">Tax / Delivery</label>
            <input type="text" value={formatIDR(taxInput)} onChange={e => setTaxInput(parseIDR(e.target.value))} placeholder="e.g. 15.000" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <div className="w-full sm:flex-1">
            <label className="block text-[10px] text-slate-400 mb-1">Total Discount</label>
            <input type="text" value={formatIDR(discountInput)} onChange={e => setDiscountInput(parseIDR(e.target.value))} placeholder="e.g. 0" className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>
          <Button variant="primary" size="sm" onClick={onUpdateFees} className="w-full sm:w-auto">Apply</Button>
        </div>
      </div>

      {/* Host receipt upload */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Original Receipt</label>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" disabled={uploadingReceipt} onClick={onHostReceiptClick}>
            {uploadingReceipt ? '⏳ Uploading...' : `🧾 ${hasHostReceipt ? 'Change Receipt' : 'Upload Receipt'}`}
          </Button>
          {hasHostReceipt && (
            <span className="text-xs text-emerald-600 font-semibold">✓ Uploaded</span>
          )}
        </div>
      </div>

      {/* Lock / Unlock Orders */}
      <div className="pt-4 border-t border-amber-200/60">
        <button
          onClick={onToggleLock}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
            isOrderLocked
              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-200'
              : 'bg-rose-100 text-rose-700 border-2 border-rose-300 hover:bg-rose-200'
          }`}
        >
          {isOrderLocked ? '🔓 Re-open Orders' : '🔒 Lock Orders'}
        </button>
        <div className="mt-3 pt-3 border-t border-amber-200/40">
           <Button 
            variant="secondary" 
            className="w-full bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" 
            size="sm"
            onClick={onCloseRoom}
           >
            🗑️ Close Room & Delete Data
           </Button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-1.5">
          {isOrderLocked ? 'Participants cannot add/edit orders right now.' : 'Click to lock once everyone has finished ordering.'}
        </p>
      </div>
    </GlassCard>
  );
};
