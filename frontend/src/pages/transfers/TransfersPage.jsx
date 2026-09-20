import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  History,
  ShieldCheck,
  Send,
  Camera,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/common/Select';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/common/Avatar';
import { sendTransfer, fetchTransactions } from '../../store/slices/transactionSlice';
import { fetchAccounts } from '../../store/slices/accountSlice';
import {
  setQrScannerModalOpen,
  setQrScannedData,
} from '../../store/slices/uiSlice';
import { maskAccountNumber, formatCurrency, formatDateShort } from '../../utils/formatters';
import { validateTransferAmount } from '../../utils/validators';
import { useToast } from '../../hooks/useToast';
import { cn } from '@/lib/utils';

/**
 * Modern Fincheck Send Money View powered by shadcn/ui
 */
export function TransfersPage() {
  const dispatch = useDispatch();
  const { qrScannedData } = useSelector((state) => state.ui);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-heading">
            Send Money
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fast, secure peer-to-peer, UPI ID, and wire bank transfers.
          </p>
        </div>

        <Button
          variant="subtle"
          onClick={() => dispatch(setQrScannerModalOpen(true))}
          className="gap-2 w-fit"
        >
          <Camera className="w-4 h-4" />
          <span>Scan UPI QR Code</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Transfer Form Card */}
        <div className="lg:col-span-7">
          <Card className="p-6">
            <form onSubmit={handleSend} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <div>{error}</div>
                </Alert>
              )}

              {/* Source Account Selector */}
              <div>
                <Label className="block mb-1.5">
                  Pay From
                </Label>
                {accounts.length > 0 ? (
                  <Select
                    options={accountOptions}
                    value={selectedAccountId || activeAccountId || accounts[0]?._id}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                  />
                ) : (
                  <div className="p-3 bg-amber-500/10 rounded-xl text-xs text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    No active bank accounts found. Please open an account first.
                  </div>
                )}
                {selectedAccount && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5 px-1">
                    <span>Available Balance:</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(availableBalance, currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Recipient Details */}
              <div className="space-y-3.5">
                <div>
                  <Label htmlFor="recip-name" className="block mb-1.5">
                    Recipient Full Name
                  </Label>
                  <Input
                    id="recip-name"
                    placeholder="e.g. John Doe, Alex Smith"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recip-account" className="block mb-1.5">
                    Recipient Account ID or UPI ID
                  </Label>
                  <Input
                    id="recip-account"
                    placeholder="e.g. 68c71f... or alex@okaxis"
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    required
                  />

                  {/* Popular UPI handle chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-muted-foreground mr-0.5">Popular handles:</span>
                    {popularHandles.map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => handleSelectUpiHandle(handle)}
                        className="px-2 py-0.5 rounded-lg bg-muted hover:bg-primary/15 hover:text-primary border border-border text-[11px] font-mono text-foreground transition-all duration-200 hover:scale-105 active:scale-95 select-none cursor-pointer"
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
                  <Label htmlFor="tx-amount">
                    Amount ({currency})
                  </Label>
                  {availableBalance > 0 && (
                    <button
                      type="button"
                      onClick={handleSendAll}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer transition-colors"
                    >
                      Send All ({formatCurrency(availableBalance, currency)})
                    </button>
                  )}
                </div>

                <Input
                  id="tx-amount"
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
                  <span className="text-[11px] text-muted-foreground mr-1">Quick add:</span>
                  {quickAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddAmount(val)}
                      className="px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/15 hover:text-primary border border-border text-xs font-medium text-foreground transition-all duration-200 hover:scale-105 active:scale-95 select-none cursor-pointer"
                    >
                      +{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Memo */}
              <div>
                <Label htmlFor="tx-note" className="block mb-1.5">
                  Transfer Note (Optional)
                </Label>
                <Input
                  id="tx-note"
                  placeholder="e.g. Rent payment, Dinner split"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={accounts.length === 0}
                className="w-full h-11 text-sm font-medium"
                leftIcon={<Send className="w-4 h-4" />}
              >
                Confirm & Send Money
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Recent Transfers & Security Card */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 font-heading">
              <History className="w-4 h-4 text-muted-foreground" />
              <span>Recent Outgoing Transfers</span>
            </h3>

            {recentTransfers.length === 0 ? (
              <div className="py-6 text-center text-muted-foreground text-xs">
                No outgoing transfers yet.
              </div>
            ) : (
              <div className="space-y-2 divide-y divide-border">
                {recentTransfers.map((tx) => {
                  const name = tx.recipientName || tx.title || 'Wire Transfer';
                  return (
                    <div
                      key={tx._id || tx.id}
                      onClick={() => {
                        if (tx.recipientName) setRecipientName(tx.recipientName);
                        if (tx.recipientAccount) setRecipientAccount(tx.recipientAccount);
                      }}
                      className="pt-2 flex items-center justify-between text-xs hover:bg-muted/50 p-1.5 -mx-1.5 rounded-xl cursor-pointer transition-colors group"
                      title="Click to send money to this recipient again"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={name} size="sm" />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground block truncate max-w-[150px] group-hover:text-primary transition-colors">
                            {name}
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            {formatDateShort(tx.createdAt || tx.date)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-foreground tabular-nums shrink-0">
                        -{formatCurrency(tx.amount, tx.currency || currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Security Notice */}
          <Card className="p-4 bg-muted/40 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-foreground">Automatic Protection Guarantee</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                If a transfer fails due to network or gateway errors, funds are automatically refunded back to your account balance with zero money lost.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TransfersPage;
