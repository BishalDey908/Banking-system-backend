import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable Minimalist Modal Dialog Component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback triggered when closing modal
 * @param {React.ReactNode} [props.title] - Modal title
 * @param {string} [props.description] - Subtitle / description
 * @param {'sm' | 'md' | 'lg' | 'xl'} [props.size='md'] - Max width of the modal
 * @param {boolean} [props.showCloseButton=true] - Display top-right close icon
 * @param {React.ReactNode} [props.footerContent] - Optional bottom action buttons
 * @param {React.ReactNode} props.children - Modal body content
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
  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 z-10 transform transition-all duration-200 animate-in fade-in zoom-in-95',
          sizeStyles[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
              {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors ml-4"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footerContent && (
          <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl flex items-center justify-end gap-3">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;

