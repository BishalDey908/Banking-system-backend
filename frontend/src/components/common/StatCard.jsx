import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './Card';
import { StatCardSkeleton } from './Skeleton';
import { cn } from '../../utils/cn';

/**
 * Modern Fincheck Pastel Metric Card
 * 
 * Supports both standard clean cards and the 4 signature Fincheck pastel gradients:
 * - 'cyan'   (Total Balance)
 * - 'blue'   (Total Income)
 * - 'pink'   (Total Expenses)
 * - 'purple' (Total Savings)
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
  variant = 'default', // 'cyan' | 'blue' | 'pink' | 'purple' | 'default'
}) {
  if (loading) {
    return <StatCardSkeleton className={className} />;
  }

  // Pre-configured Fincheck signature gradient themes
  const gradientThemes = {
    cyan: {
      cardBg: 'bg-gradient-to-r from-[#1cc8db] to-[#2bd5bd] text-white shadow-[0_12px_28px_-6px_rgba(28,200,219,0.35)]',
      iconBox: 'bg-white/20 text-white',
      labelText: 'text-white/85',
      valueText: 'text-white',
      badgeBg: 'bg-white/20 text-white border-white/20',
      badgeSubtitle: 'text-white/80',
    },
    blue: {
      cardBg: 'bg-gradient-to-r from-[#5a9cff] to-[#3a75ff] text-white shadow-[0_12px_28px_-6px_rgba(58,117,255,0.35)]',
      iconBox: 'bg-white/20 text-white',
      labelText: 'text-white/85',
      valueText: 'text-white',
      badgeBg: 'bg-white/20 text-white border-white/20',
      badgeSubtitle: 'text-white/80',
    },
    pink: {
      cardBg: 'bg-gradient-to-r from-[#ff7597] to-[#ff6b8b] text-white shadow-[0_12px_28px_-6px_rgba(255,107,139,0.35)]',
      iconBox: 'bg-white/20 text-white',
      labelText: 'text-white/85',
      valueText: 'text-white',
      badgeBg: 'bg-white/20 text-white border-white/20',
      badgeSubtitle: 'text-white/80',
    },
    purple: {
      cardBg: 'bg-gradient-to-r from-[#be82ff] to-[#9d55f7] text-white shadow-[0_12px_28px_-6px_rgba(157,85,247,0.35)]',
      iconBox: 'bg-white/20 text-white',
      labelText: 'text-white/85',
      valueText: 'text-white',
      badgeBg: 'bg-white/20 text-white border-white/20',
      badgeSubtitle: 'text-white/80',
    },
  };

  const isGradient = Boolean(gradientThemes[variant]);
  const theme = gradientThemes[variant];

  // If using a Fincheck pastel gradient card:
  if (isGradient) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'p-5 sm:p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden select-none',
          theme.cardBg,
          Boolean(onClick) && 'cursor-pointer hover:scale-[1.02] active:scale-[0.99]',
          className
        )}
      >
        {/* Soft background ambient circle for realistic depth */}
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none blur-sm" />

        {/* Top: Icon + Label */}
        <div className="flex items-center gap-2.5 mb-3 relative z-10">
          {icon && (
            <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-xs', theme.iconBox)}>
              {icon}
            </div>
          )}
          <span className={cn('text-xs font-medium tracking-wide', theme.labelText)}>
            {label}
          </span>
        </div>

        {/* Value Display */}
        <div className="relative z-10">
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-lg font-medium opacity-90">{prefix}</span>}
            <span className={cn('text-2xl sm:text-3xl font-bold tracking-tight', theme.valueText)}>
              {value}
            </span>
            {suffix && <span className="text-xs font-medium opacity-90 ml-1">{suffix}</span>}
          </div>

          {/* Bottom Badge / Subtitle */}
          {(change || subtitle) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
              {change && (
                <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium backdrop-blur-xs', theme.badgeBg)}>
                  {changeType === 'negative' ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  <span>{change}</span>
                </span>
              )}
              {subtitle && (
                <span className={cn('text-[11px]', theme.badgeSubtitle)}>
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard clean card fallback
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
      className={cn('flex flex-col justify-between relative overflow-hidden rounded-2xl', className)}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </span>
          {suffix && <span className="text-xs font-medium text-slate-400">{suffix}</span>}
        </div>

        {(change || subtitle) && (
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium',
                  trendConfig[changeType].color
                )}
              >
                {trendConfig[changeType].icon}
                {change}
              </span>
            )}
            {subtitle && <span className="text-slate-400 dark:text-slate-500 text-[11px]">{subtitle}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatCard;
