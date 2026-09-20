import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Coffee,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Zap,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

/**
 * Authentic shadcn/ui Transaction History Widget
 */
export function RecentTransactionsWidget({
  transactions = [],
  currency = 'INR',
  loading = false,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('Recently');

  const displayItems = transactions.map((tx) => {
    const isCredit = tx.type === 'CREDIT';
    let icon = isCredit ? (
      <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-rose-500 dark:text-rose-400" />
    );
    let iconBg = isCredit
      ? 'bg-emerald-500/10 text-emerald-600'
      : 'bg-rose-500/10 text-rose-600';

    const cat = (tx.category || '').toLowerCase();
    if (cat.includes('food') || cat.includes('coffee') || cat.includes('dining')) {
      icon = <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      iconBg = 'bg-amber-500/10 text-amber-600';
    } else if (cat.includes('shop') || cat.includes('market')) {
      icon = <ShoppingBag className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      iconBg = 'bg-purple-500/10 text-purple-600';
    } else if (cat.includes('bills') || cat.includes('util')) {
      icon = <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      iconBg = 'bg-blue-500/10 text-blue-600';
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

  const sortedItems = activeTab === 'Oldest'
    ? [...displayItems].reverse().slice(0, 5)
    : displayItems.slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
          <CardDescription className="text-xs">
            Latest financial transactions across your accounts.
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium select-none">
          <button
            type="button"
            onClick={() => setActiveTab('Recently')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'Recently'
                ? 'text-foreground font-semibold underline underline-offset-4'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Recently
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Oldest')}
            className={`transition-colors cursor-pointer ${
              activeTab === 'Oldest'
                ? 'text-foreground font-semibold underline underline-offset-4'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Oldest
          </button>
          <Link
            to="/activity"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {sortedItems.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium text-foreground">No transactions yet</p>
            <p className="text-[11px] mt-0.5">Deposit or transfer money to see your activity here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] font-medium text-muted-foreground">
                  <th className="pb-2.5 font-medium">Receiver / Source</th>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {sortedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.iconBg}`}>
                          {item.icon}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[140px] sm:max-w-[180px]">
                          {item.title}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-muted-foreground">
                      {item.category}
                    </td>

                    <td className="py-3 px-3 text-muted-foreground">
                      {item.date}
                    </td>

                    <td className="py-3 pl-3 text-right">
                      <span
                        className={`font-semibold tabular-nums ${
                          item.isCredit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-foreground'
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
      </CardContent>
    </Card>
  );
}

export default RecentTransactionsWidget;
