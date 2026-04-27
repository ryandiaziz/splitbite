import React from 'react';
import { Button } from '../ui/Button';
import { formatTimeLeft } from '../../utils/formatters';

interface RoomHeaderProps {
  roomId: string;
  isConnected: boolean;
  isHost: boolean;
  isOrderLocked: boolean;
  timeLeft: number | null;
  onLeave: () => void;
  onCopyId: () => void;
  copyFeedback: boolean;
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomId,
  isConnected,
  isHost,
  isOrderLocked,
  timeLeft,
  onLeave,
  onCopyId,
  copyFeedback,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 tracking-tight">SplitBite</h1>
          <div className="flex items-center gap-1 group">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-xs sm:text-sm rounded-md font-semibold border border-slate-200">
              #{roomId}
            </span>
            <button 
              onClick={onCopyId}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 transition-colors relative"
              title="Copy Room ID"
            >
              {copyFeedback ? (
                <span className="text-[10px] absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded whitespace-nowrap animate-bounce">Copied!</span>
              ) : null}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </button>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 animate-pulse">
              <span className="text-[10px] font-bold uppercase tracking-wider">Expires:</span>
              <span className="font-mono text-xs font-bold tabular-nums">{formatTimeLeft(timeLeft)}</span>
            </div>
          )}
          <div className="flex gap-1.5">
            {isHost && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-bold rounded uppercase">Host</span>}
            {isOrderLocked && (
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] sm:text-xs font-bold rounded uppercase animate-pulse">
                🔒 Orders Closed
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-xs sm:text-sm font-medium text-slate-500">{isConnected ? 'Live Sync' : 'Reconnecting...'}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onLeave} className="px-3 py-1">Leave</Button>
        </div>
      </div>
    </header>
  );
};
