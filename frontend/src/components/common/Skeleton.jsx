import React from 'react';
import { Skeleton as ShadcnSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Common Skeleton Placeholder powered by shadcn/ui Skeleton
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
}) {
  const variantStyles = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <ShadcnSkeleton
      style={{ width, height }}
      className={cn(variantStyles[variant], className)}
    />
  );
}

/**
 * Skeleton Loader matching StatCard component
 */
export function StatCardSkeleton({ className = '' }) {
  return (
    <div
      className={cn(
        'p-5 sm:p-6 rounded-2xl border border-border bg-card flex flex-col justify-between relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <Skeleton variant="text" className="w-24 h-3.5" />
        <Skeleton variant="rectangular" className="w-8 h-8 rounded-lg shrink-0" />
      </div>
      <div>
        <Skeleton variant="text" className="w-32 sm:w-36 h-8 rounded-md mb-2" />
        <div className="mt-3 flex items-center gap-2">
          <Skeleton variant="rectangular" className="w-16 h-5 rounded-full" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader matching BankCard component
 */
export function BankCardSkeleton({ className = '' }) {
  return (
    <div
      className={cn(
        'relative w-full max-w-sm aspect-[1.586/1] rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden',
        'shadow-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 select-none',
        className
      )}
    >
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />

      {/* Top row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" className="w-6 h-6 rounded-md bg-white/15" />
          <Skeleton variant="text" className="w-20 h-3 bg-white/15" />
        </div>
        <Skeleton variant="rectangular" className="w-12 h-5 rounded bg-white/10" />
      </div>

      {/* Middle */}
      <div className="relative z-10 my-auto pt-2">
        <Skeleton variant="rectangular" className="w-10 h-7 rounded-md bg-white/20 mb-4" />
        <Skeleton variant="text" className="w-48 h-5 rounded bg-white/15" />
      </div>

      {/* Bottom row */}
      <div className="relative z-10 flex items-end justify-between text-xs pt-2">
        <div className="space-y-1.5">
          <Skeleton variant="text" className="w-14 h-2.5 bg-white/10" />
          <Skeleton variant="text" className="w-28 h-4 bg-white/15" />
        </div>
        <div className="flex items-center gap-4">
          <div className="space-y-1.5">
            <Skeleton variant="text" className="w-10 h-2.5 bg-white/10" />
            <Skeleton variant="text" className="w-12 h-3.5 bg-white/15" />
          </div>
          <div className="space-y-1.5">
            <Skeleton variant="text" className="w-8 h-2.5 bg-white/10" />
            <Skeleton variant="text" className="w-8 h-3.5 bg-white/15" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader matching AccountList card
 */
export function AccountCardSkeleton({ className = '' }) {
  return (
    <div
      className={cn(
        'p-4 sm:p-5 rounded-xl border border-border bg-card shadow-xs',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Skeleton variant="rectangular" className="w-9 h-9 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton variant="text" className="w-28 h-4" />
            <Skeleton variant="text" className="w-20 h-2.5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" className="w-10 h-5 rounded-full" />
          <Skeleton variant="rectangular" className="w-14 h-5 rounded-full" />
        </div>
      </div>
      <div className="mt-3 mb-2 pt-2 border-t border-border space-y-1.5">
        <Skeleton variant="text" className="w-24 h-2.5" />
        <Skeleton variant="text" className="w-32 h-6" />
      </div>
      <div className="pt-2 border-t border-border flex items-center justify-between">
        <Skeleton variant="text" className="w-20 h-3" />
        <Skeleton variant="text" className="w-16 h-3" />
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for a single transaction row in TransactionTable
 */
export function TransactionRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="py-3.5 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" className="w-8 h-8 rounded-lg shrink-0" />
          <div className="space-y-1">
            <Skeleton variant="text" className="w-28 sm:w-36 h-4" />
            <Skeleton variant="text" className="w-20 h-2.5 sm:hidden" />
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4 hidden md:table-cell">
        <Skeleton variant="text" className="w-20 h-3.5" />
      </td>

      <td className="py-3.5 px-4 hidden sm:table-cell">
        <Skeleton variant="text" className="w-16 h-3.5" />
      </td>

      <td className="py-3.5 px-4 hidden lg:table-cell">
        <Skeleton variant="text" className="w-24 h-3.5" />
      </td>

      <td className="py-3.5 px-4">
        <Skeleton variant="rectangular" className="w-16 h-5 rounded-full" />
      </td>

      <td className="py-3.5 px-4 sm:px-6 text-right">
        <div className="flex flex-col items-end gap-1">
          <Skeleton variant="text" className="w-20 h-4" />
          <Skeleton variant="text" className="w-16 h-2.5" />
        </div>
      </td>
    </tr>
  );
}

/**
 * Skeleton Loader for Account Details Panel (AccountsPage right column)
 */
export function AccountDetailsSkeleton({ className = '' }) {
  return (
    <div
      className={cn(
        'p-4 sm:p-5 rounded-xl border border-border bg-card space-y-5',
        className
      )}
    >
      <div className="flex justify-center">
        <BankCardSkeleton />
      </div>
      <div className="space-y-3 pt-2 divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between pt-2">
            <Skeleton variant="text" className="w-24 h-3.5" />
            <Skeleton variant="text" className="w-28 h-3.5" />
          </div>
        ))}
      </div>
      <div className="pt-2">
        <Skeleton variant="rectangular" className="w-full h-10 rounded-lg" />
      </div>
    </div>
  );
}

export default Skeleton;
