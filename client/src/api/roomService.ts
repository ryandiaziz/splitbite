import apiClient from './client';

export const roomService = {
  getRoom: async (roomId: string) => {
    const res = await apiClient.get(`/api/room/${roomId}`);
    return res.data;
  },

  createRoom: async (hostId: string, roomType: 'image' | 'structured') => {
    const res = await apiClient.post('/api/room/create', { hostId, roomType });
    return res.data;
  },
};
