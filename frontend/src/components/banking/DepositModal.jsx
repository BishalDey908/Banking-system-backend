import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowDownLeft } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
import { Skeleton } from '../common/Skeleton';
import { depositFunds } from '../../store/slices/transactionSlice';
import { setDepositModalOpen } from '../../store/slices/uiSlice';
import { maskAccountNumber, formatCurrency } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

/**
 * Clean & Simple Deposit Funds Modal
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

    // Check decimal precision
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
          <Button variant="outline" size="md" onClick={handleClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
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
        {error && <Alert variant="danger" message={error} dismissible />}

        {accountsLoading ? (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono block">
              Deposit into Account
            </span>
            <Skeleton variant="rectangular" className="w-full h-10 rounded-lg" />
          </div>
        ) : accountOptions.length > 0 ? (
          <Select
            label="Deposit into Account"
            options={accountOptions}
            value={selectedAccountId || activeAccountId || accounts[0]?._id}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          />
        ) : (
          <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
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

        <Input
          label="Deposit Note (Optional)"
          placeholder="e.g. Salary, cash deposit, freelance"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </form>
    </Modal>
  );
}

export default DepositModal;

