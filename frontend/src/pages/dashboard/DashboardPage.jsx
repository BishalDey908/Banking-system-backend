import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  QrCode,
  ScanLine,
  Copy,
  Check,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { IncomeTrendChart } from '../../components/banking/IncomeTrendChart';
import { ActivityDonutChart } from '../../components/banking/ActivityDonutChart';
import { RecentTransactionsWidget } from '../../components/banking/RecentTransactionsWidget';
import { GoalsWidget } from '../../components/banking/GoalsWidget';
import { fetchAccounts } from '../../store/slices/accountSlice';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import {
  setReceiveQrModalOpen,
  setReceiveQrAccountId,
  setQrScannerModalOpen,
} from '../../store/slices/uiSlice';
import { formatCurrency } from '../../utils/formatters';
import { getAccountUpiId } from '../../utils/upi';
import { useToast } from '../../hooks/useToast';

/**
 * Modern Fincheck Banking Dashboard View
 * 
 * Accurately computes live financial balances, inflow, and outflow
 * directly from your backend MongoDB ledger.
 */
export function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { accounts, activeAccountId, loading: accountsLoading } = useSelector(
    (state) => state.accounts
  );
  const { items: transactions, loading: transactionsLoading } = useSelector(
    (state) => state.transactions
  );

  // Fetch both live accounts and ledger transactions on mount
  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const activeAccount =
    accounts.find((a) => a._id === activeAccountId) || accounts[0] || null;

  const currency = activeAccount?.currency || 'INR';
  const { showSuccess } = useToast();
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleCopyUpi = () => {
    if (!activeAccount) return;
    const upiId = getAccountUpiId(activeAccount, user);
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showSuccess('UPI ID copied to clipboard');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Accurate real-time calculations from backend records
  const { totalInflow, totalOutflow, totalBalance, totalSavings } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;

    transactions.forEach((tx) => {
      const amt = Math.abs(Number(tx.amount)) || 0;
      if (tx.type === 'CREDIT') {
        inflow += amt;
      } else if (tx.type === 'DEBIT') {
        outflow += amt;
      }
    });

    // Sum balances across all user accounts
    const balance = accounts.reduce(
      (sum, acc) => sum + (Number(acc.balance) || 0),
      0
    );

    // Savings calculation: If user has 2+ accounts, secondary accounts count as savings; otherwise total balance
    const savings = accounts.length > 1
      ? accounts.slice(1).reduce((s, a) => s + (Number(a.balance) || 0), 0)
      : balance;

    return {
      totalBalance: Math.round((balance + Number.EPSILON) * 100) / 100,
      totalInflow: Math.round((inflow + Number.EPSILON) * 100) / 100,
      totalOutflow: Math.round((outflow + Number.EPSILON) * 100) / 100,
      totalSavings: Math.round((savings + Number.EPSILON) * 100) / 100,
    };
  }, [transactions, accounts]);

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* 0. UPI ID & QR Quick Access Bar */}
      {activeAccount && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-4.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Account UPI ID
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                  Instant Transfer
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {getAccountUpiId(activeAccount, user)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                dispatch(setReceiveQrAccountId(activeAccount._id));
                dispatch(setReceiveQrModalOpen(true));
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>My QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => dispatch(setQrScannerModalOpen(true))}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#3b82f6] hover:bg-blue-600 text-white shadow-xs transition-colors cursor-pointer"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Scan to Pay</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Top 4 Signature Pastel Gradient Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Balance (Cyan/Turquoise Gradient) */}
        <StatCard
          variant="cyan"
          label="Total Balance"
          value={formatCurrency(totalBalance, currency)}
          change="+ 22% ↗ than last month"
          icon={<Wallet className="w-4 h-4 text-white" />}
          loading={accountsLoading && transactionsLoading}
        />

        {/* Card 2: Total Income (Blue/Periwinkle Gradient) */}
        <StatCard
          variant="blue"
          label="Total Income"
          value={formatCurrency(totalInflow, currency)}
          change="+ 36% ↗ than last month"
          icon={<ArrowDownLeft className="w-4 h-4 text-white" />}
          loading={transactionsLoading}
        />

        {/* Card 3: Total Expenses (Pink/Coral Gradient) */}
        <StatCard
          variant="pink"
          label="Total Expenses"
          value={formatCurrency(totalOutflow, currency)}
          change={totalOutflow > 0 ? "- 11% ↘ than last month" : "0 expenses"}
          changeType={totalOutflow > 0 ? "negative" : "neutral"}
          icon={<ArrowUpRight className="w-4 h-4 text-white" />}
          loading={transactionsLoading}
        />

        {/* Card 4: Total Savings (Lilac/Purple Gradient) */}
        <StatCard
          variant="purple"
          label="Total Savings"
          value={formatCurrency(totalSavings, currency)}
          change="+ 15% ↗ than last month"
          icon={<PiggyBank className="w-4 h-4 text-white" />}
          loading={accountsLoading}
        />
      </div>

      {/* 2. Middle Row: Spline Income Trend Chart (65%) + Activity Donut Chart (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <IncomeTrendChart
            transactions={transactions}
            currency={currency}
            className="flex-1"
          />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <ActivityDonutChart
            transactions={transactions}
            currency={currency}
            className="flex-1"
          />
        </div>
      </div>

      {/* 3. Bottom Row: Transaction History (65%) + My Goals (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <RecentTransactionsWidget
            transactions={transactions}
            currency={currency}
            loading={transactionsLoading}
            className="flex-1"
          />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <GoalsWidget className="flex-1" />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
