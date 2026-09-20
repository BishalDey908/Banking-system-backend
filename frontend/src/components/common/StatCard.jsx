import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Authentic shadcn/ui Metric Card
 */
export function StatCard({
  label,
  value,
  prefix,
  suffix,
  change,
  changeType = 'neutral',
  icon,
  subtitle,
  onClick,
  className = '',
  loading = false,
  variant, // Kept for backwards-compatibility
}) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  // Determine trend direction if not explicitly set
  let resolvedChangeType = changeType;
  if (changeType === 'neutral' && change) {
    if (change.includes('+') || change.includes('↗')) {
      resolvedChangeType = 'positive';
    } else if (change.includes('-') || change.includes('↘')) {
      resolvedChangeType = 'negative';
    }
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        'transition-all duration-200 shadow-xs hover-lift',
        Boolean(onClick) && 'cursor-pointer hover:border-primary/50',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground shrink-0 [&_svg]:h-4 [&_svg]:w-4">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {prefix}{value}{suffix}
        </div>
        {(change || subtitle) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            {change && (
              <span
                className={cn(
                  'font-medium inline-flex items-center gap-0.5',
                  resolvedChangeType === 'positive' && 'text-emerald-600 dark:text-emerald-400',
                  resolvedChangeType === 'negative' && 'text-rose-600 dark:text-rose-400',
                  resolvedChangeType === 'neutral' && 'text-muted-foreground'
                )}
              >
                {resolvedChangeType === 'positive' && <TrendingUp className="w-3 h-3" />}
                {resolvedChangeType === 'negative' && <TrendingDown className="w-3 h-3" />}
                {change}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
