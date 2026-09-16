import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './Card';
import { StatCardSkeleton } from './Skeleton';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Financial Metric StatCard
 * 
 * @param {Object} props
 * @param {string} props.label - Metric label (e.g. "Total Liquid Assets")
 * @param {string|number} props.value - Display value
 * @param {string} [props.prefix] - Prefix symbol (e.g. "₹")
 * @param {string} [props.suffix] - Suffix (e.g. "INR")
 * @param {string} [props.change] - Rate of change percentage (e.g. "+8.4%")
 * @param {'positive' | 'negative' | 'neutral'} [props.changeType='neutral'] - Trend indicator direction
 * @param {React.ReactNode} [props.icon] - Metric visual icon
 * @param {string} [props.subtitle] - Clarifying note or timeframe
 * @param {Function} [props.onClick]
 * @param {string} [props.className='']
 * @param {boolean} [props.loading=false] - Whether to show skeleton loader
 */
export function StatCard({
  label,
  value,
  prefix,
  suffix,
  change,
  changeType = 'neutral',
  icon,
  subtitle,
  onClick,
  className = '',
  loading = false,
}) {
  if (loading) {
    return <StatCardSkeleton className={className} />;
  }
  const trendConfig = {
    positive: {
      color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-800/60',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    negative: {
      color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200/60 dark:border-rose-800/60',
      icon: <TrendingDown className="w-3.5 h-3.5" />,
    },
    neutral: {
      color: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      icon: <Minus className="w-3.5 h-3.5" />,
    },
  };

  return (
    <Card
      onClick={onClick}
      hoverable={Boolean(onClick)}
      padding="md"
      className={cn('flex flex-col justify-between relative overflow-hidden', className)}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
          {label}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          {prefix && <span className="text-xl font-medium text-slate-400">{prefix}</span>}
          <span className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight font-mono tabular-nums">
            {value}
          </span>
          {suffix && <span className="text-xs font-mono font-medium text-slate-400">{suffix}</span>}
        </div>

        {(change || subtitle) && (
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium font-mono',
                  trendConfig[changeType].color
                )}
              >
                {trendConfig[changeType].icon}
                {change}
              </span>
            )}
            {subtitle && <span className="text-slate-400 dark:text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatCard;

