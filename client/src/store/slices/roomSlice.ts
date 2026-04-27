import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IRoom, IRoomState } from '../../types/room.types';

const initialState: IRoomState = {
  currentRoom: null,
  isLoading: false,
  error: null,
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoom: (state, action: PayloadAction<IRoom>) => {
      state.currentRoom = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateRoom: (state, action: PayloadAction<Partial<IRoom>>) => {
      if (state.currentRoom) {
        state.currentRoom = { ...state.currentRoom, ...action.payload };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearRoom: (state) => {
      state.currentRoom = null;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const { setRoom, updateRoom, setLoading, setError, clearRoom } = roomSlice.actions;
export default roomSlice.reducer;
