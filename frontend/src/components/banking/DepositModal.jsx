import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowDownLeft } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
import { Skeleton } from '@/components/ui/skeleton';
import { depositFunds } from '../../store/slices/transactionSlice';
import { setDepositModalOpen } from '../../store/slices/uiSlice';
import { maskAccountNumber, formatCurrency } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

/**
 * Clean & Simple Deposit Funds Modal powered by shadcn/ui
 */
export function DepositModal() {
  const dispatch = useDispatch();
  const { isDepositModalOpen } = useSelector((state) => state.ui);
  const { accounts, activeAccountId, loading: accountsLoading } = useSelector((state) => state.accounts);
  const { actionLoading } = useSelector((state) => state.transactions);
  const { showSuccess } = useToast();

  const [selectedAccountId, setSelectedAccountId] = useState(activeAccountId || '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Personal Funds Deposit');
  const [error, setError] = useState('');

  const quickAmounts = [1000, 5000, 10000, 25000];

  const handleClose = () => {
    setError('');
    dispatch(setDepositModalOpen(false));
  };

  const accountOptions = accounts.map((acc) => ({
    value: acc._id,
    label: `${maskAccountNumber(acc._id)} (${acc.currency || 'INR'}) — Balance: ${formatCurrency(acc.balance || 0, acc.currency)}`,
  }));

  const handleAddAmount = (val) => {
    const current = Number(amount) || 0;
    const next = Math.round((current + val) * 100) / 100;
    setAmount(String(next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const targetAccount = selectedAccountId || activeAccountId || (accounts[0]?._id);
    if (!targetAccount) {
      setError('Please select an account to deposit into.');
      return;
    }

    const numAmount = Math.round((Number(amount) + Number.EPSILON) * 100) / 100;
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid deposit amount greater than 0.');
      return;
    }

    const str = String(amount).trim();
    if (str.includes('.')) {
      const decimals = str.split('.')[1];
      if (decimals && decimals.length > 2) {
        setError('Amount cannot have more than 2 decimal places.');
        return;
      }
    }

    const result = await dispatch(
      depositFunds({
        accountId: targetAccount,
        amount: numAmount,
        note: note.trim(),
      })
    );

    if (depositFunds.fulfilled.match(result)) {
      showSuccess(`Deposited ${formatCurrency(numAmount)} successfully!`);
      setAmount('');
      handleClose();
    } else {
      setError(result.payload || 'Deposit failed');
    }
  };

  return (
    <Modal
      isOpen={isDepositModalOpen}
      onClose={handleClose}
      title="Deposit Money"
      description="Add funds into your bank account instantly."
      size="md"
      footerContent={
        <>
          <Button variant="outline" size="default" onClick={handleClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            size="default"
            isLoading={actionLoading}
            onClick={handleSubmit}
            leftIcon={<ArrowDownLeft className="w-4 h-4" />}
          >
            Deposit Funds
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="danger" message={error} dismissible onDismiss={() => setError('')} />}

        {accountsLoading ? (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground block">
              Deposit into Account
            </span>
            <Skeleton className="w-full h-11 rounded-xl" />
          </div>
        ) : accountOptions.length > 0 ? (
          <Select
            label="Deposit into Account"
            options={accountOptions}
            value={selectedAccountId || activeAccountId || accounts[0]?._id}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          />
        ) : (
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            Please open an account first before making a deposit.
          </div>
        )}

        <div>
          <Input
            label="Amount (INR)"
            type="number"
            min="0.01"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          {/* Quick add chips */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Quick add:</span>
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleAddAmount(q)}
                className="px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/15 hover:text-primary border border-border text-xs font-medium text-foreground transition-colors select-none cursor-pointer"
              >
                +₹{q >= 1000 ? `${q / 1000}k` : q}
              </button>
            ))}
            {amount && Number(amount) > 0 && (
              <button
                type="button"
                onClick={() => setAmount('')}
                className="px-2 py-1 text-xs text-destructive hover:underline transition-colors ml-auto select-none cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <Input
          label="Deposit Note (Optional)"
          placeholder="e.g. Salary, savings, freelance payout"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </form>
    </Modal>
  );
}

export default DepositModal;
