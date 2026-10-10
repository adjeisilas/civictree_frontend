import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'primary';
  className?: string;
}

const variantStyles = {
  success: 'bg-success/10 text-success',
  warning: 'bg-yellow-100 text-yellow-800',
  primary: 'bg-primary/10 text-primary',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  return (
    <span
      className={`
        inline-block px-3 py-1 rounded-full text-xs font-semibold
        ${variantStyles[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
};
