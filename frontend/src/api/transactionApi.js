import apiClient from './client';

/**
 * ============================================================================
 * TRANSACTION API SERVICE
 * Communicates with the Express backend /api/transactions endpoints.
 * ============================================================================
 */
export const transactionApi = {
  /**
   * Fetch all ledger transactions for the current user (or filtered by account)
   * @param {string} [accountId] - Optional specific account filter
   * @returns {Promise<Array<Object>>}
   */
  async getTransactions(accountId) {
    const url = accountId ? `/transactions/account/${accountId}` : '/transactions';
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Send money from sender account to a recipient
   * @param {Object} data - { fromAccountId, recipientName, recipientAccount, amount, note }
   * @returns {Promise<Object>} { message, newBalance, transaction }
   */
  async transfer(data) {
    const response = await apiClient.post('/transactions/transfer', data);
    return response.data;
  },

  /**
   * Deposit money into a bank account
   * @param {Object} data - { accountId, amount, note }
   * @returns {Promise<Object>} { message, newBalance, transaction }
   */
  async deposit(data) {
    const response = await apiClient.post('/transactions/deposit', data);
    return response.data;
  },
};

export default transactionApi;

