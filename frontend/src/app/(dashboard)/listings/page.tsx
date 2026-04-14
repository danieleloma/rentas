'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { ListingFilters } from '@/components/listings/listing-filters';
import { ListingGrid } from '@/components/listings/listing-grid';
import { useListings, useToggleFavorite } from '@/hooks/useListings';
import { useAuthStore } from '@/store/authStore';

export default function ListingsPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useListings();
  const toggleFavorite = useToggleFavorite();
  const user = useAuthStore((s) => s.user);

  const listings = data?.pages.flatMap((page) => page.data) ?? [];
  const isDemoMode = !isLoading && listings.length > 0 && listings.every((listing) => listing.id.startsWith('demo-'));
  const canCreateListing = user?.role === 'landlord' || user?.role === 'admin';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Browse Listings</h1>
        {canCreateListing && (
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            <Plus className="h-4 w-4" />
            New Listing
          </Link>
        )}
      </div>
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
