import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roomReducer from './slices/roomSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Useful for some WebSocket-related data or complex objects if needed
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
