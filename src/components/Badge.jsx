import React from 'react';

/**
 * Standardized Brand Badge Component
 * Adheres strictly to locked design tokens:
 * Primary: #053807, Secondary: #D4AF37, Accent: #E5D3B3, Background: #FDFBF7
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'sm',
  icon = null,
  pill = true,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px] tracking-wider font-semibold',
    sm: 'px-2.5 py-1 text-xs tracking-wide font-medium',
    md: 'px-3 py-1.5 text-sm tracking-normal font-medium',
  };

  const variantClasses = {
    primary: 'bg-primary text-white border border-primary/20',
    secondary: 'bg-secondary text-primary font-semibold border border-secondary/40 shadow-xs',
    accent: 'bg-accent/40 text-primary border border-accent/60',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-rose-50 text-rose-800 border border-rose-200',
    outline: 'bg-transparent text-primary border border-primary/30',
    gold: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-300 shadow-xs',
    discount: 'bg-primary text-secondary font-bold border border-secondary/30 shadow-xs',
  };

  const radiusClass = pill ? 'rounded-full' : 'rounded-lg';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 uppercase transition-all duration-200 select-none
        ${sizeClasses[size] || sizeClasses.sm}
        ${variantClasses[variant] || variantClasses.primary}
        ${radiusClass}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
