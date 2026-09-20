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
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Modal } from '../common/Modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateShort, formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { cn } from '@/lib/utils';

/**
 * Modern Fincheck Transaction Ledger Table powered by shadcn/ui
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
        bg: 'bg-amber-500/15',
      };
    }
    if (cat.includes('shop') || cat.includes('market') || cat.includes('store')) {
      return {
        icon: <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        bg: 'bg-purple-500/15',
      };
    }
    if (cat.includes('bill') || cat.includes('util') || cat.includes('electric')) {
      return {
        icon: <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        bg: 'bg-blue-500/15',
      };
    }
    if (cat.includes('salary') || cat.includes('deposit') || isCredit) {
      return {
        icon: <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        bg: 'bg-emerald-500/15',
      };
    }
    return {
      icon: <ArrowUpRight className="w-4 h-4 text-muted-foreground" />,
      bg: 'bg-muted',
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
    <Card className={cn('overflow-hidden p-0', className)}>
      {/* Filter / Search Bar */}
      {showFilters && (
        <div className="p-4 sm:p-5 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-card">
          <div className="w-full sm:w-72 relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by recipient, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-sans"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Filter tabs */}
            <div className="flex bg-muted p-1 rounded-xl text-xs">
              {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    'px-3 py-1 rounded-lg font-medium transition-all select-none cursor-pointer',
                    typeFilter === type
                      ? 'bg-background text-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {type === 'ALL' ? 'All' : type === 'CREDIT' ? 'Money In' : 'Money Out'}
                </button>
              ))}
            </div>

            {/* CSV Export Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={displayedList.length === 0}
              className="rounded-xl gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </Button>
          </div>
        </div>
      )}

      {/* Table Content */}
      {loading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-12 bg-muted/60 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : displayedList.length === 0 ? (
        <div className="p-10 text-center">
          <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30 text-muted-foreground" />
          <p className="font-semibold text-foreground text-sm">No Transactions Found</p>
          <p className="text-xs text-muted-foreground mt-1">No transaction records match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] font-normal text-muted-foreground">
                <th className="py-3 px-5 font-normal">Receiver / Title</th>
                <th className="py-3 px-4 font-normal">Type</th>
                <th className="py-3 px-4 font-normal">Date</th>
                <th className="py-3 px-5 font-normal text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {displayedList.map((tx) => {
                const isCredit = tx.type === 'CREDIT';
                const { icon, bg } = getCategoryIcon(tx.category || '', isCredit);
                const title = tx.recipientName || tx.title || (isCredit ? 'Deposit' : 'Wire Transfer');

                return (
                  <tr
                    key={tx._id || tx.id}
                    onClick={() => setSelectedTx(selectedTx?._id === tx._id ? null : tx)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    {/* Receiver + Icon */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground block truncate max-w-[200px] sm:max-w-[280px]">
                            {title}
                          </span>
                          <span className="text-[11px] text-muted-foreground block truncate max-w-[200px] sm:max-w-[280px]">
                            {tx.note || (isCredit ? 'Account Deposit' : 'Wire Transfer')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type / Category */}
                    <td className="py-3 px-4 text-muted-foreground">
                      <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5">
                        {tx.category || (isCredit ? 'Income' : 'Transfer')}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDateShort(tx.createdAt || tx.date)}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-5 text-right">
                      <div>
                        <span
                          className={`font-bold tabular-nums text-sm ${
                            isCredit
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-foreground'
                          }`}
                        >
                          {isCredit ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'INR')}
                        </span>
                        {tx.balanceAfter !== undefined && tx.balanceAfter !== null && (
                          <span className="text-[10px] text-muted-foreground block tabular-nums">
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
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-center space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Transaction Amount</span>
              <div
                className={`text-2xl font-bold tabular-nums ${
                  selectedTx.type === 'CREDIT'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-foreground'
                }`}
              >
                {selectedTx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(selectedTx.amount, selectedTx.currency || 'INR')}
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed & Settled</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2.5 text-xs divide-y divide-border">
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Recipient / Party</span>
                <span className="font-semibold text-foreground">
                  {selectedTx.recipientName || selectedTx.title || 'Bank Transfer'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2.5">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium text-foreground">
                  {selectedTx.category || 'General'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2.5">
                <span className="text-muted-foreground">Transaction Date</span>
                <span className="text-foreground">
                  {formatDate(selectedTx.createdAt || selectedTx.date)}
                </span>
              </div>

              {selectedTx.balanceAfter !== undefined && selectedTx.balanceAfter !== null && (
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-muted-foreground">Balance After Event</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(selectedTx.balanceAfter, selectedTx.currency || 'INR')}
                  </span>
                </div>
              )}

              {selectedTx.note && (
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-muted-foreground">Note</span>
                  <span className="text-foreground italic">
                    "{selectedTx.note}"
                  </span>
                </div>
              )}

              {selectedTx.reference && (
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-muted-foreground">Audit Reference</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {selectedTx.reference}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyRef(selectedTx.reference)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedTx(null)}
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}

export default TransactionTable;
