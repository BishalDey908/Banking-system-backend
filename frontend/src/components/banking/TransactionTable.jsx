import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download,
  Receipt,
  ShoppingBag,
  Coffee,
  Zap,
  Briefcase,
  Layers,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { EmptyState } from '../common/EmptyState';
import { TransactionRowSkeleton } from '../common/Skeleton';
import { formatCurrency, formatDateShort, formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

/**
 * Modern Fincheck Transaction Ledger Table
 * 
 * Clean, minimalist table layout with Receiver, Type, Date, and Amount
 * matching the Fincheck reference aesthetic.
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
  const [selectedTx, setSelectedTx] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const { showSuccess } = useToast();

  const handleCopyRef = (ref) => {
    if (!ref) return;
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    showSuccess('Audit reference copied to clipboard');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const getCategoryIcon = (category = '', isCredit = false) => {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('coffee') || cat.includes('dining')) {
      return {
        icon: <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        bg: 'bg-amber-50 dark:bg-amber-950/40',
      };
    }
    if (cat.includes('shop') || cat.includes('market') || cat.includes('store')) {
      return {
        icon: <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        bg: 'bg-purple-50 dark:bg-purple-950/40',
      };
    }
    if (cat.includes('bill') || cat.includes('util') || cat.includes('electric')) {
      return {
        icon: <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        bg: 'bg-blue-50 dark:bg-blue-950/40',
      };
    }
    if (cat.includes('salary') || cat.includes('deposit') || isCredit) {
      return {
        icon: <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      };
    }
    return {
      icon: <ArrowUpRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />,
      bg: 'bg-slate-100 dark:bg-slate-800',
    };
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    const headers = ['Transaction ID', 'Recipient / Title', 'Type', 'Category', 'Amount', 'Currency', 'Balance After', 'Date', 'Reference'];
    const rows = displayedList.map((tx) => [
      tx._id || tx.id,
      `"${tx.recipientName || tx.title || 'Transaction'}"`,
      tx.type,
      tx.category || 'Transfer',
      `${tx.type === 'DEBIT' ? '-' : '+'}${(Math.abs(Number(tx.amount)) || 0).toFixed(2)}`,
      tx.currency || 'INR',
      tx.balanceAfter !== undefined ? Number(tx.balanceAfter).toFixed(2) : '',
      tx.createdAt || tx.date || '',
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
    <Card padding="none" className={cn('rounded-2xl overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm', className)}>
      {/* Filter / Search Bar */}
      {showFilters && (
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="w-full sm:w-72 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by recipient, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Filter tabs */}
            <div className="flex bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
              {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    'px-3 py-1 rounded-lg font-medium transition-all select-none',
                    typeFilter === type
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {type === 'ALL' ? 'All' : type === 'CREDIT' ? 'Money In' : 'Money Out'}
                </button>
              ))}
            </div>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={displayedList.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors select-none"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-12 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : displayedList.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">No Transactions Found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No transaction records match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/40 text-[11px] font-normal text-slate-400 dark:text-slate-500">
                    <th className="py-3 px-5 font-normal">Receiver / Title</th>
                    <th className="py-3 px-4 font-normal">Type</th>
                    <th className="py-3 px-4 font-normal">Date</th>
                    <th className="py-3 px-5 font-normal text-right">Amount</th>
              </tr>
            </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs">
              {displayedList.map((tx) => {
                const isCredit = tx.type === 'CREDIT';
                const { icon, bg } = getCategoryIcon(tx.category || '', isCredit);
                const title = tx.recipientName || tx.title || (isCredit ? 'Deposit' : 'Wire Transfer');

                return (
                  <tr
                    key={tx._id || tx.id}
                    onClick={() => setSelectedTx(selectedTx?._id === tx._id ? null : tx)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Receiver + Icon */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 dark:text-slate-100 block truncate max-w-[200px] sm:max-w-[280px]">
                            {title}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[200px] sm:max-w-[280px]">
                            {tx.note || (isCredit ? 'Account Deposit' : 'Wire Transfer')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type / Category */}
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tx.category || (isCredit ? 'Income' : 'Transfer')}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 dark:text-slate-500">
                      {formatDateShort(tx.createdAt || tx.date)}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-5 text-right">
                      <div>
                        <span
                          className={`font-bold tabular-nums text-sm ${isCredit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100'
                            }`}
                        >
                          {isCredit ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'INR')}
                        </span>
                        {tx.balanceAfter !== undefined && tx.balanceAfter !== null && (
                          <span className="text-[10px] text-slate-400 block tabular-nums">
                            Bal: {formatCurrency(tx.balanceAfter, tx.currency || 'INR')}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <Modal
          isOpen={Boolean(selectedTx)}
          onClose={() => setSelectedTx(null)}
          title="Transaction Receipt"
          description="Verified record from immutable banking ledger"
          size="md"
        >
          <div className="space-y-4 pt-1">
            {/* Amount Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-center space-y-1">
              <span className="text-xs text-slate-400 font-medium">Transaction Amount</span>
              <div
                className={`text-2xl font-bold tabular-nums ${selectedTx.type === 'CREDIT'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-900 dark:text-slate-100'
                  }`}
              >
                {selectedTx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(selectedTx.amount, selectedTx.currency || 'INR')}
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed & Settled</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2.5 text-xs divide-y divide-slate-100 dark:divide-slate-800/80">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Recipient / Party</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {selectedTx.recipientName || selectedTx.title || 'Bank Transfer'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2.5">
                <span className="text-slate-400">Category</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {selectedTx.category || 'General'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2.5">
                <span className="text-slate-400">Transaction Date</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {formatDate(selectedTx.createdAt || selectedTx.date)}
                </span>
              </div>

              {selectedTx.balanceAfter !== undefined && selectedTx.balanceAfter !== null && (
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-slate-400">Balance After Event</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(selectedTx.balanceAfter, selectedTx.currency || 'INR')}
                  </span>
                </div>
              )}

              {selectedTx.note && (
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-slate-400">Note</span>
                  <span className="text-slate-700 dark:text-slate-300 italic">
                    "{selectedTx.note}"
                  </span>
                </div>
              )}

              {selectedTx.reference && (
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-slate-400">Audit Reference</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {selectedTx.reference}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyRef(selectedTx.reference)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Copy Reference"
                    >
                      {copiedRef ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}

export default TransactionTable;
