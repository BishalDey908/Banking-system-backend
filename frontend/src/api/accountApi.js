import apiClient from './client';

/**
 * Bank Accounts API Service
 */
export const accountApi = {
  /**
   * Fetch all bank accounts for the logged-in user
   * @returns {Promise<Array<Object>>}
   */
  async getAccounts() {
    const response = await apiClient.get('/accounts');
    return response.data;
  },

  /**
   * Create a new bank account
   * @param {Object} [payload] - { currency: 'INR' }
   * @returns {Promise<Object>} Created account object
   */
  async createAccount(payload = { currency: 'INR' }) {
    const response = await apiClient.post('/accounts/create', payload);
    return response.data;
  },
};

