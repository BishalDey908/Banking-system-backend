import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * Common Modal Dialog Component powered by shadcn/ui Dialog
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  footerContent,
  children,
}) {
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className={cn('overflow-hidden p-0 gap-0', sizeStyles[size])}>
        {(title || description) && (
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border text-left">
            {title && <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>}
            {description && (
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>

        {footerContent && (
          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
            {footerContent}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
