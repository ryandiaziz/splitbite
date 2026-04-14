import { useState, useEffect } from 'react'
import { Home } from './pages/Home'
import { RoomDashboard } from './pages/RoomDashboard'

function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [myName, setMyName] = useState<string>(localStorage.getItem('splitbite_name') || '');

  useEffect(() => {
    let sid = localStorage.getItem('splitbite_session');
    if (!sid) {
      sid = "user_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('splitbite_session', sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#room/')) {
        const id = hash.replace('#room/', '');
        if (id !== currentRoom && myName.trim()) handleJoinRoom(id);
      } else {
        setCurrentRoom(null);
      }
    };
    
    if (window.location.hash && myName.trim()) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoom, myName]);

  const handleSetName = (name: string) => {
    setMyName(name);
    localStorage.setItem('splitbite_name', name);
  };

  const handleJoinRoom = async (roomId: string) => {
    try {
      const res = await fetch(`http://localhost:9000/api/room/${roomId}`);
      if (!res.ok) throw new Error('Room not found');
      const data = await res.json();
      if (data.status === 'success') {
        setCurrentRoom(roomId);
        window.location.hash = `room/${roomId}`;
      } else {
        alert(data.message || 'Room not found');
        window.location.hash = '';
      }
    } catch (err) {
      alert('Failed to connect to server or room does not exist.');
      window.location.hash = '';
    }
  };

  const handleCreateRoom = async (type: 'image' | 'structured') => {
    if (!sessionId) return;
    try {
      const res = await fetch('http://localhost:9000/api/room/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hostId: sessionId, roomType: type })
      });
      const data = await res.json();
      if (data.status === 'success' && data.roomId) {
        setCurrentRoom(data.roomId);
        window.location.hash = `room/${data.roomId}`;
      } else {
        alert(data.message || 'Failed to create room');
      }
    } catch (err) {
      alert('Failed to connect to server. Ensure Backend is running.');
    }
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    window.location.hash = '';
  };

  if (!sessionId) return null; // Wait for identity

  return (
    <>
      {currentRoom && myName.trim() ? (
        <RoomDashboard roomId={currentRoom} sessionId={sessionId} myName={myName} onLeave={handleLeaveRoom} />
      ) : (
        <Home onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} myName={myName} onSetName={handleSetName} />
      )}
    </>
  );
}

export default App
