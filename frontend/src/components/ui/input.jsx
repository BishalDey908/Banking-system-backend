import * as React from 'react';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(
  ({ className, type, disabled = false, error, ...props }, ref) => {
    const isRateLimited = useSelector(
      (state) => state.ui?.rateLimit?.isRateLimited
    );

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-solid border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-2xs font-sans',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        disabled={disabled || isRateLimited}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
