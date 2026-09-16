import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpRight, QrCode, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
import { Skeleton } from '../common/Skeleton';
import { sendTransfer } from '../../store/slices/transactionSlice';
import { setTransferModalOpen, setQrScannerModalOpen } from '../../store/slices/uiSlice';
import { maskAccountNumber, formatCurrency } from '../../utils/formatters';
import { validateTransferAmount } from '../../utils/validators';
import { POPULAR_UPI_HANDLES, validateUpiId } from '../../utils/upi';
import { useToast } from '../../hooks/useToast';

/**
 * Clean & Simple Transfer Modal with UPI & QR Support
 */
export function TransferModal() {
  const dispatch = useDispatch();
  const { isTransferModalOpen, qrScannedData } = useSelector((state) => state.ui);
  const { accounts, activeAccountId, loading: accountsLoading } = useSelector((state) => state.accounts);
  const { showSuccess } = useToast();

  const [mode, setMode] = useState('UPI'); // 'UPI' | 'ACCOUNT'
  const [selectedAccountId, setSelectedAccountId] = useState(activeAccountId || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync scanned data when user scans a QR
  useEffect(() => {
    if (qrScannedData && isTransferModalOpen) {
      setMode('UPI');
      setRecipientAccount(qrScannedData.upiId || '');
      if (qrScannedData.name) setRecipientName(qrScannedData.name);
      if (qrScannedData.amount) setAmount(String(qrScannedData.amount));
      if (qrScannedData.note) setNote(qrScannedData.note);
    }
  }, [qrScannedData, isTransferModalOpen]);

  const handleClose = () => {
    setError('');
    dispatch(setTransferModalOpen(false));
  };

  const accountOptions = accounts.map((acc) => ({
    value: acc._id,
    label: `${maskAccountNumber(acc._id)} (${acc.currency || 'INR'}) — Bal: ${formatCurrency(acc.balance || 0, acc.currency)}`,
  }));

  const fromAccount = selectedAccountId || activeAccountId || accounts[0]?._id;
  const currentAcc = accounts.find((a) => a._id === fromAccount);
  const availableBalance = typeof currentAcc?.balance === 'number' ? currentAcc.balance : 0;

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
      handleClose();
    } else {
      setError(result.payload || 'Transfer failed.');
    }
  };

  return (
    <Modal
      isOpen={isTransferModalOpen}
      onClose={handleClose}
      title="Send Money"
      description="Transfer money directly to any bank account or UPI ID."
      size="md"
      footerContent={
        <>
          <Button variant="outline" size="md" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Send Money
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="danger" message={error} dismissible />}

        {/* Payment Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setMode('UPI')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
              mode === 'UPI'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            UPI ID / QR Code
          </button>
          <button
            type="button"
            onClick={() => setMode('ACCOUNT')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
              mode === 'ACCOUNT'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bank Account ID
          </button>
        </div>

        {/* Scan QR Quick Trigger */}
        {mode === 'UPI' && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Have a QR code to pay?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch(setTransferModalOpen(false));
                dispatch(setQrScannerModalOpen(true));
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              Scan with Camera
            </button>
          </div>
        )}

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
          <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            Please open an account first before sending money.
          </div>
        )}

        {/* Recipient Account or UPI ID */}
        <div>
          <Input
            label={mode === 'UPI' ? 'Recipient UPI ID' : 'Recipient Account Number'}
            placeholder={mode === 'UPI' ? 'e.g. rahul@okaxis or 9876543210@paytm' : 'e.g. 68c71f92e01b34a9'}
            value={recipientAccount}
            onChange={(e) => setRecipientAccount(e.target.value)}
            required
          />

          {mode === 'UPI' && (
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 dark:text-slate-500">Popular handles:</span>
                {validateUpiId(recipientAccount) && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid UPI format
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {POPULAR_UPI_HANDLES.map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => {
                      const base = recipientAccount.split('@')[0];
                      setRecipientAccount(`${base || 'payee'}${handle}`);
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Recipient Name"
          placeholder="e.g. Rahul Sharma or Merchant Name"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          required
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Amount (INR) <span className="text-rose-500">*</span>
            </label>
            {accountsLoading ? (
              <Skeleton variant="text" className="w-24 h-3.5" />
            ) : currentAcc ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Available: <strong className="font-mono text-slate-850 dark:text-slate-200">{formatCurrency(availableBalance, currentAcc.currency || 'INR')}</strong>
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
        </div>

        <Input
          label="Note (Optional)"
          placeholder="e.g. Rent, groceries, dinner"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </form>
    </Modal>
  );
}

export default TransferModal;
