import React, { useRef } from 'react';
import { Button } from '../ui/Button';

interface PaymentStatusProps {
  participant: any;
  isHost: boolean;
  onUploadReceipt: (base64: string) => void;
  onConfirmPayment: (targetSessionId: string) => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ participant, isHost, onUploadReceipt, onConfirmPayment }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) { // roughly 800kb limit for naive Redis safety
        alert("Image too large. Please use a smaller screenshot (Max 800 KB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const status = participant.paymentStatus || 'pending';

  if (isHost) {
    if (status === 'pending') return <span className="text-xs text-slate-400 font-semibold italic">Unpaid</span>;
    if (status === 'paid') return (
      <div className="flex items-center gap-2">
        <a href={participant.receiptImageUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline font-semibold">
          Review Receipt
        </a>
        <Button variant="primary" size="sm" onClick={() => onConfirmPayment(participant.sessionId)}>Verify</Button>
      </div>
    );
    if (status === 'confirmed') return <span className="text-xs text-emerald-600 font-bold px-2 py-1 bg-emerald-50 border border-emerald-200 rounded">✅ Verified</span>;
  }

  // Not Host (Is Self)
  if (status === 'pending') {
    return (
      <div className="mt-2 text-right">
        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>📎 Upload Receipt</Button>
      </div>
    );
  }
  if (status === 'paid') return <div className="mt-3 text-right"><span className="text-xs text-amber-600 font-bold px-2 py-1 bg-amber-50 border border-amber-200 rounded">⏳ Waiting Host Verification</span></div>;
  if (status === 'confirmed') return <div className="mt-3 text-right"><span className="text-xs text-emerald-600 font-bold px-3 py-1 bg-emerald-50 border border-emerald-200 rounded">🥳 Lunas (Confirmed)</span></div>;

  return null;
};
