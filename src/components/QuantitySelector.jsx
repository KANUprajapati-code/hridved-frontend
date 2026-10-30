import React from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * Standardized Quantity Selector Primitive
 * Enforces min and max limits, manual input validation, and clean tactile buttons
 */
const QuantitySelector = ({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onChange?.(value - 1);
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange?.(value + 1);
  };

  const handleInputChange = (e) => {
    if (disabled) return;
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (rawVal === '') {
      onChange?.(min);
      return;
    }
    const parsed = parseInt(rawVal, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange?.(clamped);
    }
  };

  const sizeClasses = {
    sm: {
      btn: 'w-7 h-7',
      input: 'w-10 h-7 text-xs',
      icon: 'w-3 h-3',
      container: 'h-8',
    },
    md: {
      btn: 'w-9 h-9',
      input: 'w-12 h-9 text-sm',
      icon: 'w-3.5 h-3.5',
      container: 'h-10',
    },
    lg: {
      btn: 'w-11 h-11',
      input: 'w-14 h-11 text-base',
      icon: 'w-4 h-4',
      container: 'h-12',
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`
        inline-flex items-center border border-gray-200 rounded-xl bg-white shrink-0 w-auto
        transition-colors hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${currentSize.container}
        ${className}
      `}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={`
          inline-flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-50 active:bg-gray-100
          transition-colors rounded-l-xl shrink-0
          ${currentSize.btn}
          ${disabled || value <= min ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-500' : 'cursor-pointer'}
        `}
      >
        <Minus className={currentSize.icon} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        aria-label="Item quantity"
        className={`
          text-center font-bold text-gray-900 border-x border-gray-100 bg-transparent
          focus:outline-hidden !p-0 !m-0 !w-12 !min-w-[48px] !max-w-[48px] !h-full !rounded-none !border-y-0
        `}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={`
          inline-flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-50 active:bg-gray-100
          transition-colors rounded-r-xl shrink-0
          ${currentSize.btn}
          ${disabled || value >= max ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-500' : 'cursor-pointer'}
        `}
      >
        <Plus className={currentSize.icon} />
      </button>
    </div>
  );
};

export default QuantitySelector;
