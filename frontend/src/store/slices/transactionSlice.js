import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionApi } from '../../api/transactionApi';

/**
 * Async Thunk: Fetch all ledger transactions from backend
 */
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (accountId, { rejectWithValue }) => {
    try {
      const data = await transactionApi.getTransactions(accountId);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load ledger history');
    }
  }
);

/**
 * Async Thunk: Execute transfer and record in ledger
 */
export const sendTransfer = createAsyncThunk(
  'transactions/sendTransfer',
  async (transferData, { rejectWithValue, dispatch }) => {
    try {
      const data = await transactionApi.transfer(transferData);
      return data;
    } catch (err) {
      // If the server refunded the amount due to an error, update state immediately
      if (err.data?.refunded) {
        if (err.data.transaction) {
          dispatch(transactionSlice.actions.addTransaction(err.data.transaction));
        }
        if (err.data.newBalance !== undefined) {
          dispatch({
            type: 'accounts/updateBalance',
            payload: {
              accountId: transferData.fromAccountId,
              newBalance: err.data.newBalance,
            },
          });
        }
      }
      return rejectWithValue(err.message || 'Transfer failed');
    }
  }
);

/**
 * Async Thunk: Deposit funds into account
 */
export const depositFunds = createAsyncThunk(
  'transactions/depositFunds',
  async (depositData, { rejectWithValue }) => {
    try {
      const data = await transactionApi.deposit(depositData);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Deposit failed');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    loading: false,
    actionLoading: false,
    error: null,
    searchQuery: '',
    typeFilter: 'ALL',
  },
  reducers: {
    addTransaction: (state, action) => {
      if (action.payload) {
        state.items.unshift(action.payload);
      }
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setTypeFilter: (state, action) => {
      state.typeFilter = action.payload;
    },
    clearTransactionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Transfer
      .addCase(sendTransfer.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(sendTransfer.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.transaction) {
          state.items.unshift(action.payload.transaction);
        }
      })
      .addCase(sendTransfer.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Deposit
      .addCase(depositFunds.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(depositFunds.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload?.transaction) {
          state.items.unshift(action.payload.transaction);
        }
      })
      .addCase(depositFunds.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { addTransaction, setSearchQuery, setTypeFilter, clearTransactionError } = transactionSlice.actions;
export default transactionSlice.reducer;
