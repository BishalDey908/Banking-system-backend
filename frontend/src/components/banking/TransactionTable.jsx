import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download,
  Filter,
  Receipt,
  ShoppingBag,
  Coffee,
  Zap,
  Briefcase,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { TransactionRowSkeleton } from '../common/Skeleton';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Financial Transaction Ledger Table
 * 
 * @param {Object} props
 * @param {Array<Object>} props.transactions - List of transaction items
 * @param {boolean} [props.showFilters=true] - Display search and filter toolbars
 * @param {number} [props.limit] - Cap the rendered row count
 * @param {boolean} [props.loading=false] - Display skeleton rows during fetch
 * @param {string} [props.className='']
 */
export function TransactionTable({
  transactions = [],
  showFilters = true,
  limit,
  loading = false,
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'CREDIT' | 'DEBIT'
  const { showSuccess } = useToast();

  const getCategoryIcon = (category = '') => {
    switch (category.toLowerCase()) {
      case 'income':
      case 'salary':
        return <Briefcase className="w-3.5 h-3.5 text-emerald-600" />;
      case 'dining':
      case 'food':
        return <Coffee className="w-3.5 h-3.5 text-amber-600" />;
      case 'bills':
      case 'utilities':
        return <Zap className="w-3.5 h-3.5 text-blue-600" />;
      case 'software':
      case 'shopping':
        return <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Receipt className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === 'ALL' ? true : tx.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, typeFilter]);

  const displayedList = limit
    ? filteredTransactions.slice(0, limit)
    : filteredTransactions;

  const handleExportCSV = () => {
    if (displayedList.length === 0) return;

    const headers = ['Transaction ID', 'Title', 'Type', 'Category', 'Amount', 'Balance After', 'Currency', 'Date', 'Status', 'Reference'];
    const rows = displayedList.map((tx) => [
      tx._id || tx.id,
      `"${tx.title || 'Transaction'}"`,
      tx.type,
      tx.category || 'General',
      `${tx.type === 'DEBIT' ? '-' : '+'}${(Math.abs(Number(tx.amount)) || 0).toFixed(2)}`,
      tx.balanceAfter !== undefined && tx.balanceAfter !== null ? Number(tx.balanceAfter).toFixed(2) : '',
      tx.currency || 'INR',
      tx.createdAt || tx.date || '',
      tx.status || 'COMPLETED',
      tx.reference || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Statement downloaded as CSV successfully.');
  };

  return (
    <Card padding="none" className={cn('overflow-hidden', className)}>
      {/* Filter / Search Bar */}
      {showFilters && (
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs">
              {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-medium transition-colors select-none',
                    typeFilter === type
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {type === 'ALL' ? 'All' : type === 'CREDIT' ? 'Money In' : 'Money Out'}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCSV}
              disabled={displayedList.length === 0}
            >
              CSV
            </Button>
          </div>
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 sm:px-6 font-semibold">Transaction</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Category</th>
                <th className="py-3 px-4 font-semibold hidden sm:table-cell">Date</th>
                <th className="py-3 px-4 font-semibold hidden lg:table-cell">Reference</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 sm:px-6 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {[1, 2, 3, 4, 5].slice(0, limit || 5).map((n) => (
                <TransactionRowSkeleton key={n} />
              ))}
            </tbody>
          </table>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No Transactions"
            description="No transaction records match your search."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 sm:px-6 font-semibold">Transaction</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Category</th>
                <th className="py-3 px-4 font-semibold hidden sm:table-cell">Date</th>
                <th className="py-3 px-4 font-semibold hidden lg:table-cell">Reference</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 sm:px-6 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {displayedList.map((tx) => {
                const isCredit = tx.type === 'CREDIT';

                return (
                  <tr
                    key={tx._id || tx.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Title + Direction Icon */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            isCredit
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          )}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-slate-100 block leading-tight">
                            {tx.title}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 sm:hidden block mt-0.5">
                            {formatDateShort(tx.createdAt || tx.date)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {getCategoryIcon(tx.category)}
                        <span>{tx.category || 'General'}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 hidden sm:table-cell text-xs font-mono text-slate-500 dark:text-slate-400">
                      {formatDateShort(tx.createdAt || tx.date)}
                    </td>

                    {/* Reference */}
                    <td className="py-3.5 px-4 hidden lg:table-cell text-xs font-mono text-slate-400 dark:text-slate-500">
                      {tx.reference || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={tx.status === 'COMPLETED' ? 'emerald' : 'slate'}
                        size="sm"
                      >
                        {tx.status || 'Settled'}
                      </Badge>
                    </td>

                    {/* Amount & Running Ledger Balance Snapshot */}
                    <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-medium tabular-nums">
                      <span
                        className={cn(
                          isCredit ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-900 dark:text-slate-100'
                        )}
                      >
                        {isCredit ? '+' : '-'}{formatCurrency(Math.abs(Number(tx.amount) || 0), tx.currency || 'INR')}
                      </span>
                      {tx.balanceAfter !== undefined && tx.balanceAfter !== null && (
                        <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-mono font-normal mt-0.5">
                          Bal: {formatCurrency(tx.balanceAfter, tx.currency || 'INR')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default TransactionTable;

