import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../common/Modal';
import { MyUpiQrCard } from './MyUpiQrCard';
import { setReceiveQrModalOpen, setReceiveQrAccountId } from '../../store/slices/uiSlice';

/**
 * Global Modal for Receivers to show their Account QR code
 */
export function ReceiveQrModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.isReceiveQrModalOpen);
  const accountId = useSelector((state) => state.ui.receiveQrAccountId);

  const handleClose = () => {
    dispatch(setReceiveQrModalOpen(false));
    dispatch(setReceiveQrAccountId(null));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Receive Money via QR"
      description="Present this QR code or share your UPI ID to receive payments instantly."
      size="md"
    >
      <div className="py-1">
        <MyUpiQrCard
          accountId={accountId}
          showAccountSelector={true}
          className="border-0 shadow-none p-0 bg-transparent"
        />
      </div>
    </Modal>
  );
}

export default ReceiveQrModal;

