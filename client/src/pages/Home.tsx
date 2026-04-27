import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/atoms/Button';
import { GlassCard } from '../components/atoms/GlassCard';
import { FormInput } from '../components/molecules/FormInput';
import { setMyName } from '../store/slices/authSlice';
import { RootState } from '../store';
import { roomService } from '../api/roomService';
import { User, ArrowRight, Zap, LogIn } from 'lucide-react';

export const Home: React.FC = () => {
  console.log('Home Render - Verifying Refresh');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { myName, sessionId } = useSelector((state: RootState) => state.auth);
  
  const [roomId, setRoomId] = useState('');
  const [localName, setLocalName] = useState(myName);
  const [isLoading, setIsLoading] = useState(false);
  const [invitedRoomId, setInvitedRoomId] = useState<string | null>(null);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const inviteId = searchParams.get('invite');
    
    if (inviteId) {
      setRoomId(inviteId);
      setInvitedRoomId(inviteId);
    } else {
      const hash = window.location.hash;
      if (hash.startsWith('#room/')) {
        const id = hash.replace('#room/', '');
        setRoomId(id);
        setInvitedRoomId(id);
      }
    }
  }, [location.search]);

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalRoomId = roomId || invitedRoomId;
    if (localName.trim() && finalRoomId) {
      setIsLoading(true);
      dispatch(setMyName(localName.trim()));
      
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        const data = await roomService.getRoom(finalRoomId);
        if (data.status === 'success') {
          navigate(`/room/${finalRoomId}`);
        } else {
          alert(data.message || 'Room not found');
        }
      } catch (err) {
        alert('Failed to connect to server or room does not exist.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreate = async (type: 'image' | 'structured') => {
    if (localName.trim() && sessionId) {
      setIsLoading(true);
      dispatch(setMyName(localName.trim()));
      
      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        const data = await roomService.createRoom(sessionId, type);
        if (data.status === 'success' && data.roomId) {
          navigate(`/room/${data.roomId}`);
        } else {
          alert(data.message || 'Failed to create room');
        }
      } catch (err) {
        alert('Failed to connect to server. Ensure Backend is running.');
      } finally {
        setIsLoading(false);
      }
    }
  }

  const nameError = localName.trim().length > 0 && localName.trim().length < 4 
    ? "Min. 4 characters required!" 
    : undefined;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-accent)] p-6 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--brand-secondary)]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--brand-accent)]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <GlassCard className="p-10 text-center">
          <div className="mb-10">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary-dark)] to-[var(--brand-accent-dark)] mb-4 drop-shadow-sm">
              SplitBite.
            </h1>
            {invitedRoomId ? (
              <div className="bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 p-4 rounded-xl mb-6 animate-fade-in">
                <p className="text-[var(--brand-primary-dark)] font-semibold mb-1">Invitation Received</p>
                <div className="text-2xl font-mono font-bold text-[var(--brand-primary)] tracking-wider">#{invitedRoomId}</div>
              </div>
            ) : (
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Simple bill splitting for everyone.
              </p>
            )}
          </div>

          <div className="mb-10 text-left bg-white/50 p-6 rounded-2xl shadow-sm border border-white/50">
            <FormInput 
              label="Enter your nickname"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Alex"
              minLength={4}
              error={nameError}
              icon={<User className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {!localName.trim() || localName.trim().length < 4 ? (
            <div className="flex items-center justify-center gap-2 text-[var(--brand-primary-dark)] font-medium animate-pulse">
               <User className="w-4 h-4" />
               <span>Please enter your nickname to proceed</span>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {invitedRoomId ? (
                   <Button 
                    variant="primary" 
                    className="w-full text-lg py-5 shadow-[var(--brand-primary)]/20 gap-2" 
                    onClick={() => handleJoin()}
                    isLoading={isLoading}
                   >
                    Join Room <ArrowRight className="w-5 h-5" />
                   </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-full text-lg py-4 shadow-[var(--brand-accent)]/20 gap-2" 
                    onClick={() => handleCreate('image')}
                    isLoading={isLoading}
                    disabled={!!nameError}
                  >
                    <Zap className="w-5 h-5" /> Start New Room
                  </Button>
                )}
              </div>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-300/50"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold tracking-widest uppercase">Existing Room</span>
                <div className="flex-grow border-t border-slate-300/50"></div>
              </div>
              
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="Room ID" 
                    className="w-full rounded-xl border border-white/40 bg-white/50 pl-5 pr-5 py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--brand-primary)] focus:bg-white focus:outline-none transition-all duration-300"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="primary" disabled={isLoading || !roomId.trim() || !!nameError} className="w-full sm:w-auto px-8">
                  <LogIn className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}
        </GlassCard>
        
        <p className="text-center mt-6 text-white/70 text-xs font-semibold tracking-wide uppercase">
          Ephemeral rooms • No login required
        </p>
      </div>
    </div>
  );
};
