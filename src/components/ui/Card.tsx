'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'purple' | 'blue' | 'gold' | 'none';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      hover = true,
      glow = 'purple',
      ...props
    },
    ref
  ) => {
    const glowClasses = {
      purple: 'neon-border',
      blue: 'neon-border-blue',
      gold: 'neon-border-gold',
      none: 'border border-vip-border',
    };

    const hoverClasses = hover
      ? 'transition-all duration-300 hover:border-vip-purple/50 hover:bg-vip-card-hover hover:shadow-lg hover:shadow-vip-purple/10'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'bg-vip-card rounded-xl text-vip-text-primary p-5',
          glowClasses[glow],
          hoverClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
