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

// Rate limit lockout tracker
let rateLimitExpiry = 0;

export const isClientRateLimited = () => Date.now() < rateLimitExpiry;
export const getRateLimitRemainingSeconds = () => Math.max(0, Math.ceil((rateLimitExpiry - Date.now()) / 1000));
export const clearClientRateLimit = () => {
  rateLimitExpiry = 0;
};

// Request Interceptor: Attach stored token and block requests if rate-limited
apiClient.interceptors.request.use(
  (config) => {
    // If rate limit is currently active, prevent extra requests from flooding the server
    if (isClientRateLimited() && !config.skipRateLimitCheck) {
      const remaining = getRateLimitRemainingSeconds();
      const err = new Error(`Rate limit active. Please wait ${remaining}s before retrying.`);
      err.status = 429;
      err.retryAfterSeconds = remaining;
      return Promise.reject(err);
    }

    const token = localStorage.getItem('aura_bank_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error messages & detect 429 Rate Limit
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Rate Limiting (HTTP 429 Too Many Requests)
    if (error.response?.status === 429) {
      const retrySec =
        error.response.data?.retryAfterSeconds ||
        parseInt(error.response.headers?.['retry-after'], 10) ||
        60;

      const message =
        error.response.data?.message ||
        'Rate limit reached. All actions are temporarily disabled.';

      rateLimitExpiry = Date.now() + retrySec * 1000;

      // Dispatch global window event so React / Redux disables components across the frontend
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('app:rate-limit-triggered', {
            detail: {
              message,
              retryAfterSeconds: retrySec,
            },
          })
        );
      }
    }

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

