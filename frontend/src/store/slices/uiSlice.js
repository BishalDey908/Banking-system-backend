import { createSlice } from '@reduxjs/toolkit';

// Check saved theme or system preference
const savedTheme = localStorage.getItem('aura_bank_theme');
const initialDarkMode = savedTheme === 'dark';

// Ensure HTML element class matches initial state
if (initialDarkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: initialDarkMode,
    isCreateAccountModalOpen: false,
    isTransferModalOpen: false,
    isDepositModalOpen: false,
    isQrScannerModalOpen: false,
    qrScannedData: null,
    isReceiveQrModalOpen: false,
    receiveQrAccountId: null,
    isSidebarCollapsed: false,
    toasts: [],
    rateLimit: {
      isRateLimited: false,
      message: '',
      retryAfterSeconds: 0,
      resetTime: null,
    },
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('aura_bank_theme', state.darkMode ? 'dark' : 'light');
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setCreateAccountModalOpen: (state, action) => {
      state.isCreateAccountModalOpen = action.payload;
    },
    setTransferModalOpen: (state, action) => {
      state.isTransferModalOpen = action.payload;
    },
    setDepositModalOpen: (state, action) => {
      state.isDepositModalOpen = action.payload;
    },
    setQrScannerModalOpen: (state, action) => {
      state.isQrScannerModalOpen = action.payload;
    },
    setQrScannedData: (state, action) => {
      state.qrScannedData = action.payload;
    },
    setReceiveQrModalOpen: (state, action) => {
      state.isReceiveQrModalOpen = action.payload;
    },
    setReceiveQrAccountId: (state, action) => {
      state.receiveQrAccountId = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.isSidebarCollapsed = action.payload;
    },
    addToast: (state, action) => {
      const { message, type = 'info', duration = 4000 } = action.payload;
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      state.toasts.push({ id, message, type, duration });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    setRateLimited: (state, action) => {
      const { message, retryAfterSeconds } = action.payload || {};
      const duration = retryAfterSeconds && retryAfterSeconds > 0 ? Number(retryAfterSeconds) : 60;
      state.rateLimit = {
        isRateLimited: true,
        message: message || 'You have exceeded the rate limit. Please wait before trying again.',
        retryAfterSeconds: duration,
        resetTime: Date.now() + duration * 1000,
      };
    },
    clearRateLimit: (state) => {
      state.rateLimit = {
        isRateLimited: false,
        message: '',
        retryAfterSeconds: 0,
        resetTime: null,
      };
    },
  },
});

export const {
  toggleDarkMode,
  setCreateAccountModalOpen,
  setTransferModalOpen,
  setDepositModalOpen,
  setQrScannerModalOpen,
  setQrScannedData,
  setReceiveQrModalOpen,
  setReceiveQrAccountId,
  toggleSidebar,
  setSidebarCollapsed,
  addToast,
  removeToast,
  setRateLimited,
  clearRateLimit,
} = uiSlice.actions;

export default uiSlice.reducer;
