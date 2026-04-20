'use client';

import { useState } from 'react';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import {
  MapPin, Bed, Bath, Maximize, Calendar, ArrowRight, Play, Star,
  MessageSquare, Phone, MessageCircle, Eye, ShieldCheck, ShieldAlert,
  Shield, Flag, Droplets, Zap, Volume2, Waves, Lock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { getListingReviewsApi } from '@/lib/api/reviews';
import { VisitModal } from './visit-modal';
import { VirtualTourModal } from './virtual-tour-modal';
import { ListingMap } from './listing-map';
import { ContactModal } from './contact-modal';
import { ListingGallery } from './listing-gallery';
import { ReportModal } from './report-modal';
import type { Listing, ReviewTag, VerificationStatus } from '@/types';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'] });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

function maskPhone(phone: string) {
  if (phone.length <= 5) return '*'.repeat(phone.length);
  return phone.slice(0, -5) + '*****';
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= value ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} />
      ))}
    </span>
  );
}

const VERIFICATION_CONFIG: Record<VerificationStatus, {
  label: string;
  icon: React.ElementType;
  className: string;
}> = {
  unverified: {
    label: 'Unverified',
    icon: Shield,
    className: 'text-stone-400 bg-stone-100',
  },
  phone_verified: {
    label: 'Phone Verified',
    icon: ShieldAlert,
    className: 'text-amber-700 bg-amber-50',
  },
  fully_verified: {
    label: 'Verified Property',
    icon: ShieldCheck,
    className: 'text-emerald-700 bg-emerald-50 verified-glow',
  },
};

const REVIEW_TAGS: { key: ReviewTag; label: string; icon: React.ElementType; positiveColor: string }[] = [
  { key: 'security', label: 'Security', icon: Lock, positiveColor: 'text-emerald-700 bg-emerald-50' },
  { key: 'water', label: 'Water Supply', icon: Droplets, positiveColor: 'text-blue-700 bg-blue-50' },
  { key: 'power', label: 'Power / NEPA', icon: Zap, positiveColor: 'text-amber-700 bg-amber-50' },
  { key: 'noise', label: 'Quiet Area', icon: Volume2, positiveColor: 'text-stone-700 bg-stone-100' },
  { key: 'flood_risk', label: 'No Flood Risk', icon: Waves, positiveColor: 'text-sky-700 bg-sky-50' },
];

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const cfg = VERIFICATION_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${cfg.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

export function BrowseListingDetail({ listing }: { listing: Listing }) {
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', listing.id],
    queryFn: () => getListingReviewsApi(listing.id),
  });
  const reviews = reviewsData?.data ?? [];

  const location = [listing.address, listing.city, listing.state].filter(Boolean).join(', ');
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.overallRating, 0) / reviews.length
    : null;

  // Count how many reviews mention each tag
  const tagCounts = REVIEW_TAGS.reduce<Record<ReviewTag, number>>((acc, t) => {
    acc[t.key] = reviews.filter((r) => r.tags?.includes(t.key)).length;
    return acc;
  }, {} as Record<ReviewTag, number>);

  return (
    <div className={sans.className}>
      {/* ── Image gallery ─────────────────────────────────────── */}
      <ListingGallery
        images={listing.images}
        title={listing.title}
        virtualTourUrl={listing.virtualTourUrl}
        onTourClick={() => setShowTourModal(true)}
      />

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">

        {/* ── Left column ─────────────────────────────────────── */}
        <div className="space-y-10">

          {/* Title block */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-400">
                {listing.propertyType.replace('_', ' ')}
              </p>
              {listing.isFeatured && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  Featured
                </span>
              )}
              <VerificationBadge status={listing.verificationStatus ?? 'unverified'} />
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
              { label: 'Sq m', value: listing.squareFootage ?? '—' },
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
                About this property
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
                  Tenant Reviews
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

              {/* Tag summary */}
              <div className="mt-4 flex flex-wrap gap-2">
                {REVIEW_TAGS.map((t) => {
                  const count = tagCounts[t.key];
                  if (count === 0) return null;
                  const Icon = t.icon;
                  return (
                    <span
                      key={t.key}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${t.positiveColor}`}
                    >
                      <Icon className="h-3 w-3" />
                      {t.label} · {count}
                    </span>
                  );
                })}
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
                            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600">
                              <ShieldCheck className="h-3 w-3" />
                              Verified stay
                            </span>
                          )}
                        </p>
                      </div>
                      <StarRating value={review.overallRating} />
                    </div>
                    {review.tags && review.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {review.tags.map((tag) => {
                          const cfg = REVIEW_TAGS.find((t) => t.key === tag);
                          if (!cfg) return null;
                          const Icon = cfg.icon;
                          return (
                            <span key={tag} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.positiveColor}`}>
                              <Icon className="h-2.5 w-2.5" />
                              {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
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

          {/* Report listing */}
          <div className="border-t border-stone-100 pt-6">
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 text-[12px] text-stone-400 transition hover:text-red-600"
            >
              <Flag className="h-3.5 w-3.5" />
              Report this listing
            </button>
          </div>
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
                  Caution: {formatCurrency(listing.deposit)}
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
                  {listing.squareFootage} sq m
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-stone-400" />
                Available {listing.availableFrom ? formatDate(listing.availableFrom) : 'now'}
              </div>
            </div>

            {/* Landlord + contact */}
            <div className="border-t border-stone-100 pt-5 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
                  Listed by
                </p>
                <p className="mt-2 text-[14px] font-medium text-stone-900">
                  {listing.landlord.firstName} {listing.landlord.lastName}
                </p>
              </div>

              {listing.landlord.phone && (
                <div className="space-y-2">
                  {contactRevealed ? (
                    <>
                      <a
                        href={`tel:${listing.landlord.phone}`}
                        className="flex items-center gap-2.5 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-[13px] font-medium text-stone-800 transition hover:border-stone-400"
                      >
                        <Phone className="h-4 w-4 shrink-0 text-stone-400" />
                        {listing.landlord.phone}
                      </a>
                      <a
                        href={`https://wa.me/${listing.landlord.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in "${listing.title}".`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-semibold text-green-800 transition hover:border-green-400"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0 text-green-600" />
                        Chat on WhatsApp
                      </a>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowContactModal(true)}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-stone-300 px-4 py-3 text-left text-[13px] text-stone-500 transition hover:border-stone-500 hover:text-stone-800"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-stone-300" />
                      <span className="flex-1 font-mono tracking-widest">
                        {maskPhone(listing.landlord.phone)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                        <Eye className="h-3 w-3" /> Reveal
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setShowContactModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-800"
              >
                <MessageSquare className="h-4 w-4" />
                Contact Landlord
              </button>
              <button
                type="button"
                onClick={() => setShowVisitModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-700 transition hover:border-stone-800 hover:text-stone-900"
              >
                <Calendar className="h-4 w-4" />
                Schedule a Visit
              </button>
            </div>
          </div>

          {listing.virtualTourUrl && (
            <button
              type="button"
              onClick={() => setShowTourModal(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-stone-600 transition hover:border-stone-800 hover:text-stone-900"
            >
              <Play className="h-3.5 w-3.5" />
              View 360° Tour
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
          onSuccess={() => setContactRevealed(true)}
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
      {showReportModal && (
        <ReportModal
          listingId={listing.id}
          listingTitle={listing.title}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
