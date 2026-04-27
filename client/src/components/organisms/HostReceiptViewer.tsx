import React, { useState } from 'react';
import { GlassCard } from '../atoms/GlassCard';
import { Receipt, ZoomIn, X } from 'lucide-react';

interface HostReceiptViewerProps {
  receiptUrl?: string;
}

export const HostReceiptViewer: React.FC<HostReceiptViewerProps> = ({ receiptUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!receiptUrl) return null;

  return (
    <>
      <GlassCard className="p-5 bg-white border border-slate-200 mt-6 shadow-sm" intensity="light">
        <div className="flex items-center gap-2 mb-4">
           <Receipt className="w-4 h-4 text-slate-400" />
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Original Merchant Receipt</h3>
        </div>
        
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full rounded-2xl overflow-hidden border border-slate-100 hover:border-indigo-300 transition-all duration-500 hover:shadow-xl cursor-zoom-in group relative"
        >
          <img
            src={receiptUrl}
            alt="Original receipt"
            className="w-full h-auto max-h-48 object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
             <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-2xl border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <ZoomIn className="w-5 h-5 text-indigo-600" />
             </div>
          </div>
        </button>
        <p className="text-[9px] text-slate-400 mt-3 text-center italic font-bold uppercase tracking-widest opacity-60">
          Click to expand details
        </p>
      </GlassCard>

      {isExpanded && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setIsExpanded(false)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-auto rounded-3xl shadow-2xl animate-fade-in-up">
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl w-11 h-11 flex items-center justify-center shadow-lg transition-all border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={receiptUrl}
              alt="Original receipt full"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </>
  );
};
