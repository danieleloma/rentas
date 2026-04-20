'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Truck, ShieldCheck, Star, MapPin, MessageCircle,
  Search, Loader2, CheckCircle, X, Package, Shield
} from 'lucide-react';
import { getMoversApi, bookMoverApi, type BookMoverPayload } from '@/lib/api/movers';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/skeleton';
import type { Mover } from '@/types';

const NIGERIAN_CITIES = [
  'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Benin City', 'Enugu', 'Warri',
];

const MOVER_SERVICES = [
  'Furniture moving', 'Packing & unpacking', 'Loading & offloading',
  'Long distance', 'Office relocation', 'Storage',
];

function MoverSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  );
}

function MoverCard({ mover, onBook }: { mover: Mover; onBook: (m: Mover) => void }) {
  const waLink = `https://wa.me/?text=${encodeURIComponent(`Hi, I need moving services from ${mover.companyName}`)}`;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {mover.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mover.logoUrl} alt={mover.companyName} className="h-full w-full rounded-lg object-cover" />
          ) : (
            <Truck className="h-6 w-6" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-semibold text-card-foreground">{mover.companyName}</p>
            {mover.isVerified ? (
              <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <ShieldCheck className="h-2.5 w-2.5" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Shield className="h-2.5 w-2.5" /> Unverified
              </span>
            )}
          </div>
          {mover.serviceArea.length > 0 && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {mover.serviceArea.slice(0, 3).join(', ')}
              {mover.serviceArea.length > 3 && ` +${mover.serviceArea.length - 3}`}
            </p>
          )}
          {mover.rating && (
            <div className="mt-1 flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{mover.rating.toFixed(1)}</span>
              {mover.reviewCount && <span className="text-xs text-muted-foreground">({mover.reviewCount})</span>}
            </div>
          )}
        </div>

        {(mover.hourlyRate || mover.fixedPrice) && (
          <div className="shrink-0 text-right">
            {mover.hourlyRate && <p className="text-sm font-bold text-card-foreground">{formatCurrency(mover.hourlyRate)}/hr</p>}
            {mover.fixedPrice && <p className="text-xs text-muted-foreground">{formatCurrency(mover.fixedPrice)} flat</p>}
          </div>
        )}
      </div>

      {mover.description && (
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{mover.description}</p>
      )}

      {mover.services.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {mover.services.slice(0, 4).map((s) => (
            <span key={s} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onBook(mover)}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <Package className="h-4 w-4" />
          Book Now
        </button>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800 transition hover:border-green-400"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}

function BookingModal({ mover, onClose }: { mover: Mover; onClose: () => void }) {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: BookMoverPayload) => bookMoverApi(payload),
    onSuccess: () => setDone(true),
  });

  const toggleService = (s: string) =>
    setServices((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !dropoff || !date || services.length === 0) return;
    const estimated = mover.hourlyRate ? Number(mover.hourlyRate) * 4 : Number(mover.fixedPrice ?? 50000);
    mutation.mutate({ moverId: mover.id, pickupAddress: pickup, dropoffAddress: dropoff, scheduledDate: date, services, estimatedPrice: estimated, note: note || undefined });
  };

  const fieldCls = 'w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-y-auto rounded-t-xl bg-background p-6 shadow-xl sm:rounded-xl max-h-[90vh]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">Book {mover.companyName}</p>
            <p className="text-xs text-muted-foreground">Fill in your moving details</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">Booking Requested!</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {mover.companyName} will contact you within 2 hours to confirm.
            </p>
            <button onClick={onClose} className="mt-2 rounded-md bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Pickup address</label>
              <input required value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Current address" className={fieldCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Destination address</label>
              <input required value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="New address" className={fieldCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Moving date</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={fieldCls} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-foreground">Services needed</label>
              <div className="flex flex-wrap gap-2">
                {MOVER_SERVICES.map((s) => (
                  <button key={s} type="button" onClick={() => toggleService(s)}
                    className={cn('rounded-full border px-3 py-1 text-xs font-medium transition', services.includes(s) ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Notes (optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. 3-bedroom flat, 2nd floor, fragile items…" rows={2} className={fieldCls} />
            </div>
            {mutation.error && <p className="text-xs text-destructive">{mutation.error instanceof Error ? mutation.error.message : 'Failed.'}</p>}
            <button type="submit" disabled={mutation.isPending || !pickup || !dropoff || !date || services.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
              Request Booking
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function MoversPage() {
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [selectedMover, setSelectedMover] = useState<Mover | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['movers', city],
    queryFn: () => getMoversApi(city || undefined),
  });

  const movers = (data?.data ?? []).filter((m) =>
    !search || m.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Moving Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trusted, verified movers across Nigeria. Compare pricing and book instantly.
        </p>
      </div>

      {/* Search + city filter */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mover by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-4 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['', ...NIGERIAN_CITIES].map((c) => (
            <button
              key={c || 'all'}
              type="button"
              onClick={() => setCity(c)}
              className={cn(
                'shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition',
                city === c
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              {c || 'All Nigeria'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <MoverSkeleton key={i} />)}
        </div>
      ) : movers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Truck className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">No movers found</p>
          <p className="text-sm text-muted-foreground">
            {city ? `No verified movers in ${city} yet.` : 'Check back soon — movers are joining.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {movers.map((mover) => (
            <MoverCard key={mover.id} mover={mover} onBook={setSelectedMover} />
          ))}
        </div>
      )}

      {/* Trust note */}
      <div className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">How we verify movers</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified movers have valid CAC registration, insurance coverage, and at least 5 confirmed
              customer reviews. Always look for the green verified badge before booking.
            </p>
          </div>
        </div>
      </div>

      {selectedMover && <BookingModal mover={selectedMover} onClose={() => setSelectedMover(null)} />}
    </div>
  );
}
