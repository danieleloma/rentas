'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Calendar, Home, Inbox, LogIn, LogOut, Menu, MessageSquare,
  User, X, ChevronLeft, LayoutDashboard, Building2, Truck, Bell,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from './theme-toggle';
import { formatRelativeTime } from '@/lib/utils/format';

// ── Sections ──────────────────────────────────────────────────────────────────

function useSections() {
  const user = useAuthStore((s) => s.user);
  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';

  return [
    {
      label: 'Discover',
      links: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/browse', label: 'Public Listings', icon: Home },
      ],
    },
    {
      label: isLandlord ? 'Manage' : 'Activity',
      links: [
        ...(isLandlord
          ? [
              { href: '/listings/manage', label: 'My Listings', icon: Building2 },
              { href: '/inquiries', label: 'Inquiries', icon: Inbox },
            ]
          : []),
        { href: '/messages', label: 'Messages', icon: MessageSquare },
        { href: '/visits', label: 'Visits', icon: Calendar },
        ...(!isLandlord ? [{ href: '/movers', label: 'Movers', icon: Truck }] : []),
      ],
    },
    {
      label: 'Account',
      links: [
        { href: '/profile', label: 'Profile', icon: User },
      ],
    },
  ];
}

// ── Notification bell ─────────────────────────────────────────────────────────

interface NotifItem {
  id: string;
  label: string;
  sub: string;
  href: string;
  at: string;
}

function useNotifications(userId: string | undefined, isLandlord: boolean) {
  return useQuery<NotifItem[]>({
    queryKey: ['sidebar-notifications', userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!userId) return [];
      const items: NotifItem[] = [];

      // Unread messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, content, created_at, conversation_id')
        .eq('is_read', false)
        .neq('sender_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      for (const m of msgs ?? []) {
        items.push({
          id: `msg-${m.id}`,
          label: 'New message',
          sub: (m.content as string).slice(0, 60),
          href: '/messages',
          at: m.created_at as string,
        });
      }

      if (isLandlord) {
        // Pending visits
        const { data: visits } = await supabase
          .from('visits')
          .select('id, scheduled_at, listing:listings(title)')
          .eq('landlord_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3);

        for (const v of visits ?? []) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const title = (v.listing as any)?.title ?? 'listing';
          items.push({
            id: `visit-${v.id}`,
            label: 'Visit request',
            sub: `Pending visit for ${title}`,
            href: '/visits',
            at: v.scheduled_at as string,
          });
        }
      }

      return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8);
    },
  });
}

function NotificationBell({ collapsed }: { collapsed: boolean }) {
  const user = useAuthStore((s) => s.user);
  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';
  const { data: notifications = [] } = useNotifications(user?.id, isLandlord);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const count = notifications.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        className={cn(
          'relative flex items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent',
          collapsed ? 'h-8 w-8' : 'h-8 w-8',
        )}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
          'absolute z-50 w-72 rounded-xl border border-border bg-background shadow-xl',
          collapsed ? 'bottom-0 left-10' : 'bottom-0 left-10',
        )}>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {count > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {count} new
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{n.label}</p>
                      <p className="shrink-0 text-[10px] text-muted-foreground">
                        {formatRelativeTime(n.at)}
                      </p>
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{n.sub}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-border px-4 py-2">
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="text-xs text-primary hover:underline"
            >
              View all messages →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── NavLink ───────────────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  collapsed?: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, icon: Icon, collapsed, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const exactOnly = ['/dashboard', '/listings', '/browse'];
  const active = pathname === href || (!exactOnly.includes(href) && pathname.startsWith(`${href}/`));

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

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sections = useSections();

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
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
            <Link href="/dashboard" className="flex items-center gap-2">
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
                    key={`${href}-${lbl}`}
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
                {user && <NotificationBell collapsed={false} />}
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
              {user && <NotificationBell collapsed />}
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
