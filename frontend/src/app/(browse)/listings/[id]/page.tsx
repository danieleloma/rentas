'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Manrope } from 'next/font/google';
import { useListing } from '@/hooks/useListings';
import { BrowseListingDetail } from '@/components/browse/browse-listing-detail';

const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-1.5 sm:grid-cols-2">
        <div className="aspect-[4/3] w-full bg-stone-200 sm:row-span-2" />
        <div className="aspect-[4/3] w-full bg-stone-100" />
        <div className="aspect-[4/3] w-full bg-stone-100" />
      </div>
      <div className="mt-10 space-y-4">
        <div className="h-4 w-24 rounded bg-stone-200" />
        <div className="h-10 w-2/3 rounded bg-stone-200" />
        <div className="h-4 w-1/3 rounded bg-stone-100" />
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: listing, isLoading } = useListing(id);

  return (
    <div className={sans.className}>
      <Link
        href="/listings"
        className="mb-8 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.25em] text-stone-400 transition hover:text-stone-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All listings
      </Link>

      {isLoading ? (
        <SkeletonDetail />
      ) : !listing ? (
        <div className="py-20 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-400">
            Not found
          </p>
          <p className="mt-3 text-[15px] text-stone-500">This listing is no longer available.</p>
          <Link
            href="/listings"
            className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-900 underline-offset-4 hover:underline"
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
