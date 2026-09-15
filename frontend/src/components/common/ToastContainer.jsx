import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { removeToast } from '../../store/slices/uiSlice';
import { cn } from '../../utils/cn';

function ToastItem({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200/80 dark:border-emerald-800/80',
    error: 'border-rose-200/80 dark:border-rose-800/80',
    info: 'border-blue-200/80 dark:border-blue-800/80',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-xl shadow-lg border text-sm max-w-sm w-full',
        'animate-in fade-in slide-in-from-bottom-3 duration-200 transition-all pointer-events-auto',
        borders[toast.type] || 'border-slate-200 dark:border-slate-800'
      )}
    >
      {icons[toast.type] || icons.info}
      <p className="text-slate-800 dark:text-slate-100 text-xs font-medium flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * Global Toast Container connected to Redux UI state
 */
export function ToastContainer() {
  const toasts = useSelector((state) => state.ui.toasts);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

export default ToastContainer;

