import React from 'react';
import { useSelector } from 'react-redux';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Common Select Component powered by shadcn/ui Select
 */
export function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  leftIcon,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  className = '',
  id,
}) {
  const isRateLimited = useSelector((state) => state.ui?.rateLimit?.isRateLimited);
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const handleValueChange = (val) => {
    if (onChange) {
      // Provide standard event mock for form handlers
      onChange({
        target: {
          value: val,
          name: selectId,
        },
      });
    }
  };

  return (
    <div className="flex flex-col w-full">
      {label && (
        <Label
          htmlFor={selectId}
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
          <div className="absolute left-3.5 z-10 text-muted-foreground pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <ShadcnSelect
          value={value || ''}
          onValueChange={handleValueChange}
          disabled={disabled || isRateLimited}
        >
          <SelectTrigger
            id={selectId}
            className={cn(
              leftIcon && 'pl-10',
              error && 'border-destructive ring-destructive',
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent>
            {options.map((opt) => {
              const isObj = typeof opt === 'object' && opt !== null;
              const optVal = isObj ? opt.value : opt;
              const optLabel = isObj ? opt.label : opt;
              const optDisabled = isObj ? Boolean(opt.disabled) : false;

              return (
                <SelectItem
                  key={String(optVal)}
                  value={String(optVal)}
                  disabled={optDisabled}
                >
                  {optLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </ShadcnSelect>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export default Select;
