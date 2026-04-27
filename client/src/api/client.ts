import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here for auth tokens if needed in the future
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors like 401, 500, etc.
    return Promise.reject(error);
  }
);

export default apiClient;
