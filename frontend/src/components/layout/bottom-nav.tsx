'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Home, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const tabs = [
  { href: '/listings', label: 'Home', icon: Home },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/visits', label: 'Visits', icon: Calendar },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-gray-800 dark:bg-gray-900"
      aria-label="Mobile navigation"
    >
      <div className="flex h-14 items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium sm:text-xs',
                active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400',
              )}
            >
              <Icon
                className={cn('h-5 w-5', active && 'text-gray-900 dark:text-gray-100')}
                strokeWidth={active ? 2.25 : 2}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
