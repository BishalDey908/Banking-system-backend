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
    isSidebarCollapsed: false,
    toasts: [],
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
  },
});

export const {
  toggleDarkMode,
  setCreateAccountModalOpen,
  setTransferModalOpen,
  setDepositModalOpen,
  toggleSidebar,
  setSidebarCollapsed,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
