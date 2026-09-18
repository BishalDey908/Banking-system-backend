import apiClient from './client';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Log in user with email & password
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Authenticate with Google
   * @param {Object} data - { credential, email, name }
   * @returns {Promise<{ user: Object, token: string, isNewUser?: boolean }>}
   */
  async googleAuth(data) {
    const response = await apiClient.post('/auth/google', data);
    return response.data;
  },

  /**
   * Fetch authenticated user's profile
   * @returns {Promise<{ user: Object }>}
   */
  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Log out user and invalidate cookie
   * @returns {Promise<{ message: string }>}
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch {
      // Return success anyway for client-side cleanup
      return { message: 'Logged out' };
    }
  },
};

