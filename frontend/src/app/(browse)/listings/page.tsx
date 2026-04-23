'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { BrowseListingFilters } from '@/components/browse/browse-listing-filters';
import { BrowseListingGrid } from '@/components/browse/browse-listing-grid';
import { useListings, useToggleFavorite } from '@/hooks/useListings';
import { useAuthStore } from '@/store/authStore';

export default function PublicListingsPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useListings();
  const toggleFavorite = useToggleFavorite();
  const user = useAuthStore((s) => s.user);

  const listings = data?.pages.flatMap((page) => page.data) ?? [];
  const canCreate = user?.role === 'landlord' || user?.role === 'admin';

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse verified rentals across Nigeria
          </p>
        </div>
        {canCreate && (
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add listing
          </Link>
        )}
      </div>

      <BrowseListingFilters />

      <BrowseListingGrid
        listings={listings}
        isLoading={isLoading}
        onFavorite={user ? (id) => toggleFavorite.mutate(id) : undefined}
        hasMore={hasNextPage}
        onLoadMore={() => fetchNextPage()}
        isFetchingMore={isFetchingNextPage}
      />
    </div>
  );
}
