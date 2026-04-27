import React from 'react';

interface RoomIdBadgeProps {
  roomId: string;
  onCopy: () => void;
  copyFeedback: boolean;
}

export const RoomIdBadge: React.FC<RoomIdBadgeProps> = ({ roomId, onCopy, copyFeedback }) => {
  return (
    <div className="flex items-center gap-1 group">
      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-xs sm:text-sm rounded-md font-semibold border border-slate-200">
        #{roomId}
      </span>
      <button 
        onClick={onCopy}
        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors relative"
        title="Copy Room ID"
      >
        {copyFeedback && (
          <span className="text-[10px] absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded whitespace-nowrap animate-bounce">
            Copied!
          </span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      </button>
    </div>
  );
};
