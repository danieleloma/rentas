'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useListing } from '@/hooks/useListings';
import { ListingDetail } from '@/components/listings/listing-detail';
import { Skeleton } from '@/components/ui/skeleton';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: listing, isLoading } = useListing(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="aspect-[16/9] w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">Listing not found.</p>
        <Link
          href="/listings"
          className="mt-4 text-gray-900 underline-offset-4 hover:underline dark:text-gray-100"
        >
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/listings"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>
      <ListingDetail listing={listing} />
    </div>
  );
}
