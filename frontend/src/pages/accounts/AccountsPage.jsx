import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Copy, Check, ArrowUpRight, ArrowDownLeft, Landmark, Wallet, QrCode } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
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

/**
 * Modern Fincheck Accounts Management Page
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Accounts & Portfolios
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your liquid checking and savings accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(setCreateAccountModalOpen(true))}
          className="flex items-center gap-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs select-none w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Account</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          variant="cyan"
          label="Total Liquid Balance"
          value={formatCurrency(totalBalance, currency)}
          change="Available across all accounts"
          icon={<Wallet className="w-4 h-4 text-white" />}
          loading={loading}
        />

        <StatCard
          variant="purple"
          label="Active Accounts"
          value={accounts.length}
          suffix="Registered"
          change="FDIC insured deposit limit"
          icon={<Landmark className="w-4 h-4 text-white" />}
          loading={loading}
        />

        <StatCard
          variant="blue"
          label="Active Account Balance"
          value={formatCurrency(activeAccount?.balance ?? 0, currency)}
          change="Primary selected account"
          icon={<ArrowUpRight className="w-4 h-4 text-white" />}
          loading={loading}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        {['ALL', 'ACTIVE', 'FROZEN', 'CLOSED'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === tab
              ? 'bg-[#3b82f6] text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
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
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Account Details & Actions
          </h3>

          {loading ? (
            <AccountDetailsSkeleton />
          ) : activeAccount ? (
              <Card padding="md" className="rounded-2xl border-slate-100 dark:border-slate-800 space-y-5">
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
              <div className="space-y-3 pt-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Account ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                      {activeAccount._id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyFullId(activeAccount._id)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                  <span className="text-slate-500 dark:text-slate-400">Account UPI ID</span>
                  <div className="flex items-center gap-1.5">
                      <span className="font-mono font-medium text-blue-600 dark:text-blue-400 truncate max-w-[150px] sm:max-w-[190px]">
                      {getAccountUpiId(activeAccount, user)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyUpi(getAccountUpiId(activeAccount, user))}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
                        className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                        title="Show Account QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Available Balance</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(activeAccount.balance ?? 0, activeAccount.currency || 'INR')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 dark:text-slate-400">Created Date</span>
                    <span className="text-slate-700 dark:text-slate-300">
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
                    leftIcon={<QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  onClick={() => {
                    dispatch(setReceiveQrAccountId(activeAccount._id));
                    dispatch(setReceiveQrModalOpen(true));
                  }}
                >
                    My QR
                </Button>
                <Button
                  variant="primary"
                    size="sm"
                    leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                  onClick={() => dispatch(setTransferModalOpen(true))}
                >
                    Transfer
                </Button>
              </div>
            </Card>
          ) : (
                <Card padding="lg" className="text-center py-12 rounded-2xl">
                  <p className="text-sm text-slate-500">No account selected</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountsPage;
