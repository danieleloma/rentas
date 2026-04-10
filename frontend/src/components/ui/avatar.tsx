'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

const sizePixels = {
  sm: 32,
  md: 40,
  lg: 56,
} as const;

const sizeStyles = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-base',
} as const;

const avatarBgPalette = [
  'bg-gray-900',
  'bg-gray-800',
  'bg-gray-700',
  'bg-gray-600',
  'bg-gray-500',
  'bg-gray-800',
  'bg-gray-700',
  'bg-gray-900',
] as const;

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    const w = parts[0];
    return w.length >= 2 ? w.slice(0, 2).toUpperCase() : w[0].toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export type AvatarSize = keyof typeof sizeStyles;

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name: string;
  size?: AvatarSize;
}

export function Avatar({
  className,
  src,
  alt,
  name,
  size = 'md',
  ...props
}: AvatarProps) {
  const initials = getInitials(name || '?');
  const bgClass = avatarBgPalette[hashName(name || ' ') % avatarBgPalette.length];
  const px = sizePixels[size];

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white',
        sizeStyles[size],
        !src && bgClass,
        className,
      )}
      role="img"
      aria-label={alt ?? name}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? name}
          width={px}
          height={px}
          unoptimized
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}
