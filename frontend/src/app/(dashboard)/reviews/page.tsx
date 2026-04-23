'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Flag, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getListingReviewsApi, respondToReviewApi, flagReviewApi } from '@/lib/api/reviews';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/format';
import type { Review } from '@/types';

// ── Stars ────────────────────────────────────────────────────────────────────

function Stars({ value, max = 5, size = 'md' }: { value: number; max?: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${cls} ${i < value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </span>
  );
}

// ── Aggregate summary ────────────────────────────────────────────────────────

function AggregateSummary({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;

  const avg = reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length;
  const unresponded = reviews.filter((r) => !r.landlordResponse).length;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.overallRating === star).length,
  }));

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-foreground">{avg.toFixed(1)}</span>
          <Stars value={Math.round(avg)} />
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{reviews.length}</span> review{reviews.length !== 1 ? 's' : ''}
        </div>
        {unresponded > 0 && (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
            {unresponded} unresponded
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {distribution.map(({ star, count }) => {
          const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 text-right">{star}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-4">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Respond form ─────────────────────────────────────────────────────────────

function RespondForm({ reviewId, onDone }: { reviewId: string; onDone: () => void }) {
  const [text, setText] = useState('');
  const addToast = useUIStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => respondToReviewApi(reviewId, text.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listing-reviews'] });
      addToast('Response posted', 'success');
      onDone();
    },
    onError: () => addToast('Failed to post response', 'error'),
  });

  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
      <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Your response
      </p>
      <textarea
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        rows={3}
        maxLength={500}
        placeholder="Write a professional, helpful response…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{text.length}/500</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDone} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={!text.trim() || mutation.isPending}
          >
            {mutation.isPending ? 'Posting…' : 'Post response'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Flag modal ────────────────────────────────────────────────────────────────

const FLAG_REASONS = ['Fake / fabricated', 'Offensive content', 'Wrong listing', 'Other'];

function FlagModal({ reviewId, onClose }: { reviewId: string; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const addToast = useUIStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => flagReviewApi(reviewId, reason, notes || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listing-reviews'] });
      addToast('Review flagged for moderation', 'success');
      onClose();
    },
    onError: () => addToast('Failed to flag review', 'error'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-background border border-border p-5 shadow-lg">
        <h2 className="mb-4 font-semibold text-foreground">Flag this review</h2>
        <div className="mb-3 space-y-2">
          {FLAG_REASONS.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="flag-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-primary"
              />
              {r}
            </label>
          ))}
        </div>
        <textarea
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={2}
          maxLength={200}
          placeholder="Additional notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!reason || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Flagging…' : 'Submit flag'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Category ratings ──────────────────────────────────────────────────────────

function CategoryRatings({ review }: { review: Review }) {
  const cats = [
    { label: 'Neighbourhood', value: review.neighborhoodRating },
    { label: 'Noise', value: review.noiseRating },
    { label: 'Maintenance', value: review.maintenanceRating },
    { label: 'Amenities', value: review.amenitiesRating },
  ].filter((c) => c.value != null);

  if (!cats.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {cats.map((c) => (
        <div key={c.label} className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{c.label}</span>
          <Stars value={c.value!} size="sm" />
        </div>
      ))}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({ review, isLandlord }: { review: Review; isLandlord: boolean }) {
  const [responding, setResponding] = useState(false);
  const [flagging, setFlagging] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(review as any).listing?.title && (
            <p className="text-sm font-semibold text-foreground">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(review as any).listing.title}
            </p>
          )}
          {review.renter && (
            <p className="text-xs text-muted-foreground">
              {review.renter.firstName} {review.renter.lastName}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Stars value={review.overallRating} />
          {review.isVerified && (
            <span className="text-[10px] font-medium text-green-600">Verified stay</span>
          )}
        </div>
      </div>

      {/* Category ratings */}
      <CategoryRatings review={review} />

      {/* Comment */}
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>

      {/* Pros */}
      {review.pros?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.pros.map((p) => (
            <span key={p} className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] text-green-700 border border-green-200">
              + {p}
            </span>
          ))}
        </div>
      )}

      {/* Cons */}
      {review.cons?.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {review.cons.map((c) => (
            <span key={c} className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700 border border-red-200">
              − {c}
            </span>
          ))}
        </div>
      )}

      {/* Existing landlord response */}
      {review.landlordResponse && (
        <div className="mt-3 rounded-lg border border-border bg-muted/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Your response
          </p>
          <p className="mt-1 text-sm text-foreground">{review.landlordResponse}</p>
        </div>
      )}

      {/* Landlord actions */}
      {isLandlord && (
        <div className="mt-4 flex items-center gap-3">
          {!review.landlordResponse && !responding && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setResponding(true)}
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Respond
            </Button>
          )}
          <button
            onClick={() => setFlagging(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Flag className="h-3 w-3" />
            Flag review
          </button>
        </div>
      )}

      {responding && (
        <RespondForm reviewId={review.id} onDone={() => setResponding(false)} />
      )}

      {flagging && (
        <FlagModal reviewId={review.id} onClose={() => setFlagging(false)} />
      )}
    </div>
  );
}

// ── Data hook ─────────────────────────────────────────────────────────────────

function useMyListingReviews() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['my-listing-reviews', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      if (user.role === 'landlord' || user.role === 'admin') {
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title')
          .eq('landlord_id', user.id)
          .neq('status', 'deleted');

        if (!listings?.length) return [];

        const results = await Promise.all(
          listings.map((l) =>
            getListingReviewsApi(l.id).then((r) =>
              r.data.map((rev) => ({ ...rev, listing: { id: l.id, title: l.title } }))
            )
          )
        );
        return results.flat().sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // Renter: their own reviews
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id, listing_id, renter_id, overall_rating, neighborhood_rating, noise_rating,
          maintenance_rating, amenities_rating, comment, pros, cons, tags,
          landlord_response, response_at, is_verified, created_at,
          listing:listings ( id, title )
        `)
        .eq('renter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r: any) => ({
        id: r.id,
        listingId: r.listing_id,
        renterId: r.renter_id,
        overallRating: r.overall_rating,
        neighborhoodRating: r.neighborhood_rating ?? undefined,
        noiseRating: r.noise_rating ?? undefined,
        maintenanceRating: r.maintenance_rating ?? undefined,
        amenitiesRating: r.amenities_rating ?? undefined,
        comment: r.comment,
        pros: r.pros ?? [],
        cons: r.cons ?? [],
        tags: r.tags ?? [],
        landlordResponse: r.landlord_response ?? undefined,
        responseAt: r.response_at ?? undefined,
        isVerified: r.is_verified,
        createdAt: r.created_at,
        listing: r.listing,
      }));
    },
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

type SortOption = 'newest' | 'oldest' | 'lowest' | 'unresponded';

export default function ReviewsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: reviews = [], isLoading } = useMyListingReviews();
  const [sort, setSort] = useState<SortOption>('newest');

  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === 'lowest') return a.overallRating - b.overallRating;
    if (sort === 'unresponded') {
      if (!a.landlordResponse && b.landlordResponse) return -1;
      if (a.landlordResponse && !b.landlordResponse) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isLandlord ? 'Reviews on your listings' : 'Your reviews'}
          </h1>
          {reviews.length > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {isLandlord && reviews.length > 0 && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="lowest">Lowest rated</option>
            <option value="unresponded">Unresponded first</option>
          </select>
        )}
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          {isLandlord && <AggregateSummary reviews={reviews as Review[]} />}

          {sorted.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-muted-foreground">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((review) => (
                <ReviewCard key={review.id} review={review as Review} isLandlord={isLandlord} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
