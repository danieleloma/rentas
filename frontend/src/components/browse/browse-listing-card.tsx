'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bed, Bath, MapPin, Heart, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/format';
import type { Listing, VerificationStatus } from '@/types';

const VERIFICATION_BADGE: Record<VerificationStatus, { label: string; className: string }> = {
  fully_verified: { label: 'Verified', className: 'bg-primary/10 text-primary' },
  phone_verified: { label: 'Phone verified', className: 'bg-amber-50 text-amber-700' },
  unverified: { label: 'Unverified', className: 'bg-muted text-muted-foreground' },
};

function VerifIcon({ status }: { status: VerificationStatus }) {
  if (status === 'fully_verified') return <ShieldCheck className="h-3 w-3" />;
  if (status === 'phone_verified') return <ShieldAlert className="h-3 w-3" />;
  return <Shield className="h-3 w-3" />;
}

interface BrowseListingCardProps {
  listing: Listing;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export function BrowseListingCard({ listing, onFavorite, isFavorited }: BrowseListingCardProps) {
  const image = listing.images?.[0];
  const verif = listing.verificationStatus ?? 'unverified';
  const badge = VERIFICATION_BADGE[verif];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <Link href={`/listings/${listing.id}`} className="block">
        {/* Image */}
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
              <MapPin className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}

          {/* Overlays */}
          <div className="absolute left-2.5 top-2.5 flex gap-1.5">
            {listing.isFeatured && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                Featured
              </span>
            )}
            <span className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
              badge.className
            )}>
              <VerifIcon status={verif} />
              {badge.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-card-foreground">{listing.title}</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                {listing.address}, {listing.city}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-base font-bold text-card-foreground">{formatCurrency(listing.monthlyRent)}</p>
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
            <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
              {listing.propertyType.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </Link>

      {onFavorite && (
        <button
          type="button"
          onClick={() => onFavorite(listing.id)}
          aria-label={isFavorited ? 'Remove from saved' : 'Save listing'}
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition hover:bg-background"
        >
          <Heart className={cn(
            'h-4 w-4 transition',
            isFavorited ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-foreground',
          )} />
        </button>
      )}
    </div>
  );
}
