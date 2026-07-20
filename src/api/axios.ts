import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

const api = axios.create({
  baseURL: baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`,
  headers: {
    'X-Client-Id': import.meta.env.VITE_API_CLIENT_ID,
    'X-Client-Secret': import.meta.env.VITE_API_CLIENT_SECRET,
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const playValidationSound = () => {
  const audio = new Audio('/sounds/fahhhhhhhhhhhhhh.mp3');
  audio.volume = 0.6;
  audio.play().catch((err) => {
    console.warn('Play validation sound failed:', err);
  });
};

api.interceptors.response.use(
  (response) => {
    // Show toast if there's a custom message from backend mutations
    if (response.config.method !== 'get' && response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 400) {
      playValidationSound();
    }
    const message = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
