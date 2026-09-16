import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { TransactionTable } from '../../components/banking/TransactionTable';
import { StatCard } from '../../components/common/StatCard';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { formatCurrency } from '../../utils/formatters';

/**
 * Clean & Simple Activity Statement Page
 */
export function ActivityPage() {
  const dispatch = useDispatch();
  const { items: transactions, loading } = useSelector((state) => state.transactions);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

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
          Activity
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review all your money movements and export CSV statements.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Received"
          value={formatCurrency(totalInflow, 'INR')}
          changeType="positive"
          icon={<ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          subtitle="All incoming funds"
          loading={loading}
        />

        <StatCard
          label="Total Spent"
          value={formatCurrency(totalOutflow, 'INR')}
          changeType="negative"
          icon={<ArrowUpRight className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
          subtitle="All outgoing transfers"
          loading={loading}
        />

        <StatCard
          label="Transactions"
          value={transactions.length}
          suffix="Total"
          icon={<History className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
          subtitle="Lifetime records"
          loading={loading}
        />
      </div>

      {/* Transaction Table */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">
          All Transactions
        </span>
        <TransactionTable transactions={transactions} showFilters={true} loading={loading} />
      </div>
    </div>
  );
}

export default ActivityPage;
