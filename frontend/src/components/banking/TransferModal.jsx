import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
import { sendTransfer } from '../../store/slices/transactionSlice';
import { setTransferModalOpen } from '../../store/slices/uiSlice';
import { maskAccountNumber, formatCurrency } from '../../utils/formatters';
import { validateTransferAmount } from '../../utils/validators';
import { useToast } from '../../hooks/useToast';

/**
 * Clean & Simple Transfer Modal
 */
export function TransferModal() {
  const dispatch = useDispatch();
  const { isTransferModalOpen } = useSelector((state) => state.ui);
  const { accounts, activeAccountId } = useSelector((state) => state.accounts);
  const { showSuccess } = useToast();

  const [selectedAccountId, setSelectedAccountId] = useState(activeAccountId || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

        {accountOptions.length > 0 ? (
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Amount (INR) <span className="text-rose-500">*</span>
            </label>
            {currentAcc && (
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
