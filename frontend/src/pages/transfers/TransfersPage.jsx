import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowUpRight,
  History,
  Building2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Send,
  Zap,
  QrCode,
  Camera,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Alert } from '../../components/common/Alert';
import { sendTransfer, fetchTransactions } from '../../store/slices/transactionSlice';
import { fetchAccounts } from '../../store/slices/accountSlice';
import {
  setQrScannerModalOpen,
  setQrScannedData,
} from '../../store/slices/uiSlice';
import { maskAccountNumber, formatCurrency, formatDateShort } from '../../utils/formatters';
import { validateTransferAmount } from '../../utils/validators';
import { Avatar } from '../../components/common/Avatar';
import { useToast } from '../../hooks/useToast';

/**
 * Modern Fincheck Send Money View
 */
export function TransfersPage() {
  const dispatch = useDispatch();
  const { qrScannedData } = useSelector((state) => state.ui);
  const { accounts, activeAccountId, loading: accountsLoading } = useSelector((state) => state.accounts);
  const { items: transactions, loading: transactionsLoading } = useSelector((state) => state.transactions);
  const { showSuccess } = useToast();

  const [selectedAccountId, setSelectedAccountId] = useState(activeAccountId || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from QR Scanner
  useEffect(() => {
    if (qrScannedData) {
      if (qrScannedData.upiId) setRecipientAccount(qrScannedData.upiId);
      if (qrScannedData.name) setRecipientName(qrScannedData.name);
      if (qrScannedData.amount) setAmount(String(qrScannedData.amount));
      if (qrScannedData.note) setNote(qrScannedData.note);
      dispatch(setQrScannedData(null));
    }
  }, [qrScannedData, dispatch]);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const selectedAccount = accounts.find(
    (a) => a._id === (selectedAccountId || activeAccountId || accounts[0]?._id)
  );
  const availableBalance = typeof selectedAccount?.balance === 'number' ? selectedAccount.balance : 0;
  const currency = selectedAccount?.currency || 'INR';

  const accountOptions = accounts.map((acc) => ({
    value: acc._id,
    label: `${maskAccountNumber(acc._id)} (${acc.currency || 'INR'}) — Bal: ${formatCurrency(acc.balance || 0, acc.currency)}`,
  }));

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const recentTransfers = transactions
    .filter((t) => t.type === 'DEBIT')
    .slice(0, 5);

  const handleAddAmount = (val) => {
    const current = Number(amount) || 0;
    const next = Math.round((current + val) * 100) / 100;
    setAmount(String(next));
  };

  const handleSendAll = () => {
    if (availableBalance > 0) {
      setAmount(String(availableBalance));
    }
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
      setError('Please enter the recipient account number or UPI ID.');
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
        note: note.trim() || 'Wire Transfer',
      })
    );

    setIsSubmitting(false);

    if (sendTransfer.fulfilled.match(result)) {
      showSuccess(`Sent ${formatCurrency(numAmount, currency)} to ${recipientName}`);
      setRecipientName('');
      setRecipientAccount('');
      setAmount('');
      setNote('');
    } else {
      setError(result.payload || 'Transfer failed.');
    }
  };

  const popularHandles = ['@okhdfcbank', '@okicici', '@oksbi', '@paytm', '@ybl', '@upi'];

  const handleSelectUpiHandle = (handle) => {
    const raw = recipientAccount.trim();
    if (raw.includes('@')) {
      const prefix = raw.split('@')[0];
      setRecipientAccount(`${prefix}${handle}`);
    } else if (raw.length > 0) {
      setRecipientAccount(`${raw}${handle}`);
    } else if (recipientName.trim().length > 0) {
      const cleanName = recipientName.toLowerCase().replace(/\s+/g, '');
      setRecipientAccount(`${cleanName}${handle}`);
    } else {
      setRecipientAccount(handle);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Send Money
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fast, secure peer-to-peer, UPI ID, and wire bank transfers.
          </p>
        </div>

        {/* Scan with Camera Action Button */}
        <button
          type="button"
          onClick={() => dispatch(setQrScannerModalOpen(true))}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 border border-blue-200/80 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl shadow-xs transition-colors w-fit select-none cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Scan UPI QR Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Transfer Form Card */}
        <div className="lg:col-span-7">
          <Card padding="lg" className="rounded-2xl border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSend} className="space-y-5">
              {error && (
                <Alert
                  variant="danger"
                  title="Transfer could not be completed"
                  message={error}
                  onClose={() => setError('')}
                />
              )}

              {/* Source Account Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pay From
                </label>
                {accounts.length > 0 ? (
                  <Select
                    options={accountOptions}
                    value={selectedAccountId || activeAccountId || accounts[0]?._id}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                  />
                ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                      No active bank accounts found. Please open an account first.
                  </div>
                )}
                {selectedAccount && (
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5 px-1">
                    <span>Available Balance:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(availableBalance, currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Recipient Details */}
              <div className="space-y-3.5">
                <Input
                  label="Recipient Full Name"
                  placeholder="e.g. John Doe, Alex Smith"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <Input
                    label="Recipient Account ID or UPI ID"
                    placeholder="e.g. 68c71f... or alex@okaxis"
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    required
                  />

                  {/* Popular UPI handle chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] text-slate-400 mr-0.5">Popular handles:</span>
                    {popularHandles.map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => handleSelectUpiHandle(handle)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 transition-colors select-none"
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Amount ({currency})
                  </label>
                  {availableBalance > 0 && (
                    <button
                      type="button"
                      onClick={handleSendAll}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Send All ({formatCurrency(availableBalance, currency)})
                    </button>
                  )}
                </div>

                <Input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />

                {/* Quick Add Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                  <span className="text-[11px] text-slate-400 mr-1">Quick add:</span>
                  {quickAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddAmount(val)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors select-none"
                    >
                      +{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Memo */}
              <Input
                label="Transfer Note (Optional)"
                placeholder="e.g. Rent payment, Dinner split"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || accounts.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-sm select-none"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Processing Transfer...' : 'Confirm & Send Money'}</span>
              </button>
            </form>
          </Card>
        </div>

        {/* Right: Recent Transfers & Security Card */}
        <div className="lg:col-span-5 space-y-5">
          {/* Recent Wire Transfers */}
          <Card padding="md" className="rounded-2xl border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span>Recent Outgoing Transfers</span>
            </h3>

            {recentTransfers.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No outgoing transfers yet.
              </div>
            ) : (
                <div className="space-y-2 divide-y divide-slate-50 dark:divide-slate-800/60">
                  {recentTransfers.map((tx) => {
                    const name = tx.recipientName || tx.title || 'Wire Transfer';
                  return (
                    <div
                      key={tx._id || tx.id}
                      onClick={() => {
                        if (tx.recipientName) setRecipientName(tx.recipientName);
                        if (tx.recipientAccount) setRecipientAccount(tx.recipientAccount);
                      }}
                      className="pt-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 -mx-1.5 rounded-xl cursor-pointer transition-colors group"
                      title="Click to send money to this recipient again"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={name} size="sm" />
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[150px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {name}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {formatDateShort(tx.createdAt || tx.date)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
                        -{formatCurrency(tx.amount, tx.currency || currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Security Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">Automatic Protection Guarantee</span>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                If a transfer fails due to network or gateway errors, funds are automatically refunded back to your account balance with zero money lost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransfersPage;
