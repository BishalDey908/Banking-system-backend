import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';

/**
 * Custom hook for triggering toast notifications from any component
 */
export function useToast() {
  const dispatch = useDispatch();

  return {
    showToast: (message, type = 'info', duration = 4000) => {
      dispatch(addToast({ message, type, duration }));
    },
    showSuccess: (message, duration = 4000) => {
      dispatch(addToast({ message, type: 'success', duration }));
    },
    showError: (message, duration = 5000) => {
      dispatch(addToast({ message, type: 'error', duration }));
    },
    showInfo: (message, duration = 4000) => {
      dispatch(addToast({ message, type: 'info', duration }));
    },
  };
}

