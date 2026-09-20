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

  /**
   * Send email verification OTP for registration
   * @param {Object} userData - { name, email, password }
   */
  async sendRegisterOtp(userData) {
    const response = await apiClient.post('/auth/register/send-otp', userData);
    return response.data;
  },

  /**
   * Verify registration OTP and create account
   * @param {Object} data - { name, email, password, otp }
   */
  async verifyRegisterOtp(data) {
    const response = await apiClient.post('/auth/register/verify-otp', data);
    return response.data;
  },

  /**
   * Send passwordless login OTP
   * @param {string} email
   */
  async sendLoginOtp(email) {
    const response = await apiClient.post('/auth/login/send-otp', { email });
    return response.data;
  },

  /**
   * Verify passwordless login OTP
   * @param {Object} data - { email, otp }
   */
  async verifyLoginOtp(data) {
    const response = await apiClient.post('/auth/login/verify-otp', data);
    return response.data;
  },

  /**
   * Verify 2FA OTP for pending password login
   * @param {Object} data - { tempToken, otp }
   */
  async verify2fa(data) {
    const response = await apiClient.post('/auth/login/verify-2fa', data);
    return response.data;
  },

  /**
   * Toggle 2FA status for authenticated user
   * @param {boolean} enable
   */
  async toggle2fa(enable) {
    const response = await apiClient.post('/auth/2fa/toggle', { enable });
    return response.data;
  },

  /**
   * Send password reset OTP
   * @param {string} email
   */
  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Verify reset OTP and set new password
   * @param {Object} data - { email, otp, newPassword }
   */
  async resetPassword(data) {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },
};

