import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { accountApi } from '../../api/accountApi';

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await accountApi.getAccounts();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch accounts');
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (payload = { currency: 'INR' }, { rejectWithValue }) => {
    try {
      const data = await accountApi.createAccount(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create account');
    }
  }
);

const accountSlice = createSlice({
  name: 'accounts',
  initialState: {
    accounts: [],
    activeAccountId: null,
    loading: false,
    createLoading: false,
    error: null,
  },
  reducers: {
    setActiveAccount: (state, action) => {
      state.activeAccountId = action.payload;
    },
    updateBalance: (state, action) => {
      const { accountId, newBalance } = action.payload || {};
      const acc = state.accounts.find((a) => a._id === accountId);
      if (acc && typeof newBalance === 'number') {
        acc.balance = newBalance;
      }
    },
    clearAccountError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = Array.isArray(action.payload) ? action.payload : [];
        if (state.accounts.length > 0 && !state.activeAccountId) {
          state.activeAccountId = state.accounts[0]._id;
        }
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create account
      .addCase(createAccount.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.createLoading = false;
        state.accounts.unshift(action.payload);
        state.activeAccountId = action.payload._id;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Sync balance when a transfer completes
      .addCase('transactions/sendTransfer/fulfilled', (state, action) => {
        const tx = action.payload?.transaction;
        const newBalance = action.payload?.newBalance;
        if (tx && newBalance !== undefined && newBalance !== null) {
          const accountId = tx.account?._id || tx.account;
          const acc = state.accounts.find((a) => a._id === accountId);
          if (acc) {
            acc.balance = Math.round((Number(newBalance) + Number.EPSILON) * 100) / 100;
          }
        }
      })
      // Sync balance when a deposit completes
      .addCase('transactions/depositFunds/fulfilled', (state, action) => {
        const tx = action.payload?.transaction;
        const newBalance = action.payload?.newBalance;
        if (tx && newBalance !== undefined && newBalance !== null) {
          const accountId = tx.account?._id || tx.account;
          const acc = state.accounts.find((a) => a._id === accountId);
          if (acc) {
            acc.balance = Math.round((Number(newBalance) + Number.EPSILON) * 100) / 100;
          }
        }
      });
  },
});

export const { setActiveAccount, updateBalance, clearAccountError } = accountSlice.actions;
export default accountSlice.reducer;

