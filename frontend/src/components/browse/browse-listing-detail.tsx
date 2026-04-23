'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Listing, ReviewTag, VerificationStatus } from '@/types';

function maskPhone(phone: string) {
  if (phone.length <= 5) return '*'.repeat(phone.length);
  return phone.slice(0, -5) + '*****';
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= value ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`} />
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
    className: 'bg-secondary text-secondary-foreground',
  },
  phone_verified: {
    label: 'Phone Verified',
    icon: ShieldAlert,
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  fully_verified: {
    label: 'Verified Property',
    icon: ShieldCheck,
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
};

const REVIEW_TAGS: { key: ReviewTag; label: string; icon: React.ElementType; className: string }[] = [
  { key: 'security', label: 'Security', icon: Lock, className: 'text-emerald-700 bg-emerald-50' },
  { key: 'water', label: 'Water Supply', icon: Droplets, className: 'text-blue-700 bg-blue-50' },
  { key: 'power', label: 'Power / NEPA', icon: Zap, className: 'text-amber-700 bg-amber-50' },
  { key: 'noise', label: 'Quiet Area', icon: Volume2, className: 'text-muted-foreground bg-muted' },
  { key: 'flood_risk', label: 'No Flood Risk', icon: Waves, className: 'text-sky-700 bg-sky-50' },
];

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const cfg = VERIFICATION_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      <Icon className="h-3 w-3" />
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

  const tagCounts = REVIEW_TAGS.reduce<Record<ReviewTag, number>>((acc, t) => {
    acc[t.key] = reviews.filter((r) => r.tags?.includes(t.key)).length;
    return acc;
  }, {} as Record<ReviewTag, number>);

  return (
    <div>
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
              <Badge variant="secondary" className="uppercase tracking-wider">
                {listing.propertyType.replace('_', ' ')}
              </Badge>
              {listing.isFeatured && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Featured
                </Badge>
              )}
              <VerificationBadge status={listing.verificationStatus ?? 'unverified'} />
              {avgRating !== null && (
                <span className="flex items-center gap-1.5">
                  <StarRating value={Math.round(avgRating)} />
                  <span className="text-xs text-muted-foreground">
                    {avgRating.toFixed(1)} ({reviews.length})
                  </span>
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-semibold leading-snug text-foreground sm:text-4xl">
              {listing.title}
            </h1>
            {location && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {location}
              </p>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            {[
              { label: 'Bedrooms', value: listing.bedrooms },
              { label: 'Bathrooms', value: listing.bathrooms ?? '—' },
              { label: 'Sq m', value: listing.squareFootage ?? '—' },
              {
                label: 'Available',
                value: listing.availableFrom ? formatDate(listing.availableFrom) : 'Now',
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                About this property
              </p>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {listing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Amenities
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                {listing.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-px w-4 shrink-0 bg-border" />
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
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Tenant Reviews
                </p>
                {avgRating !== null && (
                  <div className="flex items-center gap-2">
                    <StarRating value={Math.round(avgRating)} />
                    <span className="text-sm text-muted-foreground">
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
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${t.className}`}
                    >
                      <Icon className="h-3 w-3" />
                      {t.label} · {count}
                    </span>
                  );
                })}
              </div>

              <div className="mt-6 space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-t border-border pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {review.renter
                            ? `${review.renter.firstName} ${review.renter.lastName}`
                            : 'Verified tenant'}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
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
                            <span key={tag} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.className}`}>
                              <Icon className="h-2.5 w-2.5" />
                              {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                    {review.landlordResponse && (
                      <div className="mt-3 border-l-2 border-border pl-4">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Landlord response
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{review.landlordResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report listing */}
          <div className="border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 text-xs text-muted-foreground transition hover:text-destructive"
            >
              <Flag className="h-3.5 w-3.5" />
              Report this listing
            </button>
          </div>
        </div>

        {/* ── Right column — sticky price card ──────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="p-6 space-y-5">
              {/* Price */}
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(listing.monthlyRent)}
                  <span className="ml-1 text-base font-normal text-muted-foreground">/mo</span>
                </p>
                {listing.deposit && (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Caution: {formatCurrency(listing.deposit)}
                  </p>
                )}
              </div>

              <Separator />

              {/* Quick facts */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 shrink-0" />
                  {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
                </div>
                {listing.bathrooms != null && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 shrink-0" />
                    {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}
                  </div>
                )}
                {listing.squareFootage && (
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4 shrink-0" />
                    {listing.squareFootage} sq m
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  Available {listing.availableFrom ? formatDate(listing.availableFrom) : 'now'}
                </div>
              </div>

              <Separator />

              {/* Landlord + contact */}
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Listed by
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground">
                    {listing.landlord.firstName} {listing.landlord.lastName}
                  </p>
                </div>

                {listing.landlord.phone && (
                  <div className="space-y-2">
                    {contactRevealed ? (
                      <>
                        <a
                          href={`tel:${listing.landlord.phone}`}
                          className="flex items-center gap-2.5 rounded-lg border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/80"
                        >
                          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                          {listing.landlord.phone}
                        </a>
                        <a
                          href={`https://wa.me/${listing.landlord.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in "${listing.title}".`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-100"
                        >
                          <MessageCircle className="h-4 w-4 shrink-0 text-green-600" />
                          Chat on WhatsApp
                        </a>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowContactModal(true)}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-border px-4 py-3 text-left text-sm text-muted-foreground transition hover:border-foreground/50 hover:text-foreground"
                      >
                        <Phone className="h-4 w-4 shrink-0" />
                        <span className="flex-1 font-mono tracking-widest">
                          {maskPhone(listing.landlord.phone)}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                          <Eye className="h-3 w-3" /> Reveal
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                <Button
                  className="w-full gap-2"
                  onClick={() => setShowContactModal(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Contact Landlord
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowVisitModal(true)}
                >
                  <Calendar className="h-4 w-4" />
                  Schedule a Visit
                </Button>
              </div>
            </CardContent>
          </Card>

          {listing.virtualTourUrl && (
            <Button
              variant="outline"
              className="mt-3 w-full gap-2"
              onClick={() => setShowTourModal(true)}
            >
              <Play className="h-3.5 w-3.5" />
              View 360° Tour
              <ArrowRight className="h-3.5 w-3.5 ml-auto" />
            </Button>
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
