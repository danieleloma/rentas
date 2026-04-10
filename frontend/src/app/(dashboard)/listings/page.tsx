'use client';

import { ListingFilters } from '@/components/listings/listing-filters';
import { ListingGrid } from '@/components/listings/listing-grid';
import { useListings, useToggleFavorite } from '@/hooks/useListings';

export default function ListingsPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useListings();
  const toggleFavorite = useToggleFavorite();

  const listings = data?.pages.flatMap((page) => page.data) ?? [];
  const isDemoMode = !isLoading && listings.length > 0 && listings.every((listing) => listing.id.startsWith('demo-'));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Browse Listings</h1>
      {isDemoMode && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-200">
          <p className="font-semibold">Demo renter flow enabled</p>
          <p className="mt-1">
            Open a listing, use <span className="font-medium">Contact Landlord</span> to go to Messages, and{' '}
            <span className="font-medium">Schedule Visit</span> to continue the renting journey.
          </p>
        </div>
      )}
      <ListingFilters />
      <ListingGrid
        listings={listings}
        isLoading={isLoading}
        onFavorite={(id) => toggleFavorite.mutate(id)}
        hasMore={hasNextPage}
        onLoadMore={() => fetchNextPage()}
        isFetchingMore={isFetchingNextPage}
      />
    </div>
  );
}
