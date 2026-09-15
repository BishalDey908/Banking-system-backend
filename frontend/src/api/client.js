import axios from 'axios';

/**
 * Pre-configured Axios instance for banking API calls.
 * Proxied via Vite to http://localhost:3000 in development.
 */
// Base URL is read from .env file (VITE_API_BASE_URL)
// If not set, it defaults to '/api' which Vite proxies to http://localhost:3000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Sends HTTP cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach stored token in Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aura_bank_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns a structured message, use it
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';
      
    // Handle unauthorized session expiration
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('aura_bank_token');
      localStorage.removeItem('aura_bank_user');
    }

    const err = new Error(message);
    err.data = error.response?.data;
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

export default apiClient;

