import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Home } from './pages/Home';
import { RoomDashboard } from './pages/RoomDashboard';
import { setSessionId } from './store/slices/authSlice';
import { RootState } from './store';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessionId } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    let sid = localStorage.getItem('splitbite_session');
    if (!sid) {
      sid = "user_" + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('splitbite_session', sid);
    }
    dispatch(setSessionId(sid));
  }, [dispatch]);

  // Handle legacy hash routing or direct navigation checks
  useEffect(() => {
    if (window.location.hash.startsWith('#room/')) {
      const roomId = window.location.hash.replace('#room/', '');
      window.location.hash = ''; // Clear hash
      navigate(`/room/${roomId}`);
    }
  }, [navigate]);

  if (!sessionId) return null; // Wait for identity

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<RoomDashboard />} />
    </Routes>
  );
}

export default App;
