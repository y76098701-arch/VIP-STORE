'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-vip-purple/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variants = {
      primary:
        'bg-gradient-to-r from-vip-purple to-vip-blue text-white hover:neon-glow hover:brightness-110 active:scale-[0.98] shadow-lg shadow-vip-purple/25',
      secondary:
        'border border-vip-border bg-vip-card/80 text-vip-text-primary hover:border-vip-purple hover:bg-vip-purple/10 active:scale-[0.98]',
      danger:
        'bg-red-600 hover:bg-red-700 text-white active:scale-[0.98] shadow-lg shadow-red-600/20',
      ghost:
        'bg-transparent text-vip-text-primary hover:bg-white/5 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
      md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
      lg: 'px-7 py-3.5 text-base font-semibold rounded-xl gap-2.5',
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...rest}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
