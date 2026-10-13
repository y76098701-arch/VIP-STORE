'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col space-y-1.5 text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs md:text-sm font-medium text-vip-text-secondary select-none"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-lg bg-vip-bg border text-vip-text-primary text-sm placeholder:text-vip-text-muted transition-all duration-200 outline-none',
              'border-vip-border hover:border-vip-border-light focus:border-vip-purple focus:ring-1 focus:ring-vip-purple/30',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
              props.disabled && 'opacity-50 cursor-not-allowed bg-vip-card/50',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 mt-1 animate-fade-in font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-vip-text-muted mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
