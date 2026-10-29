const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-primary hover:bg-secondary/90',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative rounded-xl font-medium transition-all duration-300 ease-in-out
        hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default AnimatedButton;
