import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Standardized Slide-out Drawer Component
 * Used for slide-out cart, mobile navigation, and mobile filters
 * Positions: 'right' (default), 'left', 'bottom'
 */
const Drawer = ({
  isOpen = false,
  onClose,
  position = 'right',
  title,
  subtitle,
  children,
  width = 'md',
  showCloseButton = true,
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

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const positionStyles = {
    right: `right-0 top-0 bottom-0 w-full ${widthClasses[width] || widthClasses.md} animate-slide-in-right`,
    left: `left-0 top-0 bottom-0 w-full ${widthClasses[width] || widthClasses.md} animate-slide-in-left`,
    bottom: 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl animate-slide-in-up',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div
        className={`
          fixed bg-white shadow-2xl border-accent/30 flex flex-col z-10 transition-transform duration-300 ease-in-out
          ${positionStyles[position] || positionStyles.right}
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-[#FDFBF7]">
            <div>
              {title && (
                <h3 id="drawer-title" className="text-lg sm:text-xl font-display font-bold text-primary">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 font-body mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-body text-gray-800">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white shadow-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
