import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from './errorHandler';
import { log, error } from './logger';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Request interceptor for tokens
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    log(`API ${config.method.toUpperCase()} -> ${config.url}`);
    return config;
  },
  (err) => {
    error('Request failed before sending', err);
    return Promise.reject(err);
  }
);

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    log(`API RESPONSE [${response.status}] <- ${response.config.url}`);
    return response;
  },
  (err) => {
    const status = err.response?.status;
    const readableError = handleApiError(err);
    
    error(`API ERROR [${status}] <- ${err.config?.url}: ${readableError}`, err);

    if (status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    
    // Attach readable message for components to use directly
    err.readableMessage = readableError;
    return Promise.reject(err);
  }
);

export default api;
