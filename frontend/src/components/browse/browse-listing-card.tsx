'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { Bed, Bath, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import type { Listing } from '@/types';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'] });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

interface BrowseListingCardProps {
  listing: Listing;
  onFavorite?: (id: string) => void;
}

export function BrowseListingCard({ listing, onFavorite }: BrowseListingCardProps) {
  const image = listing.images?.[0];
  const location = [listing.address, listing.city].filter(Boolean).join(', ');

  return (
    <div className={`${sans.className} group relative`}>
      <Link href={`/listings/${listing.id}`} className="block">
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
            <span className="mt-1 shrink-0 text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
              {listing.propertyType.replace('_', ' ')}
            </span>
          </div>
          <p className="mt-1 truncate text-[14px] font-medium text-stone-900">{listing.title}</p>
          {location && (
            <p className="mt-0.5 truncate text-[13px] text-stone-500">{location}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-[12px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <Bed className="h-3.5 w-3.5" />
              {listing.bedrooms} bed
            </span>
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-3.5 w-3.5" />
                {listing.bathrooms} bath
              </span>
            )}
          </div>
        </div>
      </Link>

      {onFavorite && (
        <button
          onClick={() => onFavorite(listing.id)}
          aria-label="Save listing"
          className="absolute right-0 top-0 p-1.5 text-stone-300 transition hover:text-stone-800"
        >
          <Heart className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
