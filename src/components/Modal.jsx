import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Standardized Accessible Modal Shell Component
 * Features:
 * - Escape key listener
 * - Body scroll locking
 * - Glassmorphism backdrop
 * - Strict brand color alignment (#053807, #D4AF37, #E5D3B3, #FDFBF7)
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer = null,
  className = '',
}) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        className={`
          relative w-full ${sizeClasses[size] || sizeClasses.md}
          bg-white rounded-2xl border border-accent/40 shadow-2xl
          transform transition-all duration-300 ease-out
          flex flex-col max-h-[90vh] overflow-hidden z-10
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-gray-100 bg-[#FDFBF7]">
            <div>
              {title && (
                <h3 id="modal-title" className="text-xl sm:text-2xl font-display font-bold text-primary">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 font-body">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 font-body text-gray-800">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/70 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
