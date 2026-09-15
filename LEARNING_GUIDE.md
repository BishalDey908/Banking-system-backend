# 🏦 Full-Stack Banking System & Ledger: Complete Study Guide

Welcome! This guide explains how this banking application is built from the ground up. Whether you are studying how a real banking ledger works, learning Node.js/Express backend development, or mastering modern React + Redux state management, this document breaks down every concept simply and clearly.

---

## 📑 Table of Contents
1. [What is This Project?](#1-what-is-this-project)
2. [Core Banking Concepts Explained Simply](#2-core-banking-concepts-explained-simply)
   - [What is a Bank Account?](#what-is-a-bank-account)
   - [What is a Ledger (Book of Accounts)?](#what-is-a-ledger-book-of-accounts)
   - [Double-Entry Accounting (CREDIT vs DEBIT)](#double-entry-accounting-credit-vs-debit)
   - [Why `balanceAfter` Matters](#why-balanceafter-matters)
   - [Banking Invariants & Rules](#banking-invariants--rules)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [Backend Deep Dive (`/backend`)](#4-backend-deep-dive-backend)
   - [Data Models (MongoDB + Mongoose)](#data-models-mongodb--mongoose)
   - [API Endpoints Reference](#api-endpoints-reference)
   - [Authentication & Security Flow](#authentication--security-flow)
   - [How the Transaction Controller Works](#how-the-transaction-controller-works)
5. [Frontend Deep Dive (`/frontend`)](#5-frontend-deep-dive-frontend)
   - [Redux Toolkit State Architecture](#redux-toolkit-state-architecture)
   - [Cross-Slice Balance Synchronization](#cross-slice-balance-synchronization)
   - [Axios API Client & Interceptors](#axios-api-client--interceptors)
   - [Reusable UI Component Design](#reusable-ui-component-design)
   - [Dark Mode Implementation](#dark-mode-implementation)
6. [Step-by-Step Lifecycle: Sending Money](#6-step-by-step-lifecycle-sending-money)
7. [How to Run & Test Everything Locally](#7-how-to-run--test-everything-locally)
8. [Glossary of Terms](#8-glossary-of-terms)

---

## 1. What is This Project?

This is a full-stack digital banking system designed to simulate how modern retail banks and neo-banks operate:
- **Backend**: Built with **Node.js**, **Express.js**, and **MongoDB** (Mongoose). It handles user authentication, password hashing, bank account management, and financial transaction processing with an immutable audit ledger.
- **Frontend**: Built with **React 18**, **Vite**, **Redux Toolkit**, and **Tailwind CSS**. It provides a clean, responsive, dark-mode-ready interface for viewing balances, transferring money, making deposits, and reviewing bank statements.

```
+-------------------------------------------------------------+
|                     React 18 Frontend                       |
|  (Pages, Reusable Components, Redux Toolkit, Tailwind CSS)  |
+------------------------------+------------------------------+
                               |
                   HTTP / REST (JSON + JWT)
                               |
+------------------------------v------------------------------+
|                     Express.js Backend                      |
|  (Auth Middleware, Account Controller, Ledger Controller)   |
+------------------------------+------------------------------+
                               |
                       Mongoose ODM
                               |
+------------------------------v------------------------------+
|                      MongoDB Database                       |
|       (Users Collection, Accounts, Ledger Transactions)      |
+-------------------------------------------------------------+
```

---

## 2. Core Banking Concepts Explained Simply

### What is a Bank Account?
A bank account is a financial container owned by an authenticated user. It holds:
1. **Account ID**: A unique identifier.
2. **Currency**: The currency used (e.g. `INR`, `USD`).
3. **Current Balance**: The available amount of money you can spend.
4. **Status**: Can be `ACTIVE`, `FROZEN`, or `CLOSED`.

### What is a Ledger (Book of Accounts)?
In amateur coding projects, developers often just do:
```javascript
// ⚠️ THE WRONG WAY TO BUILD A BANK:
account.balance = account.balance - 500;
await account.save();
// Nothing else recorded!
```
If a customer calls the bank asking: *"Where did my 500 rupees go on Tuesday?"*, the bank would have no proof or history!

In a real bank, every movement of money is recorded in an **immutable ledger entry**.
- **Immutable** means once written, it **cannot be edited or deleted**.
- If a mistake happens, banks do not edit past records; they post a *reversing transaction*.

### Double-Entry Accounting (CREDIT vs DEBIT)
Every financial transaction classifies money movement:
- **`DEBIT` (Money Leaving)**: Deducts money from an account.
  *Example*: You buy groceries or transfer money to a friend. Your account is **debited**.
- **`CREDIT` (Money Entering)**: Adds money to an account.
  *Example*: Your employer pays your salary or you deposit cash. Your account is **credited**.

In our system:
When **Alice** transfers ₹2,000 to **Bob**:
1. Alice's account: **DEBIT** of ₹2,000 (`balance` drops by 2000).
2. Bob's account: **CREDIT** of ₹2,000 (`balance` increases by 2000).
Total money in the banking system stays constant!

### Why `balanceAfter` Matters
Every transaction in our `transactionModel` saves a field called `balanceAfter`:
```javascript
balanceAfter: account.balance
```
**Why do banks do this?**
- It records a **snapshot** of what the account balance was immediately after that specific transaction occurred.
- If an account has 10,000 transactions, the bank can verify that each entry's `balanceAfter` matches the math from the previous entry.
- It enables instant generation of bank statement PDFs showing running balances line-by-line without recalculating history from scratch.

### Automatic Refund on Error (Compensating Transactions)
What happens if the bank debits ₹2,500 from your account, but then a network error, database crash, or downstream payment gateway failure occurs before the recipient receives the funds?

In a naive application, the sender's money would vanish!
In a real banking architecture, our system implements **Compensating Rollbacks / Automatic Refunds**:
1. **Detect Failure**: If any step in `transferController` fails after deducting funds (`senderDeducted === true`), the `catch` block catches the error immediately.
2. **Reverse the Debit**: The system restores the exact deducted amount back to the sender's account (`senderAccount.balance += numAmount`).
3. **Roll Back Receiver**: If an internal receiver had already been credited, their balance is safely reversed.
4. **Log an Audit Refund**: An immutable `CREDIT` transaction entry is written to the ledger:
   ```javascript
   type: 'CREDIT',
   title: 'Refund: Transfer Failed',
   category: 'Refund',
   balanceAfter: senderAccount.balance,
   reference: 'REF-...'
   ```
5. **Halt Execution**: The rest of the process is stopped immediately, and an informative response is returned (`500 Transfer failed. Your deducted amount has been refunded to your account`).

### Banking Invariants & Rules
Our backend enforces these strict rules:
1. **Non-Negative Balance**: You cannot transfer more money than you have. `account.balance < amount` immediately rejects with `400 Insufficient Funds`.
2. **Positive Amounts Only**: Amounts must be positive numbers greater than 0 with at most 2 decimal places.
3. **No Self-Transfers**: You cannot transfer money from an account to the exact same account (`recipientAccount !== fromAccountId`).
4. **Account Ownership Check**: You can only withdraw or transfer money from accounts that belong to your authenticated user ID.
5. **Unique Reference Codes**: Every transaction gets a unique audit tracking code (e.g. `TRF-...`, `DEP-...`, `REF-...`).
6. **Automatic Failure Refund**: If any downstream error occurs after money is deducted, the amount is automatically refunded and the process is stopped.

---

## 3. System Architecture Overview

```
banking_backend/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/db.js      # MongoDB connection
│   │   ├── controllers/      # Business logic functions
│   │   │   ├── auth.controller.js
│   │   │   ├── account.controller.js
│   │   │   └── transaction.controller.js   # Ledger & transfers
│   │   ├── middleware/
│   │   │   └── auth.middleware.js         # JWT verification
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── user.model.js
│   │   │   ├── account.model.js
│   │   │   └── transaction.model.js       # Immutable ledger record
│   │   ├── routes/           # Express router definitions
│   │   │   ├── auth.routes.js
│   │   │   ├── account.routes.js
│   │   │   └── transaction.routes.js
│   │   └── app.js            # Express application setup (CORS, JSON)
│   ├── server.js             # HTTP server entry point (port 3000)
│   └── package.json
│
└── frontend/                 # React 18 + Vite Web App
    ├── src/
    │   ├── api/              # Axios API clients
    │   │   ├── client.js     # Axios instance with interceptors
    │   │   ├── authApi.js
    │   │   ├── accountApi.js
    │   │   └── transactionApi.js
    │   ├── components/
    │   │   ├── common/       # 100% reusable UI primitives
    │   │   │   ├── Button.jsx, Input.jsx, Card.jsx, Modal.jsx,
    │   │   │   ├── Badge.jsx, StatCard.jsx, Alert.jsx, Select.jsx, etc.
    │   │   ├── banking/      # Domain-specific components
    │   │   │   ├── TransferModal.jsx, DepositModal.jsx,
    │   │   │   ├── AccountList.jsx, TransactionTable.jsx, BankCard.jsx
    │   │   └── layout/       # AppLayout, Sidebar, Header
    │   ├── pages/            # View screens
    │   │   ├── auth/         # LoginPage, RegisterPage
    │   │   ├── dashboard/    # DashboardPage (KPIs, quick actions, recents)
    │   │   ├── transfers/    # TransfersPage (send money, quick amounts)
    │   │   ├── activity/     # ActivityPage (searchable ledger statement)
    │   │   └── accounts/     # AccountsPage (create & manage accounts)
    │   ├── store/            # Redux Toolkit
    │   │   ├── slices/       # authSlice, accountSlice, transactionSlice, uiSlice
    │   │   └── index.js
    │   ├── utils/            # formatters (currency, dates), validators
    │   └── App.jsx           # React Router route configuration
    ├── .env                  # Environment config (VITE_API_BASE_URL)
    └── package.json
```

---

## 4. Backend Deep Dive (`/backend`)

### Data Models (MongoDB + Mongoose)

#### 1. User Model (`models/user.model.js`)
Stores user identity:
- `name`: User's full name.
- `email`: Unique email address.
- `password`: Hashed with `bcryptjs` (never stored in plain text!).

#### 2. Account Model (`models/account.model.js`)
Represents a bank account:
- `user`: Reference (`ObjectId`) pointing to the owner `user`.
- `currency`: ISO code (defaults to `'INR'`).
- `status`: `'ACTIVE' | 'FROZEN' | 'CLOSED'`.
- `balance`: Current numerical balance (new accounts start with a 10,000 welcome credit for immediate testing).

#### 3. Transaction / Ledger Model (`models/transaction.model.js`)
Represents a permanent ledger entry:
```javascript
{
  account: ObjectId,          // Bank account ID
  user: ObjectId,             // Owner user ID
  type: 'CREDIT' | 'DEBIT',   // Direction of money flow
  amount: Number,             // Positive number (e.g. 500)
  currency: 'INR',
  balanceAfter: Number,       // Account balance right after this transaction
  title: String,              // e.g. "Transfer to Sarah", "Deposit"
  category: String,           // 'Transfer' | 'Deposit' | 'Income'
  status: 'COMPLETED',
  reference: 'TRF-1741528...',// Unique audit reference code
  recipientName: String,      // Name of receiver
  recipientAccount: String,   // Account number or UPI ID
  note: String,               // Optional memo
  createdAt: Date             // Timestamp recorded automatically
}
```

### API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token + cookie | No |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Yes |
| `POST` | `/api/auth/logout` | Clear auth cookie and session | Yes |
| `GET` | `/api/accounts` | List all accounts belonging to the user | Yes |
| `POST` | `/api/accounts` | Open a new bank account | Yes |
| `POST` | `/api/transactions/deposit` | Add funds to an account & record ledger entry | Yes |
| `POST` | `/api/transactions/transfer` | Send money to recipient & record DEBIT ledger entry | Yes |
| `GET` | `/api/transactions` | Fetch all ledger transactions for current user | Yes |
| `GET` | `/api/transactions/account/:id`| Fetch ledger transactions for one account | Yes |

### Authentication & Security Flow
1. When a user logs in, the backend signs a **JSON Web Token (JWT)** containing `{ _id: user._id }`.
2. The token is sent back in both an HTTP-Only cookie (`token`) and the response JSON body (`token`).
3. On subsequent requests, `middleware/auth.middleware.js` checks:
   ```javascript
   const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
   ```
4. If valid, `jwt.verify()` sets `req.user` with the database user record, making it available in all controllers.

### How the Transaction Controller Works

#### Deposit Controller (`depositController`):
1. Reads `accountId`, `amount`, and `note` from `req.body`.
2. Verifies `amount > 0` and checks that `req.user` owns the account.
3. Updates `account.balance = account.balance + amount`.
4. Saves an immutable ledger entry with `type: 'CREDIT'` and `balanceAfter: account.balance`.

#### Transfer Controller (`transferController`):
1. Reads `fromAccountId`, `recipientName`, `recipientAccount`, and `amount`.
2. Validates sender ownership and ensures account is `ACTIVE`.
3. **Crucial Check**: `if (senderAccount.balance < amount)` $\rightarrow$ rejects with `400 Insufficient Funds`.
4. Deducts amount: `senderAccount.balance = senderAccount.balance - amount`.
5. Writes a `DEBIT` ledger record for the sender.
6. **Internal Double-Entry Check**: If `recipientAccount` matches another account ID inside our MongoDB database, it automatically credits that account and writes a complementary `CREDIT` record for the receiver!

---

## 5. Frontend Deep Dive (`/frontend`)

### Redux Toolkit State Architecture
The frontend uses Redux Toolkit (`@reduxjs/toolkit`) for global, predictable state:
- **`authSlice`**: Stores `{ user, token, isAuthenticated, loading, error }`. Hydrates automatically from `localStorage` on page refresh.
- **`accountSlice`**: Stores `{ accounts, activeAccountId, loading, createLoading }`. Keeps track of which account is currently active.
- **`transactionSlice`**: Stores `{ items, loading, actionLoading, error, searchQuery, typeFilter }`. Holds the ledger records.
- **`uiSlice`**: Stores UI state like `{ darkMode, modals: { transfer, deposit, createAccount }, toasts }`.

### Cross-Slice Balance Synchronization
When you send money, `transactionSlice` runs the `sendTransfer` async thunk. But how does `accountSlice` know that the account's balance changed?

In Redux Toolkit, slices can listen to actions from other slices using `extraReducers`:
```javascript
// In accountSlice.js:
builder.addCase('transactions/sendTransfer/fulfilled', (state, action) => {
  const tx = action.payload?.transaction;
  const newBalance = action.payload?.newBalance;
  if (tx && newBalance !== undefined) {
    const acc = state.accounts.find((a) => a._id === tx.account);
    if (acc) {
      acc.balance = newBalance; // Balance updates across the entire app instantly!
    }
  }
});
```
This guarantees that when money is sent:
1. The **Account Card** on the Dashboard updates its balance.
2. The **KPI Stat Card** ("Total Balance") updates.
3. The **Recent Transactions Table** receives the new row at index 0.
All without needing a full page reload!

### Axios API Client & Interceptors
In `frontend/src/api/client.js`:
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` from `localStorage` to every outgoing request.
- **Response Interceptor**: Catches HTTP errors and extracts the backend's friendly error message (e.g. *"Insufficient funds"*). If a `401 Unauthorized` occurs, it automatically clears the expired session.

### Reusable UI Component Design
All components in `frontend/src/components/common/` are built to be reusable, modular, and configurable via props:

| Component | Props | Purpose |
|---|---|---|
| `<Button>` | `variant` ('primary'/'secondary'/'danger'/'ghost'), `size`, `loading`, `icon` | Standardized button with loading spinners |
| `<Input>` | `label`, `error`, `helperText`, `leftIcon`, `rightIcon` | Accessible form input with dark mode support |
| `<Card>` | `variant` ('default'/'glass'/'interactive'), `padding` | Rounded container with subtle borders |
| `<Modal>` | `isOpen`, `onClose`, `title`, `description`, `size` | Accessible dialog with Escape key and backdrop close |
| `<Badge>` | `variant` ('success'/'danger'/'info'/'warning'), `dot` | Status badges (e.g. COMPLETED, DEBIT) |
| `<StatCard>` | `title`, `value`, `subtitle`, `icon`, `trend` | KPI metric cards |
| `<Select>` | `label`, `options`, `value`, `onChange`, `error` | Dropdown selector |

### Dark Mode Implementation
- Dark mode is managed in `uiSlice.js`.
- The user's preference is saved in `localStorage.getItem('aura_bank_theme')`.
- When toggled, it toggles the `dark` class on the `<html>` root element.
- Tailwind's `dark:` classes handle styling automatically (e.g. `bg-white dark:bg-slate-900`).
- An inline script in `index.html` checks `localStorage` before the page paints, preventing any white screen flicker on page reload.

---

## 6. Step-by-Step Lifecycle: Sending Money

Here is the complete journey of a transfer:

```
[User clicks "Send Money"]
        |
        v
[TransfersPage / TransferModal validates input]
(Checks: recipient entered? amount > 0?)
        |
        v
[Redux dispatches sendTransfer(payload)]
        |
        v
[Axios POST /api/transactions/transfer]
(Bearer Token attached in headers)
        |
        v
[Express Auth Middleware]
(Verifies JWT, finds user in MongoDB)
        |
        v
[Transaction Controller executes logic]
1. Finds sender account in DB
2. Checks account is ACTIVE
3. Checks sender.balance >= amount
4. Deducts: sender.balance -= amount
5. Writes DEBIT ledger record with balanceAfter snapshot
6. If internal receiver: credits receiver.balance += amount
        |
        v
[Backend responds: 200 OK + updated balance + transaction record]
        |
        v
[Redux extraReducers update state]
1. transactionSlice unshifts transaction to ledger list
2. accountSlice updates active account balance
        |
        v
[React re-renders UI components]
1. Success Toast displays: "Sent ₹500 to Rahul"
2. Dashboard balance updates immediately
3. Activity table shows new transaction at top
```

---

## 7. How to Run & Test Everything Locally

### Step 1: Start the Backend
1. Open a terminal in `d:\backend\banking_backend\backend`:
   ```bash
   cd backend
   npm install
   node server.js
   ```
2. The server starts on `http://localhost:3000` and connects to MongoDB.

### Step 2: Start the Frontend
1. Open a second terminal in `d:\backend\banking_backend\frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser to `http://localhost:5173`.

### Step 3: Run a Hands-On Test
1. **Register**: Click *"Create an account"*, enter your Name, Email, and Password.
2. **First Account**: You are redirected to the Dashboard. You will see your default bank account with an initial **₹10,000** test balance.
3. **Deposit Funds**:
   - Click the **"Deposit"** button.
   - Enter `2500` and click *"Confirm Deposit"*.
   - Watch the balance instantly increase to **₹12,500**.
4. **Send Money**:
   - Click **"Send Money"** in the sidebar or quick actions.
   - Enter Recipient Name (e.g. `Rahul Sharma`), Account Number or UPI ID (e.g. `rahul@upi`), and Amount (`1500`).
   - Click *"Send Money"*.
   - The balance drops to **₹11,000**, and a success notification pops up.
5. **Inspect the Ledger**:
   - Go to the **"Activity"** tab.
   - You will see the complete ledger with timestamps, Reference numbers (`DEP-...`, `TRF-...`), running `balanceAfter`, and `CREDIT`/`DEBIT` badges.
6. **Try Dark Mode**:
   - Click the Sun/Moon icon in the top navigation bar to toggle between Light and Dark themes.

---

## 8. Glossary of Terms

- **Ledger**: An append-only historical log of financial movements.
- **Double-Entry**: A system where every transfer has a corresponding debit from one party and credit to another.
- **DEBIT**: Money going out from an account (-).
- **CREDIT**: Money coming in to an account (+).
- **Audit Trail**: Step-by-step history showing how an account arrived at its current balance.
- **Invariants**: Business rules that must never be broken (e.g. balance cannot become negative).
- **Redux Slice**: A piece of global application state combined with the functions that can change it.
- **Async Thunk**: A Redux Toolkit pattern for making asynchronous API calls and updating state based on the result.
- **JWT (JSON Web Token)**: A digitally signed piece of data used to verify user identity securely without querying the database for session status every time.

