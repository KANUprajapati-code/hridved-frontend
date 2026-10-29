import React, { forwardRef } from 'react';

/**
 * Standardized Accessible Form Input Component
 * Adheres strictly to locked design tokens:
 * Focus Ring: #053807 (primary), Error Ring: #EF4444 (error)
 */
const InputField = forwardRef(({
  label,
  id,
  name,
  type = 'text',
  error,
  helperText,
  icon = null,
  rightElement = null,
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5 font-body"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-xl">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-2.5 rounded-xl border font-body text-sm text-gray-900 bg-white
            placeholder-gray-400 transition-all duration-200
            ${icon ? 'pl-10' : 'pl-4'}
            ${rightElement ? 'pr-11' : 'pr-4'}
            ${error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
              : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
            }
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-body flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500 font-body">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
