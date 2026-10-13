'use client';

import React from 'react';
import { getStatusLabel, getStatusStyle, getStatusColor, cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

export interface BadgeProps {
  status: OrderStatus | string;
  lang?: 'ar' | 'en';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  lang = 'ar',
  className,
  size = 'md',
}) => {
  const label = getStatusLabel(status, lang);
  const styleClass = getStatusStyle(status);
  const colorClass = getStatusColor(status);

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs md:text-sm px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-sm transition-colors',
        sizeStyles[size],
        styleClass,
        colorClass,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 animate-pulse" />
      <span>{label}</span>
    </span>
  );
};

export default Badge;
