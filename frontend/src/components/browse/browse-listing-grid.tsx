'use client';

import { Manrope } from 'next/font/google';
import { BrowseListingCard } from './browse-listing-card';
import type { Listing } from '@/types';

const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] w-full bg-stone-200" />
      <div className="mt-4 space-y-2.5">
        <div className="h-5 w-2/5 rounded bg-stone-200" />
        <div className="h-4 w-3/4 rounded bg-stone-100" />
        <div className="h-4 w-1/2 rounded bg-stone-100" />
        <div className="h-3.5 w-1/3 rounded bg-stone-100" />
      </div>
    </div>
  );
}

interface BrowseListingGridProps {
  listings: Listing[];
  onFavorite?: (id: string) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
}

export function BrowseListingGrid({
  listings,
  onFavorite,
  isLoading,
  hasMore,
  onLoadMore,
  isFetchingMore,
}: BrowseListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className={`${sans.className} py-20 text-center`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-400">
          No results
        </p>
        <p className="mt-3 text-[15px] text-stone-500">
          No listings match your filters. Try adjusting your search.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <BrowseListingCard key={listing.id} listing={listing} onFavorite={onFavorite} />
        ))}
      </div>

      {hasMore && (
        <div className={`${sans.className} mt-14 text-center`}>
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingMore}
            className="inline-flex items-center justify-center border border-stone-900 px-10 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-900 hover:text-[#f7f6f4] disabled:opacity-40"
          >
            {isFetchingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
