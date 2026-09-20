import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { formatCurrency } from '../../utils/formatters';

/**
 * Authentic shadcn/ui Activity Donut Chart
 */
export function ActivityDonutChart({
  title = 'Activity Breakdown',
  transactions = [],
  currency = 'INR',
  className = '',
}) {
  const [filterMonth, setFilterMonth] = useState('Last week');

  const { totalSpent, categories } = useMemo(() => {
    let spentSum = 0;
    const catMap = {};

    transactions.forEach((tx) => {
      if (tx.type === 'DEBIT') {
        const amt = Math.abs(Number(tx.amount)) || 0;
        spentSum += amt;
        const category = tx.category || 'Transfer';
        catMap[category] = (catMap[category] || 0) + amt;
      }
    });

    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    if (spentSum > 0) {
      const sortedCats = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const items = sortedCats.map(([name, val], idx) => {
        const pct = Math.round((val / spentSum) * 100);
        return {
          name,
          percent: pct,
          color: colors[idx % colors.length],
        };
      });

      return {
        totalSpent: Math.round((spentSum + Number.EPSILON) * 100) / 100,
        categories: items,
      };
    }

    const allCatMap = {};
    let allSum = 0;
    transactions.forEach((tx) => {
      const amt = Math.abs(Number(tx.amount)) || 0;
      allSum += amt;
      const cat = tx.category || tx.title || 'Deposit';
      allCatMap[cat] = (allCatMap[cat] || 0) + amt;
    });

    if (allSum > 0) {
      const sorted = Object.entries(allCatMap).slice(0, 5);
      const items = sorted.map(([name, val], idx) => ({
        name,
        percent: Math.round((val / allSum) * 100),
        color: colors[idx % colors.length],
      }));
      return {
        totalSpent: 0,
        categories: items,
      };
    }

    return {
      totalSpent: 0,
      categories: [
        { name: 'No Expenses Yet', percent: 100, color: 'hsl(var(--muted-foreground))' },
      ],
    };
  }, [transactions]);

  const radius = 62;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const segments = categories.map((cat) => {
    const strokeDasharray = `${(cat.percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += cat.percent;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-xs">
            Spending distribution by category.
          </CardDescription>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 bg-secondary border border-border rounded-md text-xs font-medium text-foreground cursor-pointer hover:bg-secondary/80 transition-colors select-none">
          <span>{filterMonth}</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
          {/* Donut Ring with Center Total */}
          <div className="relative w-40 h-40 shrink-0 flex items-center justify-center select-none">
            <svg
              viewBox="0 0 160 160"
              className="w-full h-full -rotate-90 transform"
            >
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted"
              />

              {totalSpent > 0 ? (
                segments.map((seg) => (
                  <circle
                    key={seg.name}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 hover:opacity-85 cursor-pointer"
                  />
                ))
              ) : (
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  className="text-border"
                />
              )}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                {formatCurrency(totalSpent, currency)}
              </span>
              <span className="text-xs text-muted-foreground font-medium mt-0.5">
                Total Spent
              </span>
            </div>
          </div>

          {/* Categories Legend List */}
          <div className="w-full sm:w-auto flex-1 space-y-2.5">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex items-center justify-between text-xs group cursor-default"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors truncate max-w-[120px]">
                    {cat.name}
                  </span>
                </div>
                <span className="font-semibold text-foreground tabular-nums">
                  {cat.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityDonutChart;
