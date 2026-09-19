import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Inline Alert Banner Component
 * 
 * @param {Object} props
 * @param {'info' | 'success' | 'warning' | 'danger'} [props.variant='info'] - Alert severity
 * @param {string} [props.title] - Alert heading
 * @param {React.ReactNode} props.message - Descriptive text or node
 * @param {boolean} [props.dismissible=false] - Show close button
 * @param {Function} [props.onDismiss] - Close callback
 * @param {React.ReactNode} [props.action] - Supplementary action button
 * @param {string} [props.className='']
 */
export function Alert({
  variant = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  action,
  className = '',
}) {
  const config = {
    info: {
      container: 'bg-blue-50/70 border-blue-200/80 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    },
    success: {
      container: 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    warning: {
      container: 'bg-amber-50/70 border-amber-200/80 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
    danger: {
      container: 'bg-rose-50/70 border-rose-200/80 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    },
  };

  const displayMessage =
    typeof message === 'object' && message !== null
      ? (message.message || message.error || JSON.stringify(message))
      : message;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-sm',
        config[variant].container,
        className
      )}
    >
      {config[variant].icon}

      <div className="flex-1 min-w-0">
        {title && <h4 className="font-semibold text-slate-900 mb-0.5">{title}</h4>}
        <div className="text-slate-700 leading-relaxed">{displayMessage}</div>
        {action && <div className="mt-2.5">{action}</div>}
      </div>

      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;

