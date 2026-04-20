'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Bed, Bath, MapPin, ShieldCheck } from 'lucide-react';
import { getListingsApi } from '@/lib/api/listings';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Listing } from '@/types';

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-[4/3] bg-muted" />
      <div className="space-y-2.5 p-4">
        <div className="h-4 w-3/4 rounded-md bg-muted" />
        <div className="h-3 w-1/2 rounded-md bg-muted" />
        <div className="flex gap-3">
          <div className="h-3 w-12 rounded-md bg-muted" />
          <div className="h-3 w-12 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ listing }: { listing: Listing }) {
  const image = listing.images?.[0];
  const verified = listing.verificationStatus === 'fully_verified';

  return (
    <Link href={`/listings/${listing.id}`} className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image.thumbnailUrl ?? image.url}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPin className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        {verified && (
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <ShieldCheck className="h-3 w-3" />
            Verified
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-card-foreground">{listing.title}</p>
            <p className={cn(
              'mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground',
            )}>
              <MapPin className="h-3 w-3 shrink-0" />
              {listing.city}{listing.state ? `, ${listing.state}` : ''}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-card-foreground">{formatCurrency(listing.monthlyRent)}</p>
            <p className="text-xs text-muted-foreground">/mo</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
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
    <section className="border-t border-border bg-background px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Live listings
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Properties available now
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified rentals across Nigeria — Lagos, Abuja, Port Harcourt and more.
            </p>
          </div>
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:underline"
          >
            View all listings
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : listings.map((listing) => <FeaturedCard key={listing.id} listing={listing} />)
          }
        </div>

        {!loading && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
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
