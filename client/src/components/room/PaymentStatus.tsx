import React, { useRef } from 'react';
import { Button } from '../ui/Button';

interface PaymentStatusProps {
  participant: any;
  isHost: boolean;
  onUploadReceipt: (base64: string) => void;
  onConfirmPayment: (targetSessionId: string) => void;
  onViewReceipt?: (imageUrl: string) => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ 
  participant, 
  isHost, 
  onUploadReceipt, 
  onConfirmPayment,
  onViewReceipt
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB raw limit (will be compressed)
        alert("Image too large. Max 5 MB.");
        return;
      }
      // Compress via Canvas before sending
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const MAX_DIM = 800;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.5);
        onUploadReceipt(base64);
      };
      img.onerror = () => alert("Failed to process image.");
      img.src = URL.createObjectURL(file);
    }
  };

  const status = participant.paymentStatus || 'pending';

  if (isHost) {
    if (status === 'pending') return (
      <Button 
        variant="secondary" 
        size="sm" 
        className="text-[10px] font-bold py-1 px-2 border-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" 
        onClick={() => {
          if (window.confirm(`Mark ${participant.name} as Paid manually?`)) {
            onConfirmPayment(participant.sessionId);
          }
        }}
      >
        💸 Mark Paid
      </Button>
    );

    if (status === 'paid') return (
      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => onViewReceipt?.(participant.receiptImageUrl)}
          className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-100 transition-colors"
        >
          👁️ Receipt
        </button>
        <Button variant="primary" size="sm" className="text-[10px] py-1 px-3" onClick={() => onConfirmPayment(participant.sessionId)}>Verify</Button>
      </div>
    );
    
    if (status === 'confirmed') return <span className="text-[10px] text-emerald-600 font-bold px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-md">✅ Verified</span>;
  }

  // Not Host (Is Self)
  if (status === 'pending') {
    return (
      <div className="mt-2 text-right">
        <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs">📎 Upload Receipt</Button>
      </div>
    );
  }
  if (status === 'paid') return <div className="mt-3 text-right"><span className="text-[10px] text-amber-600 font-bold px-2 py-1 bg-amber-50 border border-amber-200 rounded-md">⏳ Waiting Verification</span></div>;
  if (status === 'confirmed') return <div className="mt-3 text-right"><span className="text-[10px] text-emerald-600 font-bold px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md">🥳 Paid (Confirmed)</span></div>;

  return null;
};
