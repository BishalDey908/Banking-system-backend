import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

/**
 * Modern Fincheck Activity Donut Chart
 * 
 * Dynamically computes expense categories and percentages from real transactions,
 * rendering a multi-color pastel donut ring with center total.
 */
export function ActivityDonutChart({
  title = 'Activity',
  transactions = [],
  currency = 'INR',
  className = '',
}) {
  const [filterMonth, setFilterMonth] = useState('Last week');

  // Dynamically compute spending categories and percentages from transactions
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

    const colors = ['#f472b6', '#38bdf8', '#c084fc', '#818cf8', '#facc15', '#34d399'];

    // If user has real debits, calculate exact breakdown
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

      // Ensure sum of percentages equals ~100
      return {
        totalSpent: Math.round((spentSum + Number.EPSILON) * 100) / 100,
        categories: items,
      };
    }

    // If user has other transactions (e.g. CREDIT / Deposits / Opening Balance)
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

    // Honest empty state when no transactions exist yet
    return {
      totalSpent: 0,
      categories: [
        { name: 'No Expenses Yet', percent: 100, color: '#94a3b8' },
      ],
    };
  }, [transactions]);

  // SVG Donut geometry
  const radius = 62;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke-dasharray and stroke-dashoffset for each segment
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
    <Card padding="md" className={`rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h3>

        <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors select-none">
          <span>{filterMonth}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </div>
      </div>

      {/* Donut + Legend Layout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
        {/* Donut Ring with Center Total */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center select-none">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full -rotate-90 transform"
          >
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800"
            />

            {/* Colored Segments */}
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
                stroke="#e2e8f0"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                className="dark:stroke-slate-800"
              />
            )}
          </svg>

          {/* Center Info Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatCurrency(totalSpent, currency)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Spent
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
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate max-w-[120px]">
                  {cat.name}
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {cat.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default ActivityDonutChart;
