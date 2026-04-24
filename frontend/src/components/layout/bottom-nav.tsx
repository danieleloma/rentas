'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Home, MessageSquare, User, Inbox, Truck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';

export function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';

  const tabs = isLandlord
    ? [
        { href: '/browse', label: 'Browse', icon: Home },
        { href: '/inquiries', label: 'Inbox', icon: Inbox },
        { href: '/messages', label: 'Chat', icon: MessageSquare },
        { href: '/visits', label: 'Visits', icon: Calendar },
        { href: '/profile', label: 'Profile', icon: User },
      ]
    : [
        { href: '/browse', label: 'Browse', icon: Home },
        { href: '/messages', label: 'Chat', icon: MessageSquare },
        { href: '/visits', label: 'Visits', icon: Calendar },
        { href: '/movers', label: 'Movers', icon: Truck },
        { href: '/profile', label: 'Profile', icon: User },
      ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-stretch justify-around">
        {tabs.map(({ href, label, icon: Icon }) => {
          const exactOnly = ['/browse'];
          const active = pathname === href || (!exactOnly.includes(href) && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
