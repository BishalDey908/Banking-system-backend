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
      });
  },
});

export const { setActiveAccount, clearAccountError } = accountSlice.actions;
export default accountSlice.reducer;

