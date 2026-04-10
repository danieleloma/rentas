'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

const variantStyles = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-gray-900 text-white',
  warning: 'bg-gray-200 text-gray-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-gray-100 text-gray-600',
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
