import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Copy, Check } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { AccountList } from '../../components/banking/AccountList';
import { BankCard } from '../../components/banking/BankCard';
import { setCreateAccountModalOpen, setTransferModalOpen } from '../../store/slices/uiSlice';
import { setActiveAccount } from '../../store/slices/accountSlice';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

/**
 * Clean & Simple Accounts Management Page
 */
export function AccountsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { accounts, activeAccountId, loading } = useSelector((state) => state.accounts);
  const { showSuccess } = useToast();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(false);

  const activeAccount =
    accounts.find((a) => a._id === activeAccountId) || accounts[0] || null;

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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            My Accounts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View all your bank accounts and manage their details.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => dispatch(setCreateAccountModalOpen(true))}
        >
          Open New Account
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        {['ALL', 'ACTIVE', 'FROZEN', 'CLOSED'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider font-mono transition-colors ${
              statusFilter === tab
                ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-xs'
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
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono block">
            Account Details
          </span>

          {activeAccount ? (
            <Card padding="md" className="space-y-5">
              {/* Virtual Card Preview */}
              <div className="flex justify-center">
                <BankCard
                  accountId={activeAccount._id}
                  cardholderName={user?.name || 'Account Holder'}
                  currency={activeAccount.currency || 'INR'}
                  theme="emerald"
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
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                  <span className="text-slate-500 dark:text-slate-400">Currency</span>
                  <Badge variant="slate" size="sm">{activeAccount.currency || 'INR'}</Badge>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Status</span>
                  <Badge variant="emerald" dot size="sm">
                    {activeAccount.status || 'ACTIVE'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Date Opened</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {formatDate(activeAccount.createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => dispatch(setTransferModalOpen(true))}
                >
                  Send Money from This Account
                </Button>
              </div>
            </Card>
          ) : (
            <Card padding="md" className="text-center text-slate-400 dark:text-slate-500 py-12 text-xs">
              Select or open an account to see its details.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountsPage;
