import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const DEFAULT_PROD_URL = 'https://skillswap-gyjl.onrender.com/api';

  let base = envUrl && envUrl.trim() ? envUrl.trim() : DEFAULT_PROD_URL;

  if ((import.meta.env.PROD || import.meta.env.MODE === 'production') && !base.startsWith('http://') && !base.startsWith('https://')) {
    base = DEFAULT_PROD_URL;
  }

  base = base.replace(/\/+$/, '');

  if ((base.startsWith('http://') || base.startsWith('https://')) && !base.endsWith('/api') && !base.includes('/api/')) {
    base = `${base}/api`;
  }

  return base;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true
});

// Interceptor to attach Authorization header if token exists in localStorage
api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '');
  }
  const token = localStorage.getItem('skillswap_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
