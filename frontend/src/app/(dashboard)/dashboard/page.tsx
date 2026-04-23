'use client';

import { useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Star, ShieldAlert, X } from 'lucide-react';
import { DashboardCards } from '@/components/dashboard-cards';
import { SectionCards } from '@/components/section-cards';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils/format';

// ── Verification nudge ─────────────────────────────────────────────────────────

function VerificationNudge() {
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('verify-nudge-dismissed') === '1'
  );

  function dismiss() {
    sessionStorage.setItem('verify-nudge-dismissed', '1');
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex-1 text-sm">
        <span className="font-medium text-amber-900 dark:text-amber-200">
          Verify your phone to get a trust badge on your listings
        </span>
        <span className="text-amber-700 dark:text-amber-400">
          {' '}— renters are 3× more likely to contact verified landlords.
        </span>
        <Link
          href="/profile#verification"
          className="ml-2 font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900 dark:text-amber-300"
        >
          Verify now →
        </Link>
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 text-amber-500 hover:text-amber-700 dark:text-amber-400"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Recent Reviews widget ──────────────────────────────────────────────────────

function StarRow({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </span>
  );
}

function RecentReviews({ userId }: { userId: string }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['dashboard-recent-reviews', userId],
    queryFn: async () => {
      // Get landlord's listing IDs
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title')
        .eq('landlord_id', userId)
        .neq('status', 'deleted');

      if (!listings?.length) return [];

      const listingIds = listings.map((l) => l.id);
      const listingMap = Object.fromEntries(listings.map((l) => [l.id, l.title]));

      const { data, error } = await supabase
        .from('reviews')
        .select('id, listing_id, overall_rating, comment, landlord_response, created_at')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      return (data ?? []).map((r) => ({
        id: r.id,
        listingTitle: listingMap[r.listing_id] ?? 'Listing',
        overallRating: r.overall_rating as number,
        comment: r.comment as string,
        landlordResponse: r.landlord_response as string | null,
        createdAt: r.created_at as string,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="text-sm font-semibold">Recent Reviews</CardTitle>
        <CardAction>
          <Link href="/reviews" className="text-xs text-muted-foreground hover:underline underline-offset-4">
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="divide-y">
          {reviews.map((review) => (
            <div key={review.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{review.listingTitle}</p>
                  <StarRow value={review.overallRating} />
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{review.comment}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</p>
                  {!review.landlordResponse && (
                    <Link href="/reviews">
                      <Button size="sm" variant="outline" className="mt-1 h-6 text-xs">
                        Respond
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';

  if (!user) redirect('/login');

  return (
    <div className="space-y-6">
      {/* Verification nudge — landlords without phone verification */}
      {isLandlord && !user?.phoneVerified && <VerificationNudge />}

      {/* KPI bar + 2-col action widgets (Inquiries | Visits Needing Action) */}
      <DashboardCards />

      {/* Performance metrics: Views, Contact Rate, Avg Response, Approval Rate */}
      <SectionCards />

      {/* Trend chart */}
      <ChartAreaInteractive />

      {/* Recent reviews with respond CTA */}
      {isLandlord && user && <RecentReviews userId={user.id} />}
    </div>
  );
}
