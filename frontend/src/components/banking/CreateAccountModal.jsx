import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Landmark } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '@/components/ui/button';
import { Select } from '../common/Select';
import { Alert } from '../common/Alert';
import { createAccount } from '../../store/slices/accountSlice';
import { setCreateAccountModalOpen } from '../../store/slices/uiSlice';
import { useToast } from '../../hooks/useToast';

/**
 * Clean & Simple Modal for opening a new bank account powered by shadcn/ui
 */
export function CreateAccountModal() {
  const dispatch = useDispatch();
  const { isCreateAccountModalOpen } = useSelector((state) => state.ui);
  const { createLoading, error } = useSelector((state) => state.accounts);
  const { showSuccess } = useToast();

  const [currency, setCurrency] = useState('INR');

  const currencyOptions = [
    { value: 'INR', label: 'Indian Rupee (INR — ₹)' },
    { value: 'USD', label: 'US Dollar (USD — $)' },
    { value: 'EUR', label: 'Euro (EUR — €)' },
  ];

  const handleClose = () => {
    dispatch(setCreateAccountModalOpen(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createAccount({ currency }));

    if (createAccount.fulfilled.match(resultAction)) {
      showSuccess(`New ${currency} account opened!`);
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isCreateAccountModalOpen}
      onClose={handleClose}
      title="Open an Account"
      description="Choose your account currency. Your account will be ready immediately."
      size="md"
      footerContent={
        <>
          <Button variant="outline" size="default" onClick={handleClose} disabled={createLoading}>
            Cancel
          </Button>
          <Button
            size="default"
            isLoading={createLoading}
            onClick={handleCreate}
            leftIcon={<Landmark className="w-4 h-4" />}
          >
            Create Account
          </Button>
        </>
      }
    >
      <form onSubmit={handleCreate} className="space-y-4">
        {error && <Alert variant="danger" message={error} dismissible />}

        <Select
          label="Currency"
          options={currencyOptions}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          helperText="All your balances and transactions for this account will be in this currency."
        />
      </form>
    </Modal>
  );
}

export default CreateAccountModal;
