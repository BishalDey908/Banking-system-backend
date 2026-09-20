import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Landmark, Plus, Copy, Check, QrCode } from 'lucide-react';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { AccountCardSkeleton } from '../common/Skeleton';
import { maskAccountNumber, formatCurrency } from '../../utils/formatters';
import { getAccountUpiId } from '../../utils/upi';
import {
  setReceiveQrAccountId,
  setReceiveQrModalOpen,
} from '../../store/slices/uiSlice';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

/**
 * Modern Fincheck Account Cards List
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
  const { user } = useSelector((state) => state.auth);
  const { showSuccess } = useToast();
  const [copiedId, setCopiedId] = React.useState(null);
  const [copiedUpi, setCopiedUpi] = React.useState(null);

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showSuccess('Account ID copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyUpi = (e, upi) => {
    e.stopPropagation();
    navigator.clipboard.writeText(upi);
    setCopiedUpi(upi);
    showSuccess('Receiver UPI ID copied');
    setTimeout(() => setCopiedUpi(null), 2000);
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
        icon={<Landmark className="w-8 h-8 text-primary" />}
        title="No Accounts Opened"
        description="Open your first bank account to deposit money, receive transfers, and track your ledger."
        action={
          <button
            type="button"
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Open Account</span>
          </button>
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
          <div
            key={acc._id}
            onClick={() => onSelectAccount && onSelectAccount(acc._id)}
            className={cn(
              'p-5 rounded-2xl cursor-pointer transition-all duration-200 select-none relative overflow-hidden',
              'bg-card border',
              isSelected
                ? 'border-primary ring-2 ring-primary/20 shadow-md shadow-primary/5'
                : 'border-card-border hover:border-card-hover-border shadow-sm'
            )}
          >
            {/* Top row: Icon, Account Number, Status Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0',
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-primary-subtle text-primary'
                  )}
                >
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-txt-heading">
                      {maskAccountNumber(acc._id)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(e, acc._id)}
                      className="text-txt-muted hover:text-txt-main p-0.5 cursor-pointer"
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
                      className="text-txt-muted hover:text-primary p-0.5 transition-colors cursor-pointer"
                      title="View UPI QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-primary font-mono mt-0.5">
                    <span className="truncate max-w-[130px] sm:max-w-[170px]">
                      {getAccountUpiId(acc, user)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyUpi(e, getAccountUpiId(acc, user))}
                      className="text-txt-muted hover:text-txt-main p-0.5 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi === getAccountUpiId(acc, user) ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status and Currency Pills */}
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-card-elevated text-txt-main">
                  {acc.currency || 'INR'}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Active</span>
                </span>
              </div>
            </div>

            {/* Middle row: Available Balance */}
            <div className="pt-2 border-t border-card-border">
              <span className="text-[11px] text-txt-muted block">
                Available Balance
              </span>
              <span className="text-lg sm:text-xl font-bold text-txt-main tabular-nums">
                {formatCurrency(acc.balance ?? 0, acc.currency || 'INR')}
              </span>
            </div>

            {/* Selection indicator pill at bottom right */}
            {isSelected && (
              <div className="mt-3 flex items-center justify-end">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Check className="w-3 h-3" />
                  <span>Selected</span>
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Open Another Account Button Card */}
      <div
        onClick={onCreateClick}
        className="p-5 rounded-2xl border border-dashed border-card-border hover:border-primary bg-card-elevated/40 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group min-h-[140px]"
      >
        <div className="w-9 h-9 rounded-xl bg-card shadow-2xs flex items-center justify-center text-txt-muted group-hover:text-primary group-hover:scale-105 transition-all mb-2">
          <Plus className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-txt-main group-hover:text-primary transition-colors">
          Open Another Account
        </span>
        <span className="text-[11px] text-txt-muted mt-0.5">
          Instant & Free
        </span>
      </div>
    </div>
  );
}

export default AccountList;
