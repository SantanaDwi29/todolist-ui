import axios from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

const api = axios.create({
  baseURL: baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Show toast if there's a custom message from backend mutations
    if (response.config.method !== 'get' && response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
