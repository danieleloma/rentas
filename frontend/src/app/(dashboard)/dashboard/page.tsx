'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Building2, Inbox, Calendar, MessageSquare, ArrowRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import { getInquiriesApi } from '@/lib/api/inquiries';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils/format';

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  loading,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  loading?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="group transition hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-900 transition">
              <Icon className="h-5 w-5 text-gray-600 group-hover:text-white transition" />
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:text-gray-600" />
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-semibold text-gray-900">{value}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';

  const { data: inquiries = [], isLoading: inquiriesLoading } = useQuery({
    queryKey: ['inquiries'],
    queryFn: getInquiriesApi,
    enabled: isLandlord,
  });

  const { data: listingsCount, isLoading: listingsLoading } = useQuery({
    queryKey: ['my-listings-count', user?.id],
    enabled: isLandlord && !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('landlord_id', user!.id);
      return count ?? 0;
    },
  });

  const { data: visitsCount, isLoading: visitsLoading } = useQuery({
    queryKey: ['visits-count', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const col = isLandlord ? 'landlord_id' : 'renter_id';
      const { count } = await supabase
        .from('visits')
        .select('id', { count: 'exact', head: true })
        .eq(col, user!.id)
        .eq('status', 'pending');
      return count ?? 0;
    },
  });

  const { data: messagesCount, isLoading: messagesLoading } = useQuery({
    queryKey: ['unread-messages-count', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user!.id);
      return count ?? 0;
    },
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const recentInquiries = inquiries.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{greeting}</p>
          <h1 className="mt-0.5 text-2xl font-semibold text-gray-900">
            {user ? `${user.firstName} ${user.lastName}` : 'Welcome'}
          </h1>
        </div>
        {user?.role && (
          <Badge className="capitalize">{user.role}</Badge>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLandlord && (
          <StatCard
            label="Active listings"
            value={listingsCount ?? 0}
            icon={Building2}
            href="/listings"
            loading={listingsLoading}
          />
        )}
        {isLandlord && (
          <StatCard
            label="Inquiries"
            value={inquiries.length}
            icon={Inbox}
            href="/inquiries"
            loading={inquiriesLoading}
          />
        )}
        <StatCard
          label="Pending visits"
          value={visitsCount ?? 0}
          icon={Calendar}
          href="/visits"
          loading={visitsLoading}
        />
        <StatCard
          label="Unread messages"
          value={messagesCount ?? 0}
          icon={MessageSquare}
          href="/messages"
          loading={messagesLoading}
        />
      </div>

      {/* Recent inquiries — landlords only */}
      {isLandlord && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-5 pb-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Recent inquiries</h2>
            </div>
            <Link
              href="/inquiries"
              className="text-xs font-medium text-gray-500 underline-offset-4 hover:text-gray-900 hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            {inquiriesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : recentInquiries.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No inquiries yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{inq.name}</p>
                      {inq.listing?.title && (
                        <p className="truncate text-xs text-gray-400">Re: {inq.listing.title}</p>
                      )}
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">{inq.message}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-400">{formatDate(inq.createdAt)}</p>
                      {inq.email && (
                        <a
                          href={`mailto:${inq.email}`}
                          className="mt-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                        >
                          Reply
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick actions — renters */}
      {!isLandlord && (
        <Card>
          <CardHeader className="p-5 pb-0">
            <h2 className="text-sm font-semibold text-gray-700">Quick actions</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 p-5 pt-4 sm:grid-cols-3">
            {[
              { label: 'Browse listings', href: '/listings', icon: Building2 },
              { label: 'My visits', href: '/visits', icon: Calendar },
              { label: 'Messages', href: '/messages', icon: MessageSquare },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                {label}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
