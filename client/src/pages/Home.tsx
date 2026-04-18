import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

export const Home: React.FC<{ 
  onJoinRoom: (id: string) => Promise<boolean>, 
  onCreateRoom: (type: 'image' | 'structured') => Promise<boolean>,
  myName: string,
  onSetName: (name: string) => void
}> = ({ onJoinRoom, onCreateRoom, myName, onSetName }) => {
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

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoomId = roomId || invitedRoomId;
    if (localName.trim() && finalRoomId) {
      setIsLoading(true);
      onSetName(localName.trim());
      // Wait a bit for aesthetic delay
      await new Promise(resolve => setTimeout(resolve, 600));
      await onJoinRoom(finalRoomId);
      setIsLoading(false);
    }
  };

  const handleCreate = async (type: 'image' | 'structured') => {
    if (localName.trim()) {
      setIsLoading(true);
      onSetName(localName.trim());
      // Wait a bit for aesthetic delay
      await new Promise(resolve => setTimeout(resolve, 600));
      await onCreateRoom(type);
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 animate-gradient overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <GlassCard className="p-10 text-center">
          <div className="mb-10">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-4 drop-shadow-sm">
              SplitBite.
            </h1>
            {invitedRoomId ? (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6 animate-fade-in">
                <p className="text-indigo-800 font-semibold mb-1">You're invited to join room:</p>
                <div className="text-2xl font-mono font-bold text-indigo-600 tracking-wider">#{invitedRoomId}</div>
              </div>
            ) : (
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                No logins. No downloads. Just create a temporary room, invite your friends, order food together, and we do the complex split bill math.
              </p>
            )}
          </div>

          <div className="mb-10 text-left bg-white/50 p-6 rounded-2xl shadow-sm border border-white/50">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Welcome! What should we call you?</label>
            <input 
              type="text" 
              value={localName} 
              onChange={(e) => {
                setLocalName(e.target.value);
              }}
              placeholder="e.g., Alex" 
              className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-indigo-900 font-bold outline-none transition-all" 
              minLength={4}
            />
            {localName.trim().length > 0 && localName.trim().length < 4 && (
              <p className="text-xs text-rose-500 font-bold mt-2 animate-pulse">Min. 4 characters required!</p>
            )}
          </div>

          {!localName.trim() || localName.trim().length < 4 ? (
            <p className="text-indigo-900 font-medium animate-pulse">👆 Please enter your nickname (min. 4 chars) to continue!</p>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {invitedRoomId ? (
                   <Button 
                    variant="primary" 
                    className="w-full text-lg py-5 shadow-indigo-500/20" 
                    onClick={handleJoin}
                    isLoading={isLoading}
                   >
                    Join Room Now
                   </Button>
                ) : (
                  <>
                    <Button 
                      variant="primary" 
                      className="w-full text-lg py-4 shadow-pink-500/20" 
                      onClick={() => handleCreate('image')}
                      isLoading={isLoading}
                      disabled={localName.trim().length < 4}
                    >
                      Start Quick Menu (Image)
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full py-3"
                      onClick={() => handleCreate('structured')}
                      disabled={isLoading || localName.trim().length < 4}
                    >
                      Start Structured Menu (Text)
                    </Button>
                  </>
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
                  className="w-full sm:flex-1 rounded-xl border border-white/40 bg-white/50 px-5 py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all duration-300"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" disabled={isLoading || !roomId.trim() || localName.trim().length < 4} className="w-full sm:w-auto">
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
