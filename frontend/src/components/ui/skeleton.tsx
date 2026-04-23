'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-shimmer rounded-md',
        // Sweeping gradient highlight over muted base
        'bg-[length:400%_100%]',
        '[background-image:linear-gradient(90deg,hsl(var(--muted))_25%,hsl(var(--muted-foreground)/0.08)_50%,hsl(var(--muted))_75%)]',
        className,
      )}
      {...props}
    />
  );
}
