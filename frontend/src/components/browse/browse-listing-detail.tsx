'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { MapPin, Bed, Bath, Maximize, Calendar, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Listing } from '@/types';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'] });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

export function BrowseListingDetail({ listing }: { listing: Listing }) {
  const [hero, ...rest] = listing.images ?? [];
  const location = [listing.address, listing.city, listing.state].filter(Boolean).join(', ');

  return (
    <div className={sans.className}>
      {/* Image gallery */}
      {listing.images.length > 0 ? (
        <div className="grid gap-1.5 sm:grid-cols-2">
          {/* Hero image — spans full height on desktop */}
          <div className="overflow-hidden bg-stone-100 sm:row-span-2">
            <Image
              src={hero.url}
              alt={listing.title}
              width={900}
              height={675}
              className="aspect-[4/3] w-full object-cover sm:aspect-auto sm:h-full"
              unoptimized
              priority
            />
          </div>
          {/* Side thumbnails */}
          {rest.slice(0, 2).map((img) => (
            <div key={img.id} className="overflow-hidden bg-stone-100">
              <Image
                src={img.thumbnailUrl ?? img.url}
                alt={listing.title}
                width={600}
                height={450}
                className="aspect-[4/3] w-full object-cover"
                unoptimized
              />
            </div>
          ))}
          {/* Extra thumbnails in a row */}
          {rest.slice(2, 5).length > 0 && (
            <div className={`col-span-full grid gap-1.5 ${rest.slice(2, 5).length === 1 ? 'grid-cols-1' : rest.slice(2, 5).length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {rest.slice(2, 5).map((img) => (
                <div key={img.id} className="overflow-hidden bg-stone-100">
                  <Image
                    src={img.thumbnailUrl ?? img.url}
                    alt={listing.title}
                    width={600}
                    height={450}
                    className="aspect-[4/3] w-full object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-[16/9] w-full bg-stone-200 bg-[linear-gradient(135deg,rgba(168,162,158,0.35)_0%,transparent_50%,rgba(120,113,108,0.2)_100%)]" />
      )}

      {/* Main content */}
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Left: details */}
        <div className="space-y-10">
          {/* Title block */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-400">
              {listing.propertyType.replace('_', ' ')}
              {listing.isFeatured && <span className="ml-3 text-stone-500">· Featured</span>}
            </p>
            <h1 className={`mt-3 text-3xl font-normal leading-snug text-stone-900 sm:text-4xl md:text-[2.5rem] ${display.className}`}>
              {listing.title}
            </h1>
            {location && (
              <p className="mt-2 flex items-center gap-1.5 text-[14px] text-stone-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {location}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-px bg-stone-200 sm:grid-cols-4">
            <div className="bg-[#f7f6f4] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">Bedrooms</p>
              <p className={`mt-2 text-2xl font-normal text-stone-900 ${display.className}`}>{listing.bedrooms}</p>
            </div>
            <div className="bg-[#f7f6f4] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">Bathrooms</p>
              <p className={`mt-2 text-2xl font-normal text-stone-900 ${display.className}`}>{listing.bathrooms ?? '—'}</p>
            </div>
            <div className="bg-[#f7f6f4] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">Sq ft</p>
              <p className={`mt-2 text-2xl font-normal text-stone-900 ${display.className}`}>
                {listing.squareFootage ?? '—'}
              </p>
            </div>
            <div className="bg-[#f7f6f4] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">Available</p>
              <p className={`mt-2 text-2xl font-normal text-stone-900 ${display.className}`}>
                {listing.availableFrom ? formatDate(listing.availableFrom) : 'Now'}
              </p>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">About this home</p>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-stone-600">
                {listing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">Amenities</p>
              <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                {listing.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-[13px] text-stone-600">
                    <span className="h-px w-4 bg-stone-300" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Right: pricing card + CTA */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-stone-200 bg-white p-6 space-y-6">
            {/* Price */}
            <div>
              <p className={`text-[2rem] font-normal leading-none text-stone-900 ${display.className}`}>
                {formatCurrency(listing.monthlyRent)}
                <span className="ml-1 text-base font-normal text-stone-400">/mo</span>
              </p>
              {listing.deposit && (
                <p className="mt-1.5 text-[13px] text-stone-500">
                  Deposit: {formatCurrency(listing.deposit)}
                </p>
              )}
            </div>

            {/* Quick facts */}
            <div className="space-y-2 border-t border-stone-100 pt-5 text-[13px] text-stone-600">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 shrink-0 text-stone-400" />
                {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
              </div>
              {listing.bathrooms != null && (
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 shrink-0 text-stone-400" />
                  {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}
                </div>
              )}
              {listing.squareFootage && (
                <div className="flex items-center gap-2">
                  <Maximize className="h-4 w-4 shrink-0 text-stone-400" />
                  {listing.squareFootage} sq ft
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-stone-400" />
                Available {listing.availableFrom ? formatDate(listing.availableFrom) : 'now'}
              </div>
            </div>

            {/* Landlord */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">Listed by</p>
              <p className="mt-2 text-[14px] font-medium text-stone-900">
                {listing.landlord.firstName} {listing.landlord.lastName}
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-1">
              <Link
                href="/messages"
                className="flex w-full items-center justify-center gap-2 bg-stone-900 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#f7f6f4] transition hover:bg-stone-800"
              >
                Contact landlord
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/visits"
                className="flex w-full items-center justify-center gap-2 border border-stone-300 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-800 hover:text-stone-900"
              >
                Schedule a visit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
