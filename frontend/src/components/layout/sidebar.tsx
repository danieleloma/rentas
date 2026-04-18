'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Calendar, Home, Inbox, LayoutDashboard, LogIn, LogOut, Menu, MessageSquare, User, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from './theme-toggle';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/listings', label: 'Listings', icon: Home },
  { href: '/inquiries', label: 'Inquiries', icon: Inbox },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/visits', label: 'Visits', icon: Calendar },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white/95 px-3 py-3 backdrop-blur md:hidden dark:border-gray-800 dark:bg-gray-900/95">
        <Link href="/listings" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Rentas
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-gray-200 bg-white transition-transform md:sticky md:top-0 md:z-20 md:h-screen md:w-64 md:translate-x-0 dark:border-gray-800 dark:bg-gray-900',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className="hidden border-b border-gray-200 px-5 py-4 md:block dark:border-gray-800">
          <Link href="/listings" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Rentas
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                pathname === href || pathname.startsWith(`${href}/`)
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-4 dark:border-gray-800">
          <div className="mb-3">
            <ThemeToggle className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800" />
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-900 text-sm font-semibold text-white">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span>
                  {user
                    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?'
                    : '?'}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {user?.email ?? 'Not signed in'}
              </p>
            </div>
          </div>

          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
