import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowUpRight,
  History,
  QrCode,
  Smartphone,
  Building2,
  CheckCircle2,
  Camera,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Alert } from '../../components/common/Alert';
import { Skeleton } from '../../components/common/Skeleton';
import { MyUpiQrCard } from '../../components/banking/MyUpiQrCard';
import { sendTransfer, fetchTransactions } from '../../store/slices/transactionSlice';
import { setQrScannerModalOpen } from '../../store/slices/uiSlice';
import { maskAccountNumber, formatCurrency, formatDateShort } from '../../utils/formatters';
import { validateTransferAmount } from '../../utils/validators';
import { POPULAR_UPI_HANDLES, validateUpiId } from '../../utils/upi';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

/**
 * Modern Send Money View with UPI ID, QR Scanner, and Bank Transfers
 */
export function TransfersPage() {
  const dispatch = useDispatch();
  const { accounts, activeAccountId, loading: accountsLoading } = useSelector((state) => state.accounts);
  const { items: transactions, loading: transactionsLoading } = useSelector((state) => state.transactions);
  const { qrScannedData } = useSelector((state) => state.ui);
  const { showSuccess } = useToast();

  const [transferMethod, setTransferMethod] = useState('UPI'); // 'UPI' | 'BANK' | 'MY_QR'
  const [selectedAccountId, setSelectedAccountId] = useState(activeAccountId || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  // When a QR code is scanned via QrScannerModal, auto-populate fields
  useEffect(() => {
    if (qrScannedData) {
      setTransferMethod('UPI');
      if (qrScannedData.upiId) setRecipientAccount(qrScannedData.upiId);
      if (qrScannedData.name) setRecipientName(qrScannedData.name);
      if (qrScannedData.amount) setAmount(String(qrScannedData.amount));
      if (qrScannedData.note) setNote(qrScannedData.note);
    }
  }, [qrScannedData]);

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

  const handleAppendHandle = (handle) => {
    const base = recipientAccount.split('@')[0];
    setRecipientAccount(`${base || 'payee'}${handle}`);
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
      setError(transferMethod === 'UPI' ? 'Please enter a valid UPI ID.' : 'Please enter the bank account number.');
      return;
    }

    if (transferMethod === 'UPI' && !recipientAccount.includes('@')) {
      setError('Please enter a valid UPI ID ending with @bank (e.g. name@okhdfcbank).');
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
        note: note.trim() || (transferMethod === 'UPI' ? 'UPI Transfer' : 'Bank Transfer'),
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
          Pay instantly via UPI ID, camera QR Scanner, or direct bank transfer.
        </p>
      </div>

      {/* Payment Method Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setTransferMethod('UPI')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition-all',
            transferMethod === 'UPI'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pay with UPI & QR</span>
        </button>

        <button
          type="button"
          onClick={() => setTransferMethod('BANK')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition-all',
            transferMethod === 'BANK'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Bank Account</span>
        </button>

        <button
          type="button"
          onClick={() => setTransferMethod('MY_QR')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider font-mono transition-all',
            transferMethod === 'MY_QR'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>My QR Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form or My QR Card */}
        <div className="lg:col-span-7">
          {transferMethod === 'MY_QR' ? (
            // <MyUpiQrCard />
            <MyUpiQrCard
              accountId={selectedAccountId || activeAccountId}
              showAccountSelector={true}
            />
          ) : (
            <Card padding="lg">
              {/* Scan QR Hero Banner (in UPI mode) */}
              {transferMethod === 'UPI' && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white border border-emerald-800/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold tracking-tight">Scan Any UPI QR Code</h4>
                      <p className="text-xs text-slate-300">Point your camera or upload an image to pay</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => dispatch(setQrScannerModalOpen(true))}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Scan with Camera</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="space-y-5">
                {error && <Alert variant="danger" message={error} dismissible />}

                {/* Source Account */}
                {accountsLoading ? (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono block">
                      From Account
                    </span>
                    <Skeleton variant="rectangular" className="w-full h-10 rounded-lg" />
                  </div>
                ) : accountOptions.length > 0 ? (
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

                {/* Recipient Account / UPI ID */}
                <div>
                  <Input
                    label={transferMethod === 'UPI' ? 'Recipient UPI ID' : 'Recipient Account Number'}
                    placeholder={
                      transferMethod === 'UPI'
                        ? 'e.g. rahul@okaxis or 9876543210@paytm'
                        : 'e.g. 68c71f92e01b34a9'
                    }
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    required
                  />

                  {/* UPI Handle Quick Chips & Validation */}
                  {transferMethod === 'UPI' && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400 dark:text-slate-500">Popular bank handles:</span>
                        {validateUpiId(recipientAccount) && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid UPI Handle
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {POPULAR_UPI_HANDLES.map((handle) => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => handleAppendHandle(handle)}
                            className="px-2 py-0.5 rounded-md text-[11px] font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recipient Name */}
                <Input
                  label="Recipient Name"
                  placeholder="e.g. Rahul Sharma or Merchant Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />

                {/* Amount with Available Balance Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                      Amount (INR) <span className="text-rose-500">*</span>
                    </label>
                    {accountsLoading ? (
                      <Skeleton variant="text" className="w-28 h-3.5" />
                    ) : selectedAccount ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">
                          Available:{' '}
                          <strong className="font-mono text-slate-850 dark:text-slate-200">
                            {formatCurrency(availableBalance, selectedAccount.currency || 'INR')}
                          </strong>
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
                    ) : null}
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
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      Quick Add:
                    </span>
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
                  placeholder="What is this for? e.g. Dinner, rent, shopping"
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
                    {transferMethod === 'UPI' ? 'Pay with UPI Now' : 'Send to Bank Account'}
                  </Button>
                </div>
              </form>
            </Card>
          )}
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

            {transactionsLoading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton variant="text" className="w-28 h-3.5" />
                      <Skeleton variant="text" className="w-16 h-2.5" />
                    </div>
                    <Skeleton variant="text" className="w-16 h-4" />
                  </div>
                ))}
              </div>
            ) : recentTransfers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No recent transfer records found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {recentTransfers.slice(0, 5).map((tx) => {
                  const isUpi = tx.recipientAccount?.includes('@') || tx.title?.toLowerCase().includes('upi');

                  return (
                    <div key={tx._id || tx.id} className="py-2.5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-900 dark:text-slate-100 truncate block">
                            {tx.title}
                          </span>
                          {isUpi && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                              UPI
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          {formatDateShort(tx.createdAt || tx.date)}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 shrink-0">
                        -{formatCurrency(Math.abs(Number(tx.amount) || 0), tx.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TransfersPage;
