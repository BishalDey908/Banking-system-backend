import React from 'react';
import { Card as ShadcnCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Common Card component powered by shadcn/ui
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
    default: 'bg-card border-border shadow-xs',
    elevated: 'bg-card border-border shadow-md',
    outlined: 'bg-transparent border-border',
    glass: 'bg-card/80 backdrop-blur-md border-border/60 shadow-xs',
    dark: 'bg-slate-900 border-slate-800 text-white shadow-xl',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const isInteractive = Boolean(onClick) || hoverable;

  return (
    <ShadcnCard
      onClick={onClick}
      className={cn(
        'rounded-2xl overflow-hidden transition-all duration-200',
        variantStyles[variant],
        isInteractive && 'cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-[0.99]',
        className
      )}
      {...rest}
    >
      {header && (
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          {header}
        </div>
      )}

      <div className={paddingStyles[padding]}>{children}</div>

      {footer && (
        <div className="px-5 py-3.5 border-t border-border flex items-center justify-between">
          {footer}
        </div>
      )}
    </ShadcnCard>
  );
}

export default Card;
