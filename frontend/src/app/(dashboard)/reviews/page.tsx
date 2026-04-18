'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getListingReviewsApi } from '@/lib/api/reviews';
import { useAuthStore } from '@/store/authStore';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils/format';

function StarRow({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < value ? 'fill-gray-800 text-gray-800' : 'text-gray-300'}`}
        />
      ))}
    </span>
  );
}

function useMyListingReviews() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['my-listing-reviews', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      // For landlords: fetch reviews on their listings
      // For renters: fetch reviews they wrote
      if (user.role === 'landlord' || user.role === 'admin') {
        const { data: listings } = await supabase
          .from('listings')
          .select('id')
          .eq('landlord_id', user.id);

        if (!listings?.length) return [];

        const results = await Promise.all(
          listings.map((l) => getListingReviewsApi(l.id)),
        );
        return results.flatMap((r) => r.data);
      } else {
        // Renter: their own reviews
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id, listing_id, renter_id, overall_rating, comment, pros, cons,
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
          comment: r.comment,
          pros: r.pros ?? [],
          cons: r.cons ?? [],
          landlordResponse: r.landlord_response ?? undefined,
          responseAt: r.response_at ?? undefined,
          isVerified: r.is_verified,
          createdAt: r.created_at,
          listing: r.listing,
        }));
      }
    },
  });
}

export default function ReviewsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: reviews = [], isLoading } = useMyListingReviews();

  const isLandlord = user?.role === 'landlord' || user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isLandlord ? 'Reviews on your listings' : 'Your reviews'}
        </h1>
        {reviews.length > 0 && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {reviews.map((review: any) => (
            <div
              key={review.id}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  {review.listing?.title && (
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {review.listing.title}
                    </p>
                  )}
                  {review.renter && (
                    <p className="text-xs text-gray-500">
                      {review.renter.firstName} {review.renter.lastName}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StarRow value={review.overallRating} />
                  {review.isVerified && (
                    <span className="text-[10px] font-medium text-green-600 dark:text-green-400">
                      Verified stay
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {review.comment}
              </p>

              {review.pros?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {review.pros.map((p: string) => (
                    <span
                      key={p}
                      className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    >
                      + {p}
                    </span>
                  ))}
                </div>
              )}

              {review.landlordResponse && (
                <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Landlord response
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {review.landlordResponse}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
