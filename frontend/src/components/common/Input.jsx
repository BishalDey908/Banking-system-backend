import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Input Field Component
 * 
 * @param {Object} props
 * @param {string} [props.label] - Optional field label above the input
 * @param {string} [props.error] - Validation error message to display
 * @param {string} [props.helperText] - Supplementary hint text below the input
 * @param {React.ReactNode} [props.leftIcon] - Icon placed inside the left edge of the input
 * @param {React.ReactNode} [props.rightElement] - Custom element placed at right edge
 * @param {string} [props.type='text'] - Standard input type ('text', 'password', 'email', 'number', etc.)
 * @param {string} [props.variant='default'] - Visual style ('default' or 'filled')
 * @param {boolean} [props.fullWidth=true] - Expand to full width
 * @param {string} [props.className=''] - Additional class names for input element
 * @param {string} [props.containerClassName=''] - Additional class names for outer container
 */
export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightElement,
  type = 'text',
  variant = 'default',
  fullWidth = true,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  id,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const variantStyles = {
    default:
      'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#3b82f6] dark:focus:border-[#3b82f6] focus:ring-[#3b82f6]/15',
    filled:
      'bg-slate-50 dark:bg-slate-900/90 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-[#3b82f6] dark:focus:border-[#3b82f6] focus:ring-[#3b82f6]/15',
  };

  return (
    <div className={cn('flex flex-col', fullWidth ? 'w-full' : 'inline-block', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full text-xs sm:text-sm rounded-xl border px-3.5 py-2.5 transition-all duration-150',
            'focus:outline-none focus:ring-2',
            'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : 'pl-3.5',
            (isPassword || rightElement) ? 'pr-11' : 'pr-3.5',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15 text-rose-900 bg-rose-50/20'
              : variantStyles[variant],
            className
          )}
          {...rest}
        />

        {/* Built-in password toggle */}
        {isPassword && !rightElement && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* Custom right element */}
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;

