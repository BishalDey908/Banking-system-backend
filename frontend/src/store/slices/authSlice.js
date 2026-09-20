import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

// Initial state hydrated from localStorage for persistence across reloads
const storedToken = localStorage.getItem('aura_bank_token');
let storedUser = null;
try {
  storedUser = JSON.parse(localStorage.getItem('aura_bank_user') || 'null');
} catch {
  storedUser = null;
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      if (data.twoFactorRequired) {
        return data;
      }
      if (data.token) {
        localStorage.setItem('aura_bank_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('aura_bank_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const loginWithOtp = createAsyncThunk(
  'auth/loginWithOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const data = await authApi.verifyLoginOtp({ email, otp });
      if (data.token) {
        localStorage.setItem('aura_bank_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('aura_bank_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'OTP login failed');
    }
  }
);

export const verify2FA = createAsyncThunk(
  'auth/verify2FA',
  async ({ tempToken, otp }, { rejectWithValue }) => {
    try {
      const data = await authApi.verify2fa({ tempToken, otp });
      if (data.token) {
        localStorage.setItem('aura_bank_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('aura_bank_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || '2FA verification failed');
    }
  }
);

export const toggle2FA = createAsyncThunk(
  'auth/toggle2FA',
  async (enable, { rejectWithValue }) => {
    try {
      const data = await authApi.toggle2fa(enable);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update 2FA');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authApi.register(userData);
      if (data.token) {
        localStorage.setItem('aura_bank_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('aura_bank_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleData, { rejectWithValue }) => {
    try {
      const data = await authApi.googleAuth(googleData);
      if (data.token) {
        localStorage.setItem('aura_bank_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('aura_bank_user', JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Google sign-in failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getMe();
      if (data.user) {
        localStorage.setItem('aura_bank_user', JSON.stringify(data.user));
      }
      return data.user;
    } catch (err) {
      localStorage.removeItem('aura_bank_token');
      localStorage.removeItem('aura_bank_user');
      return rejectWithValue(err.message || 'Session expired');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    await authApi.logout();
    localStorage.removeItem('aura_bank_token');
    localStorage.removeItem('aura_bank_user');
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken,
    isAuthenticated: Boolean(storedToken),
    twoFactorPending: null, // { required: boolean, tempToken: string, email: string }
    loading: false,
    error: null,
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    clearTwoFactorPending: (state) => {
      state.twoFactorPending = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with password
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.twoFactorRequired) {
          state.twoFactorPending = action.payload;
          state.isAuthenticated = false;
          state.error = null;
        } else {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.twoFactorPending = null;
          state.error = null;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login with OTP
      .addCase(loginWithOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.twoFactorPending = null;
        state.error = null;
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify 2FA
      .addCase(verify2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.twoFactorPending = null;
        state.error = null;
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle 2FA
      .addCase(toggle2FA.fulfilled, (state, action) => {
        if (state.user) {
          state.user.isTwoFactorEnabled = action.payload.isTwoFactorEnabled;
          localStorage.setItem('aura_bank_user', JSON.stringify(state.user));
        }
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearAuthError, clearTwoFactorPending } = authSlice.actions;
export default authSlice.reducer;

