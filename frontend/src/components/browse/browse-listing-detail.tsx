'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { MapPin, Bed, Bath, Maximize, Calendar, ArrowRight, Play, Star, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { getListingReviewsApi } from '@/lib/api/reviews';
import { VisitModal } from './visit-modal';
import { VirtualTourModal } from './virtual-tour-modal';
import { ListingMap } from './listing-map';
import { ContactModal } from './contact-modal';
import type { Listing } from '@/types';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'] });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= value ? 'fill-stone-700 text-stone-700' : 'text-stone-300'}`}
        />
      ))}
    </span>
  );
}

export function BrowseListingDetail({ listing }: { listing: Listing }) {
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', listing.id],
    queryFn: () => getListingReviewsApi(listing.id),
  });
  const reviews = reviewsData?.data ?? [];

  const [hero, ...rest] = listing.images ?? [];
  const location = [listing.address, listing.city, listing.state].filter(Boolean).join(', ');
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length
    : null;


  return (
    <div className={sans.className}>
      {/* ── Image gallery ─────────────────────────────────────── */}
      {listing.images.length > 0 ? (
        <div className="relative">
          <div className="grid gap-1.5 sm:grid-cols-2">
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
          </div>

          {/* Extra row */}
          {rest.slice(2, 5).length > 0 && (
            <div
              className={`mt-1.5 grid gap-1.5 ${
                rest.slice(2, 5).length === 1
                  ? 'grid-cols-1'
                  : rest.slice(2, 5).length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
              }`}
            >
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

          {/* Virtual tour button — overlaid on gallery */}
          {listing.virtualTourUrl && (
            <button
              type="button"
              onClick={() => setShowTourModal(true)}
              className="absolute bottom-4 left-4 flex items-center gap-2 border border-white/80 bg-stone-900/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-sm transition hover:bg-stone-900"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              360° Virtual tour
            </button>
          )}
        </div>
      ) : (
        <div className="aspect-[16/9] w-full bg-stone-200 bg-[linear-gradient(135deg,rgba(168,162,158,0.35)_0%,transparent_50%,rgba(120,113,108,0.2)_100%)]" />
      )}

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">

        {/* ── Left column ─────────────────────────────────────── */}
        <div className="space-y-12">

          {/* Title block */}
          <div>
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-400">
                {listing.propertyType.replace('_', ' ')}
              </p>
              {listing.isFeatured && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                  · Featured
                </span>
              )}
              {avgRating !== null && (
                <span className="flex items-center gap-1.5">
                  <StarRating value={Math.round(avgRating)} />
                  <span className="text-[12px] text-stone-400">
                    {avgRating.toFixed(1)} ({reviews.length})
                  </span>
                </span>
              )}
            </div>
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

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-px bg-stone-200 sm:grid-cols-4">
            {[
              { label: 'Bedrooms', value: listing.bedrooms },
              { label: 'Bathrooms', value: listing.bathrooms ?? '—' },
              { label: 'Sq ft', value: listing.squareFootage ?? '—' },
              {
                label: 'Available',
                value: listing.availableFrom ? formatDate(listing.availableFrom) : 'Now',
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#f7f6f4] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
                  {label}
                </p>
                <p className={`mt-2 text-2xl font-normal text-stone-900 ${display.className}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">
                About this home
              </p>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-stone-600">
                {listing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">
                Amenities
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                {listing.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-[13px] text-stone-600">
                    <span className="h-px w-4 shrink-0 bg-stone-300" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Map */}
          {listing.latitude != null && listing.longitude != null && (
            <ListingMap
              latitude={listing.latitude}
              longitude={listing.longitude}
              address={location}
            />
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">
                  Reviews
                </p>
                {avgRating !== null && (
                  <div className="flex items-center gap-2">
                    <StarRating value={Math.round(avgRating)} />
                    <span className="text-[13px] text-stone-500">
                      {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-t border-stone-100 pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[13px] font-medium text-stone-900">
                          {review.renter
                            ? `${review.renter.firstName} ${review.renter.lastName}`
                            : 'Verified tenant'}
                        </p>
                        <p className="mt-0.5 text-[12px] text-stone-400">
                          {formatDate(review.createdAt)}
                          {review.isVerified && (
                            <span className="ml-2 text-stone-500">· Verified stay</span>
                          )}
                        </p>
                      </div>
                      <StarRating value={review.overallRating} />
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-stone-600">{review.comment}</p>
                    {review.landlordResponse && (
                      <div className="mt-3 border-l-2 border-stone-200 pl-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400">
                          Landlord response
                        </p>
                        <p className="mt-1 text-[13px] text-stone-600">{review.landlordResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column — sticky price card ──────────────────── */}
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
                Listed by
              </p>
              <p className="mt-2 text-[14px] font-medium text-stone-900">
                {listing.landlord.firstName} {listing.landlord.lastName}
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="flex w-full items-center justify-center gap-2 bg-stone-900 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#f7f6f4] transition hover:bg-stone-800"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Contact landlord
              </button>
              <button
                type="button"
                onClick={() => setShowVisitModal(true)}
                className="flex w-full items-center justify-center gap-2 border border-stone-300 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-800 hover:text-stone-900"
              >
                <Calendar className="h-3.5 w-3.5" />
                Schedule a visit
              </button>
            </div>
          </div>

          {/* Virtual tour shortcut */}
          {listing.virtualTourUrl && (
            <button
              type="button"
              onClick={() => setShowTourModal(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 border border-stone-200 bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-stone-600 transition hover:border-stone-800 hover:text-stone-900"
            >
              <Play className="h-3.5 w-3.5" />
              View 360° tour
              <ArrowRight className="h-3.5 w-3.5 ml-auto" />
            </button>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      {showContactModal && (
        <ContactModal
          listingId={listing.id}
          listingTitle={listing.title}
          landlordId={listing.landlord.id}
          landlordName={`${listing.landlord.firstName} ${listing.landlord.lastName}`}
          landlordPhone={listing.landlord.phone}
          onClose={() => setShowContactModal(false)}
        />
      )}
      {showVisitModal && (
        <VisitModal
          listingId={listing.id}
          listingTitle={listing.title}
          onClose={() => setShowVisitModal(false)}
        />
      )}
      {showTourModal && listing.virtualTourUrl && (
        <VirtualTourModal
          url={listing.virtualTourUrl}
          title={listing.title}
          onClose={() => setShowTourModal(false)}
        />
      )}
    </div>
  );
}
