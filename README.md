# 🏦 Aura Bank — Modern Banking System with Transaction Ledger

A full-stack banking web application featuring a Node.js/Express backend, MongoDB database, and a React 18 + Redux Toolkit + Tailwind CSS frontend.

---

## 🌟 Key Features
- **Account Management**: Create and manage bank accounts (default initial balance of ₹10,000 for instant testing).
- **Banking Ledger & Double-Entry Accounting**:
  - Every deposit and transfer is recorded as an **immutable ledger entry** with `CREDIT` / `DEBIT` types.
  - Snapshot running `balanceAfter` stored with each entry for accurate audit trails.
  - Internal transfers between bank accounts automatically perform double-entry updates.
- **Transfers & Deposits**:
  - Instant money transfers to any account number or UPI ID with insufficient fund protection.
  - Cash/wire deposit simulator to easily top up funds.
- **Modern Minimalist UI**:
  - Clean, human-friendly design with simple everyday terms (no confusing financial jargon).
  - **Full Dark Mode** with seamless toggle and `localStorage` persistence.
  - 100% reusable, prop-customizable UI components (`Button`, `Input`, `Modal`, `Card`, `Badge`, `Select`, etc.).
- **Study & Learning Guide**:
  - Detailed educational documentation in [`LEARNING_GUIDE.md`](./LEARNING_GUIDE.md) explaining banking ledger concepts, backend architecture, Redux Toolkit state flow, and step-by-step transaction lifecycles.

---

## 🚀 Quick Start

### 1. Start the Backend API
```bash
cd backend
npm install
node server.js
```
The backend starts on `http://localhost:3000` and connects to MongoDB.

### 2. Start the Frontend App
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`. Vite proxies `/api` calls directly to the Express backend.

---

## 📁 Repository Structure
```
banking_backend/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/db.js      # MongoDB database connection
│   │   ├── models/           # User, Account, Transaction (Ledger) schemas
│   │   ├── controllers/      # Auth, Accounts, Transactions logic
│   │   ├── routes/           # REST endpoints (/api/auth, /api/accounts, /api/transactions)
│   │   └── middleware/       # JWT authentication middleware
│   └── server.js             # HTTP server entry point
│
├── frontend/                 # React 18 + Vite + Redux Toolkit + Tailwind CSS
│   ├── src/
│   │   ├── api/              # Axios HTTP client with auto-Bearer interceptors
│   │   ├── components/
│   │   │   ├── common/       # Reusable primitives (Button, Input, Card, Modal, etc.)
│   │   │   ├── banking/      # Banking domain components (BankCard, Modals, Tables)
│   │   │   └── layout/       # App shell (Sidebar, Header, Layout)
│   │   ├── pages/            # Dashboard, Transfers, Activity, Accounts, Auth
│   │   └── store/            # Redux Toolkit slices (auth, accounts, transactions, ui)
│   └── .env                  # Frontend environment configuration
│
└── LEARNING_GUIDE.md         # 📖 Comprehensive Study Guide for students & developers
```

---

## 📖 Complete Study Guide
For an in-depth understanding of:
- How real banking ledgers, double-entry accounting, and immutability work
- How Redux slices synchronize balance across multiple pages
- Step-by-step lifecycle of sending money
- How to test and inspect the system

👉 **Read the full [LEARNING_GUIDE.md](./LEARNING_GUIDE.md)**

