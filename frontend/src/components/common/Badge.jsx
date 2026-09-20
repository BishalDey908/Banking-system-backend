import React from 'react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Common Badge component powered by shadcn/ui Badge
 */
export function Badge({
  variant = 'emerald',
  size = 'md',
  dot = false,
  dotPulse = false,
  className = '',
  children,
}) {
  const variantMap = {
    emerald: 'success',
    amber: 'warning',
    rose: 'destructive',
    slate: 'secondary',
    blue: 'info',
    neutral: 'secondary',
    default: 'default',
    outline: 'outline',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
  };

  const dotColorStyles = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
    blue: 'bg-blue-500',
    neutral: 'bg-neutral-500',
    default: 'bg-primary',
    outline: 'bg-foreground',
  };

  const shadcnVariant = variantMap[variant] || 'default';

  return (
    <ShadcnBadge
      variant={shadcnVariant}
      className={cn(
        'uppercase font-mono tracking-wide select-none',
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0 mr-1">
          {dotPulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColorStyles[variant] || 'bg-primary'
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-1.5 w-1.5',
              dotColorStyles[variant] || 'bg-primary'
            )}
          />
        </span>
      )}
      <span>{children}</span>
    </ShadcnBadge>
  );
}

export default Badge;
