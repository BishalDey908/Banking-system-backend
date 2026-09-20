import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Send,
  QrCode,
  Camera,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { sendTransfer, fetchTransactions } from '../../store/slices/transactionSlice';
import { fetchAccounts } from '../../store/slices/accountSlice';
import {
  setTransferModalOpen,
  setQrScannerModalOpen,
  setQrScannedData,
} from '../../store/slices/uiSlice';
import { maskAccountNumber, formatCurrency } from '../../utils/formatters';
import { validateTransferAmount } from '../../utils/validators';
import { useToast } from '../../hooks/useToast';
import { cn } from '@/lib/utils';

/**
 * Modern Fincheck Send Money Modal powered by shadcn/ui
 */
export function TransferModal() {
  const dispatch = useDispatch();
  const { isTransferModalOpen, qrScannedData } = useSelector((state) => state.ui);
  const { accounts, activeAccountId } = useSelector((state) => state.accounts);
  const { showSuccess } = useToast();

  const [transferType, setTransferType] = useState('UPI'); // 'UPI' | 'BANK'
  const [selectedAccountId, setSelectedAccountId] = useState(activeAccountId || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const popularHandles = ['@okhdfcbank', '@okicici', '@oksbi', '@paytm', '@ybl', '@upi'];

  useEffect(() => {
    if (isTransferModalOpen) {
      setError('');
      if (!selectedAccountId && accounts.length > 0) {
        setSelectedAccountId(activeAccountId || accounts[0]._id);
      }
    }
  }, [isTransferModalOpen, activeAccountId, accounts, selectedAccountId]);

  useEffect(() => {
    if (qrScannedData && isTransferModalOpen) {
      if (qrScannedData.upiId) setRecipientAccount(qrScannedData.upiId);
      if (qrScannedData.name) setRecipientName(qrScannedData.name);
      if (qrScannedData.amount) setAmount(String(qrScannedData.amount));
      if (qrScannedData.note) setNote(qrScannedData.note);
      setTransferType('UPI');
    }
  }, [qrScannedData, isTransferModalOpen]);

  const handleClose = () => {
    setError('');
    dispatch(setTransferModalOpen(false));
    dispatch(setQrScannedData(null));
  };

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

  const fromAccount = selectedAccountId || activeAccountId || accounts[0]?._id;
  const currentAcc = accounts.find((a) => a._id === fromAccount) || accounts[0];
  const availableBalance = typeof currentAcc?.balance === 'number' ? currentAcc.balance : 0;
  const currency = currentAcc?.currency || 'INR';

  const accountOptions = accounts.map((acc) => ({
    value: acc._id,
    label: `${maskAccountNumber(acc._id)} — ${formatCurrency(acc.balance || 0, acc.currency || 'INR')}`,
  }));

  const quickAmounts = [500, 1000, 2000, 5000];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fromAccount) {
      setError('Please select an account to send money from.');
      return;
    }

    if (!recipientName.trim()) {
      setError('Please enter the recipient name.');
      return;
    }
    if (!recipientAccount.trim()) {
      setError(
        transferType === 'UPI'
          ? 'Please enter a valid recipient UPI ID.'
          : 'Please enter the recipient bank account ID.'
      );
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
        note: note.trim() || (transferType === 'UPI' ? 'UPI Transfer' : 'Wire Transfer'),
      })
    );

    setIsSubmitting(false);

    if (sendTransfer.fulfilled.match(result)) {
      showSuccess(`Sent ${formatCurrency(numAmount, currency)} to ${recipientName}`);
      dispatch(fetchAccounts());
      dispatch(fetchTransactions());
      handleClose();
      setRecipientName('');
      setRecipientAccount('');
      setAmount('');
      setNote('');
    } else {
      setError(result.payload || 'Transfer failed.');
    }
  };

  return (
    <Modal
      isOpen={isTransferModalOpen}
      onClose={handleClose}
      title="Send Money"
      description="Transfer funds directly via UPI ID, QR Code, or Bank Account."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <Alert
            variant="danger"
            message={error}
            dismissible
            onDismiss={() => setError('')}
          />
        )}

        {/* Transfer Method Switcher */}
        <div className="grid grid-cols-2 p-1 bg-muted rounded-xl text-xs font-semibold select-none">
          <button
            type="button"
            onClick={() => setTransferType('UPI')}
            className={cn(
              'py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              transferType === 'UPI'
                ? 'bg-background text-primary shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI ID / QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setTransferType('BANK')}
            className={cn(
              'py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              transferType === 'BANK'
                ? 'bg-background text-primary shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>Bank Account ID</span>
          </button>
        </div>

        {/* Scan with Camera Action Banner */}
        {transferType === 'UPI' && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Have a UPI QR code to pay?
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  Scan via camera or upload QR image
                </span>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => dispatch(setQrScannerModalOpen(true))}
              className="gap-1.5 shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </Button>
          </div>
        )}

        {/* Source Account */}
        <div>
          <Label className="block mb-1.5">
            From Account
          </Label>
          {accounts.length > 0 ? (
            <Select
              options={accountOptions}
              value={fromAccount}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            />
          ) : (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400">
              No active accounts found.
            </div>
          )}
          {currentAcc && (
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 px-1">
              <span>Available Balance:</span>
              <span className="font-bold text-foreground">
                {formatCurrency(availableBalance, currency)}
              </span>
            </div>
          )}
        </div>

        {/* Recipient UPI / Account Info */}
        <div className="space-y-2">
          <Input
            label={transferType === 'UPI' ? 'Recipient UPI ID' : 'Recipient Account ID'}
            placeholder={
              transferType === 'UPI'
                ? 'e.g. rahul@okaxis or 9876543210@paytm'
                : 'e.g. 6aa9737ecef4434916e94d7d'
            }
            value={recipientAccount}
            onChange={(e) => setRecipientAccount(e.target.value)}
            required
          />

          {/* Popular UPI handle chips */}
          {transferType === 'UPI' && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] text-muted-foreground mr-0.5">Popular handles:</span>
              {popularHandles.map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => handleSelectUpiHandle(handle)}
                  className="px-2 py-0.5 rounded-lg bg-muted hover:bg-primary/15 hover:text-primary border border-border text-[11px] font-mono text-foreground transition-colors select-none cursor-pointer"
                >
                  {handle}
                </button>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Recipient Full Name"
          placeholder="e.g. John Doe, Rahul Sharma"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          required
        />

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>
              Amount ({currency})
            </Label>
            {availableBalance > 0 && (
              <button
                type="button"
                onClick={handleSendAll}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
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

          {/* Quick add chips */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-[11px] text-muted-foreground mr-1">Quick add:</span>
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleAddAmount(val)}
                className="px-2.5 py-0.5 rounded-lg bg-muted hover:bg-primary/15 hover:text-primary border border-border text-xs font-medium text-foreground transition-colors select-none cursor-pointer"
              >
                +{val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <Input
          label="Note (Optional)"
          placeholder="e.g. Rent, dinner split, coffee"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={accounts.length === 0}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Send Money
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TransferModal;
