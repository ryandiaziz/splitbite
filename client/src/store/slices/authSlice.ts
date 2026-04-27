import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  sessionId: string | null;
  myName: string;
}

const getInitialName = () => localStorage.getItem('splitbite_name') || '';
const getInitialSession = () => localStorage.getItem('splitbite_session') || '';

const initialState: AuthState = {
  sessionId: getInitialSession() || null,
  myName: getInitialName(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
      localStorage.setItem('splitbite_session', action.payload);
    },
    setMyName: (state, action: PayloadAction<string>) => {
      state.myName = action.payload;
      localStorage.setItem('splitbite_name', action.payload);
    },
    logout: (state) => {
      state.sessionId = null;
      state.myName = '';
      localStorage.removeItem('splitbite_session');
      localStorage.removeItem('splitbite_name');
    },
  },
});

export const { setSessionId, setMyName, logout } = authSlice.actions;
export default authSlice.reducer;
