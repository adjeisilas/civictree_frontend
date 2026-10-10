import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cta' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-primary hover:bg-primary-hover text-white',
  cta: 'bg-cta hover:brightness-105 text-text-primary font-bold',
  outline: 'border-2 border-primary text-primary hover:bg-primary/5',
  ghost: 'text-primary hover:bg-primary/10',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`
          font-sans font-semibold transition-all duration-300 flex items-center gap-2 justify-center
          ${variantStyles[variant]} ${sizeStyles[size]}
          ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
          focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          ${className || ''}
        `}
        disabled={disabled || loading}
        {...props}
      >
        <motion.div
          whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
          whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              {icon && <span>{icon}</span>}
              {children}
            </>
          )}
        </motion.div>
      </button>
    );
  }
);

Button.displayName = 'Button';
