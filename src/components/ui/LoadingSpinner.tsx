'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className,
}) => {
  const sizeMap = {
    sm: {
      ring: 'w-5 h-5 border-2',
      text: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      ring: 'w-9 h-9 border-3',
      text: 'text-sm',
      gap: 'gap-3',
    },
    lg: {
      ring: 'w-14 h-14 border-4',
      text: 'text-base font-medium',
      gap: 'gap-4',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4 text-center select-none',
        currentSize.gap,
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Glowing backdrop blur */}
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-vip-purple/30 blur-md animate-pulse',
            currentSize.ring
          )}
        />

        {/* Spinning border ring */}
        <div
          className={cn(
            'rounded-full border-solid border-vip-border border-t-vip-purple border-r-vip-blue animate-spin shadow-lg shadow-vip-purple/30',
            currentSize.ring
          )}
        />
      </div>

      {text && (
        <p className={cn('text-vip-text-secondary animate-pulse', currentSize.text)}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
