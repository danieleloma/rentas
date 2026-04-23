'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useListing } from '@/hooks/useListings';
import { BrowseListingDetail } from '@/components/browse/browse-listing-detail';
import { Skeleton } from '@/components/ui/skeleton';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: listing, isLoading } = useListing(id);

  return (
    <div>
      <Link
        href="/listings"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All listings
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-1.5 sm:grid-cols-2">
            <Skeleton className="aspect-[4/3] w-full sm:row-span-2" />
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="aspect-[4/3] w-full" />
          </div>
          <div className="mt-10 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ) : !listing ? (
        <div className="py-20 text-center">
          <p className="text-sm font-semibold text-muted-foreground">Not found</p>
          <p className="mt-2 text-sm text-muted-foreground">This listing is no longer available.</p>
          <Link
            href="/listings"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Back to listings
          </Link>
        </div>
      ) : (
        <BrowseListingDetail listing={listing} />
      )}
    </div>
  );
}
