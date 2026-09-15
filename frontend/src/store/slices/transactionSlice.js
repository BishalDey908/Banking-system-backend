import { createSlice } from '@reduxjs/toolkit';

// Initial seed transactions for realistic banking ledger experience
const initialTransactions = [
  {
    id: 'tx_101',
    accountId: 'default',
    title: 'Salary Credit — Tech Corp Ltd',
    category: 'Income',
    type: 'CREDIT',
    amount: 85000,
    currency: 'INR',
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    status: 'COMPLETED',
    reference: 'SAL/2026/09/8812',
  },
  {
    id: 'tx_102',
    accountId: 'default',
    title: 'Electricity & Utility Services',
    category: 'Bills',
    type: 'DEBIT',
    amount: 3240.50,
    currency: 'INR',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'COMPLETED',
    reference: 'UTL/PWR/9921',
  },
  {
    id: 'tx_103',
    accountId: 'default',
    title: 'Quarterly Interest Payout',
    category: 'Interest',
    type: 'CREDIT',
    amount: 1420.00,
    currency: 'INR',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    status: 'COMPLETED',
    reference: 'INT/Q3/2026',
  },
  {
    id: 'tx_104',
    accountId: 'default',
    title: 'Blue Tokai Coffee Roasters',
    category: 'Dining',
    type: 'DEBIT',
    amount: 390.00,
    currency: 'INR',
    date: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
    status: 'COMPLETED',
    reference: 'POS/CARD/7712',
  },
  {
    id: 'tx_105',
    accountId: 'default',
    title: 'Cloud Infrastructure Subscription',
    category: 'Software',
    type: 'DEBIT',
    amount: 2450.00,
    currency: 'INR',
    date: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
    status: 'COMPLETED',
    reference: 'SUB/SFT/4431',
  },
];

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: initialTransactions,
    searchQuery: '',
    typeFilter: 'ALL', // 'ALL', 'CREDIT', 'DEBIT'
    categoryFilter: 'ALL',
    isExporting: false,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setTypeFilter: (state, action) => {
      state.typeFilter = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
    },
    addTransfer: (state, action) => {
      const { accountId, recipientName, recipientAccount, amount, note, type = 'DEBIT' } = action.payload;
      const newTx = {
        id: `tx_${Date.now()}`,
        accountId: accountId || 'default',
        title: `Transfer to ${recipientName} (${recipientAccount.slice(-4)})`,
        category: 'Transfer',
        type: type,
        amount: Number(amount),
        currency: 'INR',
        date: new Date().toISOString(),
        status: 'COMPLETED',
        reference: `TRF/${Date.now().toString().slice(-6)}`,
        note: note || '',
      };
      state.items.unshift(newTx);
    },
  },
});

export const { setSearchQuery, setTypeFilter, setCategoryFilter, addTransfer } = transactionSlice.actions;
export default transactionSlice.reducer;

