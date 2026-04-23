'use client';

import { BrowseListingCard } from './browse-listing-card';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchX } from 'lucide-react';
import type { Listing } from '@/types';

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-8 ml-auto" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

interface BrowseListingGridProps {
  listings: Listing[];
  onFavorite?: (id: string) => void;
  favoritedIds?: string[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
}

export function BrowseListingGrid({
  listings,
  onFavorite,
  favoritedIds = [],
  isLoading,
  hasMore,
  onLoadMore,
  isFetchingMore,
}: BrowseListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">No listings found</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Try adjusting your filters or search for a different city.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing, i) => (
          <div
            key={listing.id}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <BrowseListingCard
              listing={listing}
              onFavorite={onFavorite}
              isFavorited={favoritedIds.includes(listing.id)}
            />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isFetchingMore}
            className="rounded-md border border-border px-8 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent disabled:opacity-50"
          >
            {isFetchingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
