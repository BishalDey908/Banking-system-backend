import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Copy, Check, ArrowUpRight, ArrowDownLeft, Landmark, Wallet, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '../../components/common/StatCard';
import { AccountList } from '../../components/banking/AccountList';
import { BankCard } from '../../components/banking/BankCard';
import { AccountDetailsSkeleton } from '../../components/common/Skeleton';
import {
  setCreateAccountModalOpen,
  setTransferModalOpen,
  setDepositModalOpen,
  setReceiveQrModalOpen,
  setReceiveQrAccountId,
} from '../../store/slices/uiSlice';
import { fetchAccounts, setActiveAccount } from '../../store/slices/accountSlice';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { getAccountUpiId } from '../../utils/upi';
import { useToast } from '../../hooks/useToast';
import { cn } from '@/lib/utils';

/**
 * Modern Fincheck Accounts Management Page powered by shadcn/ui
 */
export function AccountsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { accounts, activeAccountId, loading } = useSelector((state) => state.accounts);
  const { showSuccess } = useToast();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const activeAccount =
    accounts.find((a) => a._id === activeAccountId) || accounts[0] || null;

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
  }, [accounts]);

  const currency = activeAccount?.currency || 'INR';

  const filteredAccounts = accounts.filter((acc) => {
    if (statusFilter === 'ALL') return true;
    return (acc.status || 'ACTIVE').toUpperCase() === statusFilter;
  });

  const handleCopyFullId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    showSuccess('Account ID copied');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyUpi = (upiId) => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showSuccess('Receiver UPI ID copied');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-heading">
            Accounts & Portfolios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your liquid checking and savings accounts.
          </p>
        </div>

        <Button
          onClick={() => dispatch(setCreateAccountModalOpen(true))}
          className="gap-1.5 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Account</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          label="Total Liquid Balance"
          value={formatCurrency(totalBalance, currency)}
          change="Available across all accounts"
          icon={<Wallet className="w-4 h-4" />}
          loading={loading}
        />

        <StatCard
          label="Active Accounts"
          value={accounts.length}
          suffix=" Registered"
          change="FDIC insured deposit limit"
          icon={<Landmark className="w-4 h-4" />}
          loading={loading}
        />

        <StatCard
          label="Active Account Balance"
          value={formatCurrency(activeAccount?.balance ?? 0, currency)}
          change="Primary selected account"
          icon={<ArrowUpRight className="w-4 h-4" />}
          loading={loading}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {['ALL', 'ACTIVE', 'FROZEN', 'CLOSED'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer',
              statusFilter === tab
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {tab === 'ALL' ? 'All Accounts' : tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Accounts List & Selected Account Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Accounts List */}
        <div className="lg:col-span-7 space-y-4">
          <AccountList
            accounts={filteredAccounts}
            activeAccountId={activeAccountId}
            onSelectAccount={(id) => dispatch(setActiveAccount(id))}
            onCreateClick={() => dispatch(setCreateAccountModalOpen(true))}
            loading={loading}
          />
        </div>

        {/* Right: Selected Account Details */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground font-heading">
            Account Details & Actions
          </h3>

          {loading ? (
            <AccountDetailsSkeleton />
          ) : activeAccount ? (
            <Card className="p-6 space-y-5">
              {/* Virtual Card Preview */}
              <div className="flex justify-center">
                <BankCard
                  accountId={activeAccount._id}
                  cardholderName={user?.name || 'Account Holder'}
                  currency={activeAccount.currency || 'INR'}
                  theme="obsidian"
                />
              </div>

              {/* Details List */}
              <div className="space-y-3 pt-2 text-xs divide-y divide-border">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Account ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-foreground">
                      {activeAccount._id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyFullId(activeAccount._id)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Copy ID"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Account UPI ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-primary truncate max-w-[150px] sm:max-w-[190px]">
                      {getAccountUpiId(activeAccount, user)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyUpi(getAccountUpiId(activeAccount, user))}
                      className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Copy Receiver UPI ID"
                    >
                      {copiedUpi ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(setReceiveQrAccountId(activeAccount._id));
                        dispatch(setReceiveQrModalOpen(true));
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                      title="Show Account QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Available Balance</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(activeAccount.balance ?? 0, activeAccount.currency || 'INR')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Created Date</span>
                  <span className="text-foreground">
                    {formatDate(activeAccount.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowDownLeft className="w-3.5 h-3.5" />}
                  onClick={() => dispatch(setDepositModalOpen(true))}
                >
                  Deposit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<QrCode className="w-3.5 h-3.5 text-primary" />}
                  onClick={() => {
                    dispatch(setReceiveQrAccountId(activeAccount._id));
                    dispatch(setReceiveQrModalOpen(true));
                  }}
                >
                  My QR
                </Button>
                <Button
                  size="sm"
                  leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  onClick={() => dispatch(setTransferModalOpen(true))}
                >
                  Transfer
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <p className="text-sm text-muted-foreground">No account selected</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountsPage;
