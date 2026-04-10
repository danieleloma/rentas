'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCreateListing } from '@/hooks/useListings';
import { ListingForm } from '@/components/listings/listing-form';

export default function NewListingPage() {
  const router = useRouter();
  const createListing = useCreateListing();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/listings"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Listing</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <ListingForm
          onSubmit={(data) => {
            createListing.mutate(data as Record<string, unknown>, {
              onSuccess: () => router.push('/listings'),
            });
          }}
          isLoading={createListing.isPending}
        />
      </div>
    </div>
  );
}
