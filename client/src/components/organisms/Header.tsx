import React from 'react';
import { Button } from '../atoms/Button';
import { RoomIdBadge } from '../molecules/RoomIdBadge';
import { formatTimeLeft } from '../../utils/formatters';
import { Lock, Crown } from 'lucide-react';

interface HeaderProps {
  roomId: string;
  isConnected: boolean;
  isHost: boolean;
  isOrderLocked: boolean;
  timeLeft: number | null;
  onLeave: () => void;
  onCopyId: () => void;
  copyFeedback: boolean;
}

export const Header: React.FC<HeaderProps> = ({
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
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary-dark)] tracking-tight">SplitBite</h1>
          
          <RoomIdBadge 
            roomId={roomId} 
            onCopy={onCopyId} 
            copyFeedback={copyFeedback} 
          />

          {timeLeft !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Expires:</span>
              <span className="font-mono text-xs font-bold tabular-nums">{formatTimeLeft(timeLeft)}</span>
            </div>
          )}
          <div className="flex gap-2">
            {isHost && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-amber-100 flex items-center gap-1">
                <Crown className="w-3 h-3" /> Host
              </span>
            )}
            {isOrderLocked && (
              <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg uppercase tracking-wider border border-rose-100 flex items-center gap-1 animate-pulse">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className={`block h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              {isConnected && <span className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-75"></span>}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onLeave} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest border-slate-200">Leave</Button>
        </div>
      </div>
    </header>
  );
};
