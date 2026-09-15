# Aura Financial — Modern Minimalist Banking Frontend

A modern, minimalist, high-performance banking web application built with **React 18**, **Vite**, **Redux Toolkit**, **Tailwind CSS**, and **Lucide Icons**. Designed with a restrained Swiss/Nordic fintech aesthetic, featuring tabular financial typography, micro-interactions, deterministic virtual debit cards, and full integration with the Node.js/Express banking backend.

---

## 🏛️ Architecture Overview

```
frontend/
├── src/
│   ├── api/                     # Backend API Services
│   │   ├── client.js            # Axios client with auto Bearer token interceptor & error standardization
│   │   ├── authApi.js           # /api/auth endpoints (register, login, me, logout)
│   │   └── accountApi.js        # /api/accounts endpoints (getAccounts, createAccount)
│   ├── components/
│   │   ├── common/              # 100% Reusable UI Library (fully prop-customizable)
│   │   │   ├── Button.jsx       # Variants: primary, secondary, outline, ghost, danger, subtle
│   │   │   ├── Input.jsx        # Labels, error states, built-in password reveal toggle
│   │   │   ├── Badge.jsx        # Status pills (ACTIVE, FROZEN, CLOSED), currency badges
│   │   │   ├── Card.jsx         # Surface variants: default, elevated, outlined, glass, dark
│   │   │   ├── Modal.jsx        # Accessible dialog with ESC key and backdrop lock
│   │   │   ├── Select.jsx       # Standard custom dropdown
│   │   │   ├── StatCard.jsx     # Financial metrics card with trend indicators
│   │   │   ├── Avatar.jsx       # Initials derivation and online status dot
│   │   │   ├── Alert.jsx        # Informational and error banners
│   │   │   ├── ToastContainer.jsx# Non-intrusive floating toast notifications
│   │   │   ├── Skeleton.jsx     # Shimmer placeholders
│   │   │   └── EmptyState.jsx   # Empty states with call-to-actions
│   │   ├── banking/             # Banking Domain Components
│   │   │   ├── BankCard.jsx     # Virtual debit card with EMV chip, cardholder name, CVV flip & copy
│   │   │   ├── AccountList.jsx  # Bank accounts switcher with RBI verification badges
│   │   │   ├── QuickActions.jsx # Action bar for opening accounts, transfers, CSV export
│   │   │   ├── CreateAccountModal.jsx # Account creation dialog connected to Redux
│   │   │   ├── TransferModal.jsx# IMPS/NEFT/RTGS wire transfer form with validation
│   │   │   └── TransactionTable.jsx # Financial ledger with search, category filtering & CSV export
│   │   └── layout/              # Application Shell
│   │       ├── AppLayout.jsx    # Persistent layout with sidebar, header, and toast bus
│   │       ├── Sidebar.jsx      # Fintech desktop & responsive mobile drawer navigation
│   │       ├── Header.jsx       # Top navigation, active account switcher, notifications
│   │       └── ProtectedRoute.jsx# Auth route guard redirecting unauthenticated users
│   ├── hooks/
│   │   ├── useAuth.js           # Authentication dispatchers and state selectors
│   │   └── useToast.js          # Fast toast dispatch helper
│   ├── store/
│   │   ├── index.js             # Redux root store
│   │   └── slices/
│   │       ├── authSlice.js     # User session, JWT tokens, persistent login
│   │       ├── accountSlice.js  # Accounts list, active account, createAccount thunk
│   │       ├── transactionSlice.js # Ledger state, simulated transfers, filter controls
│   │       └── uiSlice.js       # Modal toggles and toast stack
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx    # Clean login view with quick demo credential filler
│   │   │   └── RegisterPage.jsx # Sign-up view with dynamic password strength meter
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx# Core overview: balance, virtual card, recent activity
│   │   ├── accounts/
│   │   │   └── AccountsPage.jsx # Accounts management, status filters, card inspector
│   │   ├── transfers/
│   │   │   └── TransfersPage.jsx# Instant transfers, quick amount chips, settlement rails
│   │   ├── activity/
│   │   │   └── ActivityPage.jsx # Full searchable ledger with CSV statement download
│   │   ├── settings/
│   │   │   └── SettingsPage.jsx # User profile, JWT session info, security settings
│   │   └── NotFoundPage.jsx     # 404 error page
│   ├── utils/
│   │   ├── formatters.js        # formatCurrency (₹ INR), formatDate, maskAccountNumber, deriveCardNumber
│   │   ├── validators.js        # Email RFC pattern, password strength, amount limits
│   │   └── cn.js                # Tailwind class merger
│   ├── App.jsx                  # Main React Router setup
│   ├── main.jsx                 # Redux Provider mounting
│   └── index.css                # Tailwind directives, custom scrollbars, tabular nums
├── index.html
├── vite.config.js               # Dev server port 5173 with proxy to backend port 3000
└── tailwind.config.js           # Custom banking color palette & typography
```

---

## 🚀 How to Run

### 1. Start Backend
In a terminal, navigate to `/backend` and start the server:
```bash
cd backend
npm run dev
# Server listens on port 3000 and connects to MongoDB
```

### 2. Start Frontend
In another terminal, navigate to `/frontend` and launch Vite:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser. All API requests made to `/api/*` are automatically proxied to `http://localhost:3000/*` with CORS and cookies handled seamlessly.

---

## 🎨 Reusable Component Library & Prop Customization

Every component in `src/components/common` is thoroughly documented with JSDoc comments and accepts customizable props:

| Component | Key Props | Description |
|---|---|---|
| `Button` | `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`, `disabled` | Multi-style button with built-in spinner |
| `Input` | `label`, `error`, `helperText`, `leftIcon`, `rightElement`, `type`, `variant` | Form input with built-in password reveal eye toggle |
| `Badge` | `variant`, `size`, `dot`, `dotPulse` | Status pill for ACTIVE / FROZEN / CLOSED and currencies |
| `Card` | `variant`, `padding`, `header`, `footer`, `hoverable`, `onClick` | Modular card container with slot support |
| `Modal` | `isOpen`, `onClose`, `title`, `description`, `size`, `footerContent` | Accessible animated modal with Escape key binding |
| `Select` | `label`, `options`, `value`, `onChange`, `leftIcon`, `error` | Dropdown component for account & currency selection |
| `StatCard` | `label`, `value`, `prefix`, `suffix`, `change`, `changeType`, `icon` | Financial KPI card with positive/negative trend pills |
| `BankCard` | `accountId`, `cardholderName`, `currency`, `theme` | Interactive virtual debit card with EMV chip & CVV toggle |
| `TransactionTable` | `transactions`, `showFilters`, `limit` | Tabular financial ledger with live search & CSV export |

---

## ⚡ Redux Toolkit State Flow

1. **Authentication (`authSlice`)**:
   - Stores `user`, `token`, `isAuthenticated`, `loading`, `error`.
   - Hydrates session automatically from `localStorage` and validates with `GET /api/auth/me`.
   - `loginUser` and `registerUser` async thunks handle token injection into Axios and cookie storage.

2. **Accounts (`accountSlice`)**:
   - `fetchAccounts` loads all accounts for the authenticated user from `GET /api/accounts`.
   - `createAccount` issues `POST /api/accounts` and updates the active account immediately.
   - Automatically synchronizes account balance when a transfer or deposit succeeds via `extraReducers`.

3. **Transactions & Ledger (`transactionSlice`)**:
   - Real backend-backed ledger tracking with `CREDIT` and `DEBIT` entries.
   - `sendTransfer` executes real money transfers with recipient account/UPI, deducting sender balance.
   - `depositFunds` deposits test/real funds with instant balance snapshot (`balanceAfter`).
   - Supports searching by description/reference and filtering by type (`CREDIT` / `DEBIT`).

4. **UI State (`uiSlice`)**:
   - Full **Dark Mode** toggle persisted in `localStorage` (`aura_bank_theme`).
   - Global modal toggles (`transfer`, `deposit`, `createAccount`).
   - Notification bus (`addToast`, `removeToast`) with auto-dismiss timers.

---

## 📚 Complete Study & Learning Guide

For a thorough, step-by-step walkthrough of:
- How real banking systems and ledgers work (immutability, double-entry, `balanceAfter`)
- The full backend and frontend architecture
- Step-by-step lifecycle of sending money
- How to study and test the codebase

👉 Please read **[`LEARNING_GUIDE.md`](../LEARNING_GUIDE.md)** at the root of the project!


