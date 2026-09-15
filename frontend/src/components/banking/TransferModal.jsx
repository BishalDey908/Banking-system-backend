import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpRight } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
import { addTransfer } from '../../store/slices/transactionSlice';
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
    label: `${maskAccountNumber(acc._id)} (${acc.currency || 'INR'})`,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!recipientName.trim()) {
      setError('Please enter the recipient name.');
      return;
    }
    if (!recipientAccount.trim()) {
      setError('Please enter the account number or UPI ID.');
      return;
    }

    const validation = validateTransferAmount(amount, 10000000);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      dispatch(
        addTransfer({
          accountId: selectedAccountId || activeAccountId,
          recipientName: recipientName.trim(),
          recipientAccount: recipientAccount.trim(),
          amount: Number(amount),
          note: note.trim(),
          type: 'DEBIT',
        })
      );

      setIsSubmitting(false);
      showSuccess(`Sent ${formatCurrency(amount)} to ${recipientName}`);
      setRecipientName('');
      setRecipientAccount('');
      setAmount('');
      setNote('');
      handleClose();
    }, 400);
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

        <Input
          label="Amount (INR)"
          type="number"
          min="1"
          step="any"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          leftIcon={<span className="text-xs font-mono font-bold">₹</span>}
          required
        />

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
