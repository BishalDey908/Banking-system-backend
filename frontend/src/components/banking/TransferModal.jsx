import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowUpRight,
  Send,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Camera,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
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
import { cn } from '../../utils/cn';

/**
 * Modern Fincheck Send Money Modal with QR & UPI ID Support
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

  // Popular handles for instant UPI handle completion
  const popularHandles = ['@okhdfcbank', '@okicici', '@oksbi', '@paytm', '@ybl', '@upi'];

  useEffect(() => {
    if (isTransferModalOpen) {
      setError('');
      if (!selectedAccountId && accounts.length > 0) {
        setSelectedAccountId(activeAccountId || accounts[0]._id);
      }
    }
  }, [isTransferModalOpen, activeAccountId, accounts, selectedAccountId]);

  // When QR code is scanned, auto-populate all fields
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
            onClose={() => setError('')}
          />
        )}

        {/* Transfer Method Switcher: UPI / QR vs Bank Account */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold select-none">
          <button
            type="button"
            onClick={() => setTransferType('UPI')}
            className={cn(
              'py-2 rounded-lg transition-all flex items-center justify-center gap-1.5',
              transferType === 'UPI'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI ID / QR Code</span>
          </button>
          <button
            type="button"
            onClick={() => setTransferType('BANK')}
            className={cn(
              'py-2 rounded-lg transition-all flex items-center justify-center gap-1.5',
              transferType === 'BANK'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <span>Bank Account ID</span>
          </button>
        </div>

        {/* Scan with Camera Action Banner */}
        {transferType === 'UPI' && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Have a UPI QR code to pay?
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Scan via camera or upload QR image
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatch(setQrScannerModalOpen(true))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 select-none cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
          </div>
        )}

        {/* Source Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            From Account
          </label>
          {accounts.length > 0 ? (
            <Select
              options={accountOptions}
              value={fromAccount}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            />
          ) : (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-700 dark:text-amber-300">
              No active accounts found.
            </div>
          )}
          {currentAcc && (
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-1 px-1">
              <span>Available Balance:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
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

          {/* Quick add chips */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-[11px] text-slate-400 mr-1">Quick add:</span>
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleAddAmount(val)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors select-none"
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
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || accounts.length === 0}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors select-none cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Sending...' : 'Send Money'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default TransferModal;
