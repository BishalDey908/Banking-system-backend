import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Badge Component
 * Ideal for banking statuses: ACTIVE, FROZEN, CLOSED, currency tags, etc.
 * 
 * @param {Object} props
 * @param {'emerald' | 'amber' | 'rose' | 'slate' | 'blue' | 'neutral'} [props.variant='emerald'] - Visual color scheme
 * @param {'sm' | 'md'} [props.size='md'] - Badge size
 * @param {boolean} [props.dot=false] - Show a status dot
 * @param {boolean} [props.dotPulse=false] - Show pulsing animation on the status dot
 * @param {string} [props.className=''] - Additional custom CSS classes
 * @param {React.ReactNode} props.children - Badge content
 */
export function Badge({
  variant = 'emerald',
  size = 'md',
  dot = false,
  dotPulse = false,
  className = '',
  children,
}) {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    neutral: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  };

  const dotColorStyles = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    neutral: 'bg-neutral-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border tracking-wide uppercase font-mono select-none',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {dotPulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColorStyles[variant]
              )}
            />
          )}
          <span
            className={cn('relative inline-flex rounded-full h-1.5 w-1.5', dotColorStyles[variant])}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

export default Badge;

