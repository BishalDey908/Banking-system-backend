import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { TransactionTable } from '../../components/banking/TransactionTable';
import { StatCard } from '../../components/common/StatCard';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { fetchAccounts } from '../../store/slices/accountSlice';
import { formatCurrency } from '../../utils/formatters';

/**
 * Clean & Simple Activity Statement Page
 */
export function ActivityPage() {
  const dispatch = useDispatch();
  const { accounts, activeAccountId } = useSelector((state) => state.accounts);
  const { items: transactions, loading } = useSelector((state) => state.transactions);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const activeAccount =
    accounts.find((a) => a._id === activeAccountId) || accounts[0] || null;
  const currency = activeAccount?.currency || 'INR';

  const { totalInflow, totalOutflow } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;

    transactions.forEach((tx) => {
      const amt = Math.abs(Number(tx.amount)) || 0;
      if (tx.type === 'CREDIT') inflow += amt;
      if (tx.type === 'DEBIT') outflow += amt;
    });

    return {
      totalInflow: Math.round((inflow + Number.EPSILON) * 100) / 100,
      totalOutflow: Math.round((outflow + Number.EPSILON) * 100) / 100,
    };
  }, [transactions]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Transactions & Statement
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review all your money movements and export CSV statements.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          variant="cyan"
          label="Total Received"
          value={formatCurrency(totalInflow, currency)}
          icon={<ArrowDownLeft className="w-4 h-4 text-white" />}
          change="+ 36% ↗ than last month"
          loading={loading}
        />

        <StatCard
          variant="pink"
          label="Total Spent"
          value={formatCurrency(totalOutflow, currency)}
          icon={<ArrowUpRight className="w-4 h-4 text-white" />}
          change="- 11% ↘ than last month"
          changeType="negative"
          loading={loading}
        />

        <StatCard
          variant="purple"
          label="Transactions"
          value={transactions.length}
          suffix="Records"
          icon={<History className="w-4 h-4 text-white" />}
          change="+ 15% ↗ this month"
          loading={loading}
        />
      </div>

      {/* Transaction Table */}
      <div className="space-y-3">
        <TransactionTable transactions={transactions} showFilters={true} loading={loading} />
      </div>
    </div>
  );
}

export default ActivityPage;
