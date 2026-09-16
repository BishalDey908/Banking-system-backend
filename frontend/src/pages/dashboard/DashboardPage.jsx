import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { BankCard } from '../../components/banking/BankCard';
import { QuickActions } from '../../components/banking/QuickActions';
import { AccountList } from '../../components/banking/AccountList';
import { TransactionTable } from '../../components/banking/TransactionTable';
import { Skeleton } from '../../components/common/Skeleton';
import {
  setCreateAccountModalOpen,
  setTransferModalOpen,
  setDepositModalOpen,
  setQrScannerModalOpen,
  setReceiveQrModalOpen,
} from '../../store/slices/uiSlice';
import { setActiveAccount } from '../../store/slices/accountSlice';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { formatCurrency } from '../../utils/formatters';

/**
 * Clean & Simple Modern Banking Dashboard
 */
export function DashboardPage() {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { accounts, activeAccountId, loading: accountsLoading } = useSelector(
    (state) => state.accounts
  );
  const { items: transactions, loading: transactionsLoading } = useSelector(
    (state) => state.transactions
  );

  // Fetch real ledger transactions from backend on mount
  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const activeAccount =
    accounts.find((a) => a._id === activeAccountId) || accounts[0] || null;

  // Calculate live totals from backend records with 2-decimal precision
  const { totalInflow, totalOutflow, totalBalance } = useMemo(() => {
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

    // Sum balances across all accounts with precision
    const balance = accounts.reduce(
      (sum, acc) => sum + (Number(acc.balance) || 0),
      0
    );

    return {
      totalInflow: Math.round((inflow + Number.EPSILON) * 100) / 100,
      totalOutflow: Math.round((outflow + Number.EPSILON) * 100) / 100,
      totalBalance: Math.round((balance + Number.EPSILON) * 100) / 100,
    };
  }, [transactions, accounts]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Simple Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2 flex-wrap">
          <span>Welcome back,</span>
          {authLoading && !user ? (
            <Skeleton variant="text" className="w-24 sm:w-32 h-7 rounded inline-block" />
          ) : (
            <span>{user?.name?.split(' ')[0] || 'there'}</span>
          )}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Here is a summary of your money and recent activity.
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          value={formatCurrency(totalBalance, activeAccount?.currency || 'INR')}
          change="+4.2%"
          changeType="positive"
          icon={<Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          subtitle="Available in all accounts"
          loading={accountsLoading || transactionsLoading}
        />

        <StatCard
          label="Money In"
          value={formatCurrency(totalInflow, 'INR')}
          change="+12.4%"
          changeType="positive"
          icon={<ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          subtitle="Total received"
          loading={transactionsLoading}
        />

        <StatCard
          label="Money Out"
          value={formatCurrency(totalOutflow, 'INR')}
          change="-1.8%"
          changeType="negative"
          icon={<ArrowUpRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
          subtitle="Total spent"
          loading={transactionsLoading}
        />

        <StatCard
          label="My Accounts"
          value={accounts.length}
          suffix="Active"
          icon={<Landmark className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
          subtitle={accounts.length > 0 ? 'Primary account ready' : 'No accounts opened'}
          loading={accountsLoading}
        />
      </div>

      {/* Card & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Virtual Card */}
        <div className="lg:col-span-5 flex flex-col items-center sm:items-start">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono mb-3 block">
            My Virtual Card
          </span>

          <BankCard
            accountId={activeAccount?._id}
            cardholderName={user?.name || 'Account Holder'}
            currency={activeAccount?.currency || 'INR'}
            theme="obsidian"
            loading={accountsLoading}
          />
        </div>

        {/* Quick Actions & Accounts Snapshot */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block mb-3">
              Quick Actions
            </span>
            <QuickActions
              onOpenQrScanner={() => dispatch(setQrScannerModalOpen(true))}
              onOpenReceiveQr={() => dispatch(setReceiveQrModalOpen(true))}
              onOpenTransferModal={() => dispatch(setTransferModalOpen(true))}
              onOpenDepositModal={() => dispatch(setDepositModalOpen(true))}
              onOpenCreateModal={() => dispatch(setCreateAccountModalOpen(true))}
            />
          </div>

          {/* Accounts Mini Panel */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">My Accounts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an account to view or transfer from
                </p>
              </div>
              <Link
                to="/accounts"
                className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1"
              >
                <span>View All ({accounts.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <AccountList
              accounts={accounts.slice(0, 2)}
              activeAccountId={activeAccountId}
              onSelectAccount={(id) => dispatch(setActiveAccount(id))}
              onCreateClick={() => dispatch(setCreateAccountModalOpen(true))}
              loading={accountsLoading}
            />
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your latest transactions</p>
          </div>

          <Link
            to="/activity"
            className="text-xs font-semibold text-slate-900 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1 group"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <TransactionTable
          transactions={transactions}
          limit={5}
          showFilters={true}
          loading={transactionsLoading}
        />
      </div>
    </div>
  );
}

export default DashboardPage;
