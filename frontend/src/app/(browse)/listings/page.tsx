'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { BrowseListingFilters } from '@/components/browse/browse-listing-filters';
import { BrowseListingGrid } from '@/components/browse/browse-listing-grid';
import { useListings, useToggleFavorite } from '@/hooks/useListings';
import { useAuthStore } from '@/store/authStore';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'] });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

export default function ListingsPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useListings();
  const toggleFavorite = useToggleFavorite();
  const user = useAuthStore((s) => s.user);

  const listings = data?.pages.flatMap((page) => page.data) ?? [];
  const canCreateListing = user?.role === 'landlord' || user?.role === 'admin';

  return (
    <div className={sans.className}>
      {/* Page header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-500">
            Browse
          </p>
          <h1 className={`mt-3 text-3xl font-normal leading-snug text-stone-900 sm:text-4xl ${display.className}`}>
            Available listings
          </h1>
        </div>
        {canCreateListing && (
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 border border-stone-900 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-900 hover:text-[#f7f6f4]"
          >
            <Plus className="h-3.5 w-3.5" />
            New listing
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
