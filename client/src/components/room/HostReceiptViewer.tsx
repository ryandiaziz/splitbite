import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';

interface HostReceiptViewerProps {
  receiptUrl?: string;
}

export const HostReceiptViewer: React.FC<HostReceiptViewerProps> = ({ receiptUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!receiptUrl) return null;

  return (
    <>
      <GlassCard className="p-4 bg-white border border-slate-200 mt-6" intensity="light">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span className="text-base">🧾</span> Kuitansi Asli
        </h3>
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md cursor-zoom-in"
        >
          <img
            src={receiptUrl}
            alt="Original receipt from host"
            className="w-full h-auto max-h-48 object-cover"
          />
        </button>
        <p className="text-xs text-slate-400 mt-2 text-center italic">
          Tap untuk memperbesar
        </p>
      </GlassCard>

      {/* Fullscreen overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-auto rounded-2xl">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-slate-700 rounded-full w-9 h-9 flex items-center justify-center shadow-lg text-lg font-bold transition-all"
            >
              ✕
            </button>
            <img
              src={receiptUrl}
              alt="Original receipt (full size)"
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
