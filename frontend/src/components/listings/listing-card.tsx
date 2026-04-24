'use client';

import Link from 'next/link';
import { Heart, Bed, Bath, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import type { Listing } from '@/types';

interface ListingCardProps {
  listing: Listing;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export function ListingCard({ listing, onFavorite, isFavorited }: ListingCardProps) {
  const thumbnail = listing.images?.[0]?.thumbnailUrl || listing.images?.[0]?.url;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <Link href={`/listings/${listing.id}/preview`} className="block">
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300 dark:text-gray-600">
              <Maximize className="h-12 w-12" />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge variant="default">{listing.propertyType}</Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-semibold text-gray-900 dark:text-gray-100">{listing.title}</h3>
            <span className="shrink-0 text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(listing.monthlyRent)}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mo</span>
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
            {listing.address}, {listing.city}
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1">
              <Bed className="h-4 w-4" /> {listing.bedrooms} bd
            </span>
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" /> {listing.bathrooms} ba
              </span>
            )}
            {listing.squareFootage && (
              <span className="flex items-center gap-1">
                <Maximize className="h-4 w-4" /> {listing.squareFootage} sqft
              </span>
            )}
          </div>
        </div>
      </Link>

      {onFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavorite(listing.id);
          }}
          className="absolute right-3 top-3 rounded-full bg-white/80 p-2 backdrop-blur transition hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900"
        >
          <Heart
            className={cn(
              'h-5 w-5',
              isFavorited
                ? 'fill-gray-900 text-gray-900 dark:fill-gray-100 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-300',
            )}
          />
        </button>
      )}
    </div>
  );
}
