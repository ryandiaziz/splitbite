import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

export const Home: React.FC<{ 
  onJoinRoom: (id: string) => void, 
  onCreateRoom: (type: 'image' | 'structured') => void,
  myName: string,
  onSetName: (name: string) => void
}> = ({ onJoinRoom, onCreateRoom, myName, onSetName }) => {
  const [roomId, setRoomId] = useState('');
  const [localName, setLocalName] = useState(myName);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      setIsLoading(true);
      // Simulate network
      setTimeout(() => onJoinRoom(roomId), 600);
    }
  };

  const handleCreate = (type: 'image' | 'structured') => {
    setIsLoading(true);
    setTimeout(() => onCreateRoom(type), 600);
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
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              No logins. No downloads. Just create a temporary room, invite your friends, order food together, and we do the complex split bill math.
            </p>
          </div>

          <div className="mb-10 text-left bg-white/50 p-6 rounded-2xl shadow-sm border border-white/50">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Welcome! What should we call you?</label>
            <input 
              type="text" 
              value={localName} 
              onChange={(e) => {
                setLocalName(e.target.value);
                onSetName(e.target.value);
              }}
              placeholder="e.g., Alex" 
              className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-indigo-900 font-bold outline-none transition-all" 
            />
          </div>

          {!localName.trim() ? (
            <p className="text-indigo-900 font-medium animate-pulse">👆 Please enter your nickname above to continue!</p>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                <Button 
                  variant="primary" 
                  className="w-full text-lg py-4 shadow-pink-500/20" 
                  onClick={() => handleCreate('image')}
                  isLoading={isLoading}
                >
                  Start Quick Menu (Image)
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full py-3"
                  onClick={() => handleCreate('structured')}
                  disabled={isLoading}
                >
                  Start Structured Menu (Text)
                </Button>
              </div>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-300/50"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-semibold tracking-wider uppercase">or join room</span>
                <div className="flex-grow border-t border-slate-300/50"></div>
              </div>
              
              <form onSubmit={handleJoin} className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Room ID" 
                  className="flex-1 rounded-xl border border-white/40 bg-white/50 px-5 py-3 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all duration-300"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                />
                <Button type="submit" variant="primary" disabled={isLoading || !roomId.trim()}>
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
