import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Card Surface Component
 * 
 * @param {Object} props
 * @param {'default' | 'elevated' | 'outlined' | 'glass' | 'dark'} [props.variant='default'] - Visual surface style
 * @param {'none' | 'sm' | 'md' | 'lg'} [props.padding='md'] - Padding inside the card
 * @param {React.ReactNode} [props.header] - Optional slot rendered at top of card with border divider
 * @param {React.ReactNode} [props.footer] - Optional slot rendered at bottom of card with border divider
 * @param {boolean} [props.hoverable=false] - If true, adds subtle scale/shadow on hover
 * @param {Function} [props.onClick] - Optional click handler for interactive cards
 * @param {string} [props.className=''] - Additional custom CSS classes
 * @param {React.ReactNode} props.children - Body content
 */
export function Card({
  variant = 'default',
  padding = 'md',
  header,
  footer,
  hoverable = false,
  onClick,
  className = '',
  children,
  ...rest
}) {
  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] dark:shadow-none',
    elevated: 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.04)] dark:shadow-none',
    outlined: 'bg-transparent border border-slate-300/80 dark:border-slate-700',
    glass: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/40 dark:border-slate-800 shadow-sm',
    dark: 'bg-slate-900 dark:bg-slate-950 border border-slate-800 text-white shadow-xl',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const isInteractive = Boolean(onClick) || hoverable;

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-200',
        variantStyles[variant],
        isInteractive && 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md active:scale-[0.99]',
        className
      )}
      {...rest}
    >
      {header && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {header}
        </div>
      )}

      <div className={paddingStyles[padding]}>{children}</div>

      {footer && (
        <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;

