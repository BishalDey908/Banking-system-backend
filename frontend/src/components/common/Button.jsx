import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Button Component
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle'} [props.variant='primary'] - Button style variant
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.isLoading=false] - Whether button shows a loading spinner
 * @param {React.ReactNode} [props.leftIcon] - Icon placed before button text
 * @param {React.ReactNode} [props.rightIcon] - Icon placed after button text
 * @param {boolean} [props.fullWidth=false] - If true, expands to fill parent container width
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.className=''] - Additional custom CSS classes
 * @param {React.ReactNode} props.children - Button label / content
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  // Base styles: clean geometry, transition, focus ring
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5 font-semibold',
  };

  // Aesthetic variants: crisp contrast, modern fintech palette
  const variantStyles = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:active:bg-emerald-700 focus:ring-slate-900 dark:focus:ring-emerald-500 border border-slate-900 dark:border-emerald-600 shadow-sm',
    secondary:
      'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-650 border border-slate-200 dark:border-slate-700 focus:ring-slate-400 dark:focus:ring-slate-600 shadow-sm',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 border border-slate-300 dark:border-slate-700 focus:ring-slate-300 dark:focus:ring-slate-700',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-transparent focus:ring-slate-200 dark:focus:ring-slate-700',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 border border-rose-600 shadow-sm',
    subtle:
      'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/70 dark:border-emerald-800/50 focus:ring-emerald-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

export default Button;

