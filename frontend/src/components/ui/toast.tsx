'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/cn';

const typeStyles = {
  success: 'border-gray-300 bg-gray-50 text-gray-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-gray-300 bg-white text-gray-900',
  warning: 'border-gray-300 bg-gray-100 text-gray-900',
} as const;

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-[100] flex w-full max-w-sm flex-col gap-2 px-4',
        'bottom-4 left-1/2 -translate-x-1/2',
        'md:left-auto md:right-4 md:translate-x-0',
      )}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-lg transition-all duration-200',
            typeStyles[toast.type],
          )}
          role="status"
        >
          <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            aria-label="Dismiss notification"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
