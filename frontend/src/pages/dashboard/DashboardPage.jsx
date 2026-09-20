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
  Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  setCreateAccountModalOpen,
} from '../../store/slices/uiSlice';
import { formatCurrency } from '../../utils/formatters';
import { getAccountUpiId } from '../../utils/upi';
import { useToast } from '../../hooks/useToast';

/**
 * Authentic shadcn/ui Banking Dashboard View
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

    const balance = accounts.reduce(
      (sum, acc) => sum + (Number(acc.balance) || 0),
      0
    );

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
    <div className="space-y-6">
      {/* Page Header (Official shadcn/ui Dashboard Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your financial performance, account balances, and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="default"
            onClick={() => dispatch(setQrScannerModalOpen(true))}
            className="gap-2 font-medium"
          >
            <ScanLine className="w-4 h-4" />
            <span>Scan & Pay</span>
          </Button>
          <Button
            size="default"
            onClick={() => dispatch(setCreateAccountModalOpen(true))}
            className="gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Account</span>
          </Button>
        </div>
      </div>

      {/* 0. UPI ID & QR Quick Access Bar */}
      {activeAccount && (
        <Card className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border">
              <QrCode className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Account UPI ID
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-sm sm:text-base font-semibold text-foreground">
                  {getAccountUpiId(activeAccount, user)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
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

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                dispatch(setReceiveQrAccountId(activeAccount._id));
                dispatch(setReceiveQrModalOpen(true));
              }}
              className="flex-1 md:flex-none gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>My QR Code</span>
            </Button>
          </div>
        </Card>
      )}

      {/* 1. Top 4 shadcn/ui Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          value={formatCurrency(totalBalance, currency)}
          change="+20.1% from last month"
          changeType="positive"
          icon={<Wallet className="w-4 h-4" />}
          loading={accountsLoading && transactionsLoading}
        />

        <StatCard
          label="Total Income"
          value={formatCurrency(totalInflow, currency)}
          change="+12.5% from last month"
          changeType="positive"
          icon={<ArrowDownLeft className="w-4 h-4" />}
          loading={transactionsLoading}
        />

        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalOutflow, currency)}
          change={totalOutflow > 0 ? "-4.3% from last month" : "No expenses"}
          changeType={totalOutflow > 0 ? "negative" : "neutral"}
          icon={<ArrowUpRight className="w-4 h-4" />}
          loading={transactionsLoading}
        />

        <StatCard
          label="Total Savings"
          value={formatCurrency(totalSavings, currency)}
          change="+8.2% from last month"
          changeType="positive"
          icon={<PiggyBank className="w-4 h-4" />}
          loading={accountsLoading}
        />
      </div>

      {/* 2. Middle Row: Income Trend Chart (65%) + Activity Donut Chart (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
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
