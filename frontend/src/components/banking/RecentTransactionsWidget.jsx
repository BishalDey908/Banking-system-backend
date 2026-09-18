import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Coffee,
  ShoppingCart,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  User,
  Zap,
} from 'lucide-react';
import { Card } from '../common/Card';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

/**
 * Modern Fincheck Transaction History Widget
 * 
 * Clean, minimalist list with Reciever, Type, Date, and Amount
 * directly connected to the user's real backend ledger.
 */
export function RecentTransactionsWidget({
  transactions = [],
  currency = 'INR',
  loading = false,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('Recently'); // 'Recently' | 'Oldest' | 'More'

  // Map real backend transactions
  const displayItems = transactions.map((tx) => {
    const isCredit = tx.type === 'CREDIT';
    let icon = isCredit ? (
      <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-rose-500 dark:text-rose-400" />
    );
    let iconBg = isCredit
      ? 'bg-emerald-50 dark:bg-emerald-950/40'
      : 'bg-rose-50 dark:bg-rose-950/40';

    const cat = (tx.category || '').toLowerCase();
    if (cat.includes('food') || cat.includes('coffee') || cat.includes('dining')) {
      icon = <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      iconBg = 'bg-amber-50 dark:bg-amber-950/40';
    } else if (cat.includes('shop') || cat.includes('market')) {
      icon = <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      iconBg = 'bg-purple-50 dark:bg-purple-950/40';
    } else if (cat.includes('bills') || cat.includes('util')) {
      icon = <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      iconBg = 'bg-blue-50 dark:bg-blue-950/40';
    }

    return {
      id: tx._id || tx.id,
      title: tx.title || tx.recipientName || (isCredit ? 'Deposit' : 'Transfer'),
      type: tx.type,
      category: tx.category || (isCredit ? 'Income' : 'Transfer'),
      date: formatDateShort(tx.createdAt || tx.date),
      amount: Math.abs(Number(tx.amount)) || 0,
      currency: tx.currency || currency,
      isCredit,
      icon,
      iconBg,
    };
  });

  // Sorting logic based on tab
  const sortedItems = activeTab === 'Oldest'
    ? [...displayItems].reverse().slice(0, 5)
    : displayItems.slice(0, 5);

  return (
    <Card padding="md" className={`rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm ${className}`}>
      {/* Header with Recently / Oldest / More tabs */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
          Transaction history
        </h3>

        <div className="flex items-center gap-3 text-xs font-medium select-none">
          <button
            type="button"
            onClick={() => setActiveTab('Recently')}
            className={`transition-colors ${
              activeTab === 'Recently'
                ? 'text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-4'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Recently
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Oldest')}
            className={`transition-colors ${
              activeTab === 'Oldest'
                ? 'text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-4'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Oldest
          </button>
          <Link
            to="/activity"
            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            More
          </Link>
        </div>
      </div>

      {/* Table Content */}
      {sortedItems.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
          <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="font-medium text-slate-600 dark:text-slate-300">No transactions yet</p>
          <p className="text-[11px] mt-0.5">Deposit or send money to see your activity here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-medium text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <th className="pb-2.5 font-normal">Reciever</th>
                <th className="pb-2.5 font-normal">Type</th>
                <th className="pb-2.5 font-normal">Date</th>
                <th className="pb-2.5 font-normal text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs">
              {sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Receiver + Icon */}
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                        {item.icon}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px] sm:max-w-[180px]">
                        {item.title}
                      </span>
                    </div>
                  </td>

                  {/* Type / Category */}
                  <td className="py-3 px-3 text-slate-400 dark:text-slate-500 font-normal">
                    {item.category}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-3 text-slate-400 dark:text-slate-500 font-normal">
                    {item.date}
                  </td>

                  {/* Amount */}
                  <td className="py-3 pl-3 text-right">
                    <span
                      className={`font-bold tabular-nums ${
                        item.isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {item.isCredit ? '+' : '-'}{formatCurrency(item.amount, item.currency)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default RecentTransactionsWidget;
