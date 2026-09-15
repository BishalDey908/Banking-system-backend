import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpRight, History } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Alert } from '../../components/common/Alert';
import { sendTransfer } from '../../store/slices/transactionSlice';
import { maskAccountNumber, formatCurrency, formatDateShort } from '../../utils/formatters';
import { validateTransferAmount } from '../../utils/validators';
import { useToast } from '../../hooks/useToast';

/**
 * Clean & Simple Send Money View
 */
export function TransfersPage() {
  const dispatch = useDispatch();
  const { accounts, activeAccountId } = useSelector((state) => state.accounts);
  const { items: transactions } = useSelector((state) => state.transactions);
  const { showSuccess } = useToast();

  const [selectedAccountId, setSelectedAccountId] = useState(activeAccountId || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountOptions = accounts.map((acc) => ({
    value: acc._id,
    label: `${maskAccountNumber(acc._id)} (${acc.currency || 'INR'}) — Bal: ${formatCurrency(acc.balance || 0, acc.currency)}`,
  }));

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const recentTransfers = transactions.filter((t) => t.category === 'Transfer' || t.type === 'DEBIT');

  const selectedAccount = accounts.find((a) => a._id === (selectedAccountId || activeAccountId || accounts[0]?._id));
  const availableBalance = typeof selectedAccount?.balance === 'number' ? selectedAccount.balance : 0;

  const handleAddAmount = (val) => {
    const current = Number(amount) || 0;
    const next = Math.round((current + val) * 100) / 100;
    setAmount(String(next));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');

    const fromAccount = selectedAccountId || activeAccountId || accounts[0]?._id;
    if (!fromAccount) {
      setError('Please select an account to send money from.');
      return;
    }

    if (!recipientName.trim()) {
      setError('Please enter the recipient name.');
      return;
    }
    if (!recipientAccount.trim()) {
      setError('Please enter the account number or UPI ID.');
      return;
    }

    if (recipientAccount.trim() === fromAccount) {
      setError('Cannot transfer money to the same bank account.');
      return;
    }

    const validation = validateTransferAmount(amount, availableBalance);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    const numAmount = Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

    setIsSubmitting(true);

    const result = await dispatch(
      sendTransfer({
        fromAccountId: fromAccount,
        recipientName: recipientName.trim(),
        recipientAccount: recipientAccount.trim(),
        amount: numAmount,
        note: note.trim(),
      })
    );

    setIsSubmitting(false);

    if (sendTransfer.fulfilled.match(result)) {
      showSuccess(`Sent ${formatCurrency(numAmount)} to ${recipientName}`);
      setRecipientName('');
      setRecipientAccount('');
      setAmount('');
      setNote('');
    } else {
      setError(result.payload || 'Transfer failed.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Send Money
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Transfer money instantly to any bank account or UPI ID.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Transfer Form Panel */}
        <div className="lg:col-span-7">
          <Card padding="lg">
            <form onSubmit={handleSend} className="space-y-5">
              {error && <Alert variant="danger" message={error} dismissible />}

              {/* Source Account */}
              {accountOptions.length > 0 ? (
                <Select
                  label="From Account"
                  options={accountOptions}
                  value={selectedAccountId || activeAccountId || ''}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                />
              ) : (
                <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  Please open an account first before sending money.
                </div>
              )}

              {/* Recipient info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Recipient Name"
                  placeholder="e.g. Rahul Sharma"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
                <Input
                  label="Account Number or UPI ID"
                  placeholder="e.g. 9876543210 or name@upi"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  required
                />
              </div>

              {/* Amount with Available Balance Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                    Amount (INR) <span className="text-rose-500">*</span>
                  </label>
                  {selectedAccount && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Available: <strong className="font-mono text-slate-850 dark:text-slate-200">{formatCurrency(availableBalance, selectedAccount.currency || 'INR')}</strong>
                      </span>
                      {availableBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setAmount(String(availableBalance))}
                          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Send All
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <Input
                  type="number"
                  min="0.01"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  leftIcon={<span className="text-xs font-mono font-bold">₹</span>}
                  required
                />

                {/* Quick add chips */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Quick Add:</span>
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleAddAmount(q)}
                      className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 transition-colors"
                    >
                      +₹{q.toLocaleString('en-IN')}
                    </button>
                  ))}
                  {amount && Number(amount) > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="px-2 py-1 rounded-md text-xs font-mono text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-auto"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Note */}
              <Input
                label="Note (Optional)"
                placeholder="What is this for? e.g. Dinner, rent"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                >
                  Send Money Now
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Recent Transfers */}
        <div className="lg:col-span-5 space-y-4">
          <Card padding="md">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Recent Transfers
              </span>
              <History className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentTransfers.slice(0, 5).map((tx) => (
                <div key={tx._id || tx.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-900 dark:text-slate-100 block">{tx.title}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      {formatDateShort(tx.createdAt || tx.date)}
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    -{formatCurrency(Math.abs(Number(tx.amount) || 0), tx.currency)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TransfersPage;
