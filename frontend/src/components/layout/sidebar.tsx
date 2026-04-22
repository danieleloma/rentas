'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Calendar, Home, Inbox, LogIn, LogOut, Menu, MessageSquare,
  User, X, ChevronLeft, Settings,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from './theme-toggle';

const sections = [
  {
    label: 'Discover',
    links: [
      { href: '/listings', label: 'Listings', icon: Home },
    ],
  },
  {
    label: 'Manage',
    links: [
      { href: '/inquiries', label: 'Inquiries', icon: Inbox },
      { href: '/messages', label: 'Messages', icon: MessageSquare },
      { href: '/visits', label: 'Visits', icon: Calendar },
    ],
  },
  {
    label: 'Account',
    links: [
      { href: '/profile', label: 'Profile', icon: User },
    ],
  },
];

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed?: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, icon: Icon, collapsed, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-2',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
        <Link href="/listings" className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-foreground">Rentas</span>
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">NG</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200',
          'md:sticky md:top-0 md:h-screen md:translate-x-0',
          collapsed ? 'md:w-16' : 'md:w-60',
          open ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Logo + collapse */}
        <div className={cn(
          'flex h-14 shrink-0 items-center border-b border-sidebar-border px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}>
          {!collapsed && (
            <Link href="/listings" className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground">Rentas</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">NG</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent md:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
          {sections.map(({ label, links }) => (
            <div key={label}>
              {!collapsed && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {label}
                </p>
              )}
              <div className="space-y-0.5">
                {links.map(({ href, label: lbl, icon }) => (
                  <NavLink
                    key={href}
                    href={href}
                    label={lbl}
                    icon={icon}
                    collapsed={collapsed}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn(
          'shrink-0 border-t border-sidebar-border p-3',
          collapsed && 'flex flex-col items-center gap-2',
        )}>
          {!collapsed && (
            <>
              {/* User info */}
              <div className="mb-2 flex items-center gap-3 rounded-md px-3 py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user?.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="" width={32} height={32} className="h-full w-full object-cover" unoptimized />
                  ) : (
                    <span>{user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-sidebar-foreground">
                    {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">{user?.email ?? ''}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5">
                <ThemeToggle className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent" />
                {user ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Sign in
                  </Link>
                )}
              </div>
            </>
          )}

          {collapsed && (
            <>
              <ThemeToggle className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent" />
              <button
                type="button"
                onClick={() => logout()}
                className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
