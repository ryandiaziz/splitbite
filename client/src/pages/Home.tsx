import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/atoms/Button';
import { GlassCard } from '../components/atoms/GlassCard';
import { FormInput } from '../components/molecules/FormInput';
import { setMyName } from '../store/slices/authSlice';
import { RootState } from '../store';
import { roomService } from '../api/roomService';

export const Home: React.FC = () => {
  console.log('Home Render - Verifying Refresh');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myName, sessionId } = useSelector((state: RootState) => state.auth);
  
  const [roomId, setRoomId] = useState('');
  const [localName, setLocalName] = useState(myName);
  const [isLoading, setIsLoading] = useState(false);
  const [invitedRoomId, setInvitedRoomId] = useState<string | null>(null);

  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#room/')) {
      const id = hash.replace('#room/', '');
      setRoomId(id);
      setInvitedRoomId(id);
    }
  }, []);

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
                <p className="text-[var(--brand-primary-dark)] font-semibold mb-1">You're invited to join room:</p>
                <div className="text-2xl font-mono font-bold text-[var(--brand-primary)] tracking-wider">#{invitedRoomId}</div>
              </div>
            ) : (
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                No logins. No downloads. Simple bill splitting for everyone.
              </p>
            )}
          </div>

          <div className="mb-10 text-left bg-white/50 p-6 rounded-2xl shadow-sm border border-white/50">
            <FormInput 
              label="Welcome! What should we call you?"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Alex"
              minLength={4}
              error={nameError}
            />
          </div>

          {!localName.trim() || localName.trim().length < 4 ? (
            <p className="text-[var(--brand-primary-dark)] font-medium animate-pulse">👆 Please enter your nickname to continue!</p>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {invitedRoomId ? (
                   <Button 
                    variant="primary" 
                    className="w-full text-lg py-5 shadow-[var(--brand-primary)]/20" 
                    onClick={() => handleJoin()}
                    isLoading={isLoading}
                   >
                    Join Room Now
                   </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-full text-lg py-4 shadow-[var(--brand-accent)]/20" 
                    onClick={() => handleCreate('image')}
                    isLoading={isLoading}
                    disabled={!!nameError}
                  >
                    Start Quick Menu (Image)
                  </Button>
                )}
              </div>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-300/50"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-semibold tracking-wider uppercase">or join room</span>
                <div className="flex-grow border-t border-slate-300/50"></div>
              </div>
              
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Room ID" 
                  className="w-full sm:flex-1 rounded-xl border border-white/40 bg-white/50 px-5 py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--brand-primary)] focus:bg-white focus:outline-none transition-all duration-300"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" disabled={isLoading || !roomId.trim() || !!nameError} className="w-full sm:w-auto">
                  Join
                </Button>
              </form>
            </>
          )}
        </GlassCard>
        
        <p className="text-center mt-6 text-white/70 text-sm font-medium">
          No login required. Ephemeral rooms disappear after 24h.
        </p>
      </div>
    </div>
  );
};
