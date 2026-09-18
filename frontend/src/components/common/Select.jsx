import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Select Component
 * 
 * @param {Object} props
 * @param {string} [props.label] - Field label above select
 * @param {Array<{ value: string, label: string } | string>} props.options - Selectable options
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Event handler
 * @param {string} [props.error] - Validation error message
 * @param {string} [props.helperText] - Subtitle helper text
 * @param {React.ReactNode} [props.leftIcon] - Icon placed on the left
 * @param {string} [props.placeholder] - Default unselected label
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.required=false]
 * @param {string} [props.className='']
 */
export function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  leftIcon,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  id,
  ...rest
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label
          htmlFor={selectId}
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

        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full appearance-none bg-white dark:bg-slate-800 text-xs sm:text-sm rounded-xl border px-3.5 py-2.5 transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:border-[#3b82f6] dark:focus:border-[#3b82f6] focus:ring-[#3b82f6]/15',
            'disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer',
            leftIcon ? 'pl-10' : 'pl-3.5',
            'pr-10',
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/15 text-rose-900 bg-rose-50/20'
              : 'border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100',
            className
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((opt) => {
            const isObj = typeof opt === 'object' && opt !== null;
            const optVal = isObj ? opt.value : opt;
            const optLabel = isObj ? opt.label : opt;
            const optDisabled = isObj ? Boolean(opt.disabled) : false;

            return (
              <option key={optVal} value={optVal} disabled={optDisabled}>
                {optLabel}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3.5 text-slate-400 pointer-events-none flex items-center">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Select;

