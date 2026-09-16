import React from 'react';
// import { Landmark, Plus, Copy, Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Landmark, Plus, Copy, Check, QrCode } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { AccountCardSkeleton } from '../common/Skeleton';
import { setReceiveQrModalOpen, setReceiveQrAccountId } from '../../store/slices/uiSlice';
import { maskAccountNumber, formatDateShort, formatCurrency } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

/**
 * Clean & Simple Accounts List Component
 */
export function AccountList({
  accounts = [],
  activeAccountId,
  onSelectAccount,
  onCreateClick,
  loading = false,
  className = '',
}) {
  const dispatch = useDispatch();
  const { showSuccess } = useToast();
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showSuccess('Account ID copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status = 'ACTIVE') => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return <Badge variant="emerald" dot size="sm">Active</Badge>;
      case 'FROZEN':
        return <Badge variant="amber" dot size="sm">Frozen</Badge>;
      case 'CLOSED':
        return <Badge variant="rose" size="sm">Closed</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
        <AccountCardSkeleton />
        <AccountCardSkeleton />
      </div>
    );
  }

  if (!loading && accounts.length === 0) {
    return (
      <EmptyState
        icon={<Landmark className="w-6 h-6 text-slate-500 dark:text-slate-400" />}
        title="No Accounts Yet"
        description="You don't have any bank accounts opened yet. Click below to open one in seconds."
        action={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onCreateClick}
          >
            Open an Account
          </Button>
        }
        className={className}
      />
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {accounts.map((acc) => {
        const isSelected = acc._id === activeAccountId;

        return (
          <Card
            key={acc._id}
            padding="md"
            onClick={() => onSelectAccount && onSelectAccount(acc._id)}
            className={cn(
              'relative cursor-pointer transition-all border',
              isSelected
                ? 'border-slate-900 dark:border-emerald-500 ring-1 ring-slate-900 dark:ring-emerald-500 bg-slate-50/50 dark:bg-slate-800/60 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/30 dark:hover:bg-slate-800/30'
            )}
          >
            {/* Header: Icon, ID & Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  )}
                >
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
                      {maskAccountNumber(acc._id)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, acc._id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
                      title="Copy Account ID"
                    >
                      {copiedId === acc._id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setReceiveQrAccountId(acc._id));
                        dispatch(setReceiveQrModalOpen(true));
                      }}
                      className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-0.5 rounded transition-colors"
                      title="Show Receiver QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-mono">
                    Opened {formatDateShort(acc.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="slate" size="sm">{acc.currency || 'INR'}</Badge>
                {getStatusBadge(acc.status)}
              </div>
            </div>

            {/* Middle Row: Live Account Balance */}
            <div className="mt-3 mb-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 dark:text-slate-500 block">
                Available Balance
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                {formatCurrency(acc.balance ?? 0, acc.currency || 'INR')}
              </span>
            </div>

            {/* Bottom Row */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Account Status
              </span>
              <span
                className={cn(
                  'font-medium text-xs',
                  isSelected
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {isSelected ? '✓ Selected' : 'Click to select'}
              </span>
            </div>
          </Card>
        );
      })}

      {/* Quick Add Button */}
      {onCreateClick && (
        <button
          type="button"
          onClick={onCreateClick}
          className="h-full min-h-[110px] rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-5 flex flex-col items-center justify-center text-center transition-all group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-1.5 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Open Another Account</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Free & Instant</span>
        </button>
      )}
    </div>
  );
}

export default AccountList;
