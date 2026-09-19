import React from 'react';
import { useSelector } from 'react-redux';
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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-5 py-3 gap-2.5 font-semibold',
  };

  // Aesthetic variants: crisp contrast, modern Fincheck palette
  const variantStyles = {
    primary:
      'bg-[#3b82f6] hover:bg-blue-600 active:bg-blue-700 text-white focus:ring-blue-500 border border-transparent shadow-xs',
    secondary:
      'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-transparent focus:ring-slate-400 dark:focus:ring-slate-600 shadow-xs',
    outline:
      'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-slate-300 dark:focus:ring-slate-700',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent focus:ring-slate-200 dark:focus:ring-slate-700',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 border border-rose-600 shadow-xs',
    subtle:
      'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-900/30 focus:ring-blue-400',
  };

  const isRateLimited = useSelector((state) => state.ui?.rateLimit?.isRateLimited);

  return (
    <button
      type={type}
      disabled={disabled || isLoading || isRateLimited}
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

