'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { Bed, Bath, ArrowRight } from 'lucide-react';
import { getListingsApi } from '@/lib/api/listings';
import { formatCurrency } from '@/lib/utils/format';
import type { Listing } from '@/types';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'] });
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

function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images?.[0];
  const location = [listing.address, listing.city].filter(Boolean).join(', ');

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="overflow-hidden bg-stone-100">
        {image ? (
          <Image
            src={image.thumbnailUrl ?? image.url}
            alt={listing.title}
            width={600}
            height={450}
            className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <div className="aspect-[4/3] w-full bg-stone-200 bg-[linear-gradient(135deg,rgba(168,162,158,0.35)_0%,transparent_50%,rgba(120,113,108,0.2)_100%)]" />
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[1.35rem] font-normal leading-tight text-stone-900 ${display.className}`}>
            {formatCurrency(listing.monthlyRent)}
            <span className="ml-0.5 text-sm font-normal text-stone-400">/mo</span>
          </p>
          <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
            {listing.propertyType.replace('_', ' ')}
          </span>
        </div>

        <p className="mt-1 truncate text-[14px] font-medium text-stone-900">{listing.title}</p>

        {location && (
          <p className="mt-0.5 truncate text-[13px] text-stone-500">{location}</p>
        )}

        <div className="mt-3 flex items-center gap-4 text-[12px] text-stone-400">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            {listing.bedrooms} bed
          </span>
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {listing.bathrooms} bath
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function FeaturedListingsSection() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListingsApi({ limit: 6 }).then(({ data }) => {
      setListings(data.slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <section className={`${sans.className} border-t border-stone-200 bg-[#f7f6f4] px-5 py-20 sm:px-8 sm:py-28`}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone-500">
              Live listings
            </p>
            <h2 className={`mt-4 text-3xl font-normal leading-snug text-stone-900 sm:text-4xl md:text-[2.5rem] ${display.className}`}>
              Homes available now.
            </h2>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-600 underline-offset-4 transition hover:text-stone-900 hover:underline"
          >
            View all listings
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)
            : listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>

        {/* CTA */}
        {!loading && (
          <div className="mt-16 text-center">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center gap-2 border border-stone-900 px-10 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-900 hover:text-[#f7f6f4]"
            >
              Explore all listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
