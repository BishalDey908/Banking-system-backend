import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Common Input Field Component powered by shadcn/ui
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

  return (
    <div className={cn('flex flex-col', fullWidth ? 'w-full' : 'inline-block', containerClassName)}>
      {label && (
        <Label
          htmlFor={inputId}
          className="text-xs font-semibold text-foreground/90 mb-1.5 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-destructive ml-0.5">*</span>}
          </span>
        </Label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-muted-foreground pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <ShadcnInput
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          required={required}
          error={Boolean(error)}
          className={cn(
            leftIcon ? 'pl-10' : 'pl-3.5',
            (isPassword || rightElement) ? 'pr-11' : 'pr-3.5',
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
            className="absolute right-3.5 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
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
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Input;
