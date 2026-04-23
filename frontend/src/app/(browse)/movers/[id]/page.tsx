'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft, Star, ShieldCheck, MapPin, Truck, CheckCircle, Package, LogIn,
} from 'lucide-react';
import { getMoverByIdApi, bookMoverApi } from '@/lib/api/movers';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const TIME_WINDOWS = [
  { label: 'Morning (8am – 12pm)', value: 'morning' },
  { label: 'Afternoon (12pm – 5pm)', value: 'afternoon' },
  { label: 'Evening (5pm – 8pm)', value: 'evening' },
];

// ── Booking sheet ─────────────────────────────────────────────────────────────

function BookingForm({
  moverId,
  pricePerHour,
  onClose,
}: {
  moverId: string;
  pricePerHour?: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const addToast = useUIStore((s) => s.addToast);

  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('morning');
  const [note, setNote] = useState('');

  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const estimatedPrice = pricePerHour ? pricePerHour * 4 : 0;

  const mutation = useMutation({
    mutationFn: () =>
      bookMoverApi({
        moverId,
        pickupAddress,
        dropoffAddress,
        scheduledDate,
        services: [],
        estimatedPrice,
        note: note || undefined,
      }),
    onSuccess: () => {
      addToast('Booking request sent! The mover will confirm shortly.', 'success');
      onClose();
      router.push('/movers');
    },
    onError: () => addToast('Failed to send booking request. Please try again.', 'error'),
  });

  const valid = pickupAddress && dropoffAddress && scheduledDate;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Book this mover</h2>
          {estimatedPrice > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Estimated: ₦{estimatedPrice.toLocaleString()} (4-hour job)
            </p>
          )}
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Move date *</label>
            <input
              type="date"
              min={minDate}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Time window *</label>
            <div className="space-y-2">
              {TIME_WINDOWS.map(({ label, value }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="time-window"
                    value={value}
                    checked={timeWindow === value}
                    onChange={() => setTimeWindow(value)}
                    className="accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Pickup address *</label>
            <input
              type="text"
              placeholder="e.g. 12 Admiralty Way, Lekki Phase 1"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Drop-off address *</label>
            <input
              type="text"
              placeholder="e.g. 5 Bode Thomas Street, Surulere"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Notes (optional)</label>
            <textarea
              placeholder="Special instructions, access codes, fragile items…"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="border-t border-border px-5 py-4 flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!valid || mutation.isPending}
            className="flex-1"
          >
            {mutation.isPending ? 'Sending request…' : 'Confirm booking'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MoverProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : (params.id?.[0] ?? '');
  const [bookingOpen, setBookingOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  const { data: mover, isLoading, isError } = useQuery({
    queryKey: ['mover', id],
    queryFn: () => getMoverByIdApi(id),
    enabled: !!id,
  });

  function handleBookClick() {
    if (!user) {
      router.push(`/login?next=/movers/${id}`);
      return;
    }
    setBookingOpen(true);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !mover) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="font-semibold text-foreground">Mover not found</p>
        <Link href="/movers">
          <Button variant="outline">Back to movers</Button>
        </Link>
      </div>
    );
  }

  const price = mover.hourlyRate
    ? `₦${mover.hourlyRate.toLocaleString()}/hr`
    : mover.fixedPrice
      ? `From ₦${mover.fixedPrice.toLocaleString()}`
      : null;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back */}
      <Link
        href="/movers"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All movers
      </Link>

      {/* Company header */}
      <div className="mb-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            {mover.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mover.logoUrl} alt={mover.companyName} className="h-full w-full rounded-xl object-cover" />
            ) : (
              <Truck className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{mover.companyName}</h1>
              {mover.isVerified && (
                <Badge className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            {mover.rating != null && (
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{mover.rating.toFixed(1)}</span>
                {mover.reviewCount != null && (
                  <span className="text-muted-foreground">({mover.reviewCount} reviews)</span>
                )}
              </div>
            )}
            {price && (
              <p className="mt-0.5 text-sm font-medium text-foreground">{price}</p>
            )}
          </div>
        </div>

        {mover.description && (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{mover.description}</p>
        )}

        {mover.serviceArea.length > 0 && (
          <div className="mt-4 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{mover.serviceArea.join(' · ')}</p>
          </div>
        )}

        {mover.insuranceCoverage && (
          <p className="mt-2 text-xs text-muted-foreground">
            Insurance coverage up to ₦{mover.insuranceCoverage.toLocaleString()}
          </p>
        )}
      </div>

      {/* Services */}
      {mover.services.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Services offered
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {mover.services.map((service) => (
              <div key={service} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                {service}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What to expect */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          What to expect
        </h2>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">1</span>
            Submit your booking request with move details
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">2</span>
            Mover confirms and contacts you to finalise
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">3</span>
            Move day — team arrives in the agreed window
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">4</span>
            Pay after completion. Leave a review.
          </li>
        </ol>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-6 flex justify-center">
        <Button size="lg" className="gap-2 shadow-lg" onClick={handleBookClick}>
          {user ? (
            <>
              <Package className="h-4 w-4" />
              Book This Mover
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in to Book
            </>
          )}
        </Button>
      </div>

      {/* Booking modal */}
      {bookingOpen && (
        <BookingForm
          moverId={mover.id}
          pricePerHour={mover.hourlyRate}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  );
}
