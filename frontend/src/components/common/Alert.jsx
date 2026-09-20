import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import {
  Alert as ShadcnAlert,
  AlertTitle as ShadcnAlertTitle,
  AlertDescription as ShadcnAlertDescription,
} from '@/components/ui/alert';
import { cn } from '@/lib/utils';

/**
 * Common Alert Banner Component powered by shadcn/ui Alert
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
  const variantMap = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'destructive',
  };

  const icons = {
    info: <Info className="h-4 w-4" />,
    success: <CheckCircle2 className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    danger: <AlertCircle className="h-4 w-4" />,
  };

  const displayMessage =
    typeof message === 'object' && message !== null
      ? message.message || message.error || JSON.stringify(message)
      : message;

  return (
    <ShadcnAlert
      variant={variantMap[variant] || 'default'}
      className={cn('relative pr-10', className)}
    >
      {icons[variant] || icons.info}

      {title && <ShadcnAlertTitle>{title}</ShadcnAlertTitle>}

      <ShadcnAlertDescription>
        <div>{displayMessage}</div>
        {action && <div className="mt-2.5">{action}</div>}
      </ShadcnAlertDescription>

      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </ShadcnAlert>
  );
}

export default Alert;
