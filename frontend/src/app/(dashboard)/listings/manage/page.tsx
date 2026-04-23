'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Plus,
  Eye,
  Pencil,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import { getMyListingsApi, updateListingStatusApi, deleteListingApi } from '@/lib/api/listings';
import { useUIStore } from '@/store/uiStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Listing } from '@/types';

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'active'
      ? 'default'
      : status === 'paused'
        ? 'secondary'
        : 'outline';
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}

// ── Delete confirm dialog ─────────────────────────────────────────────────────

function DeleteDialog({
  listing,
  onConfirm,
  onClose,
  isPending,
}: {
  listing: Listing;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-5 shadow-lg">
        <h2 className="font-semibold text-foreground">Delete listing?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">&quot;{listing.title}&quot;</span> will be removed
          from browse results. Inquiries and visit history are preserved for 90 days. This cannot
          be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Deleting…' : 'Delete listing'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function ListingRow({
  listing,
  onStatusChange,
  onDelete,
}: {
  listing: Listing;
  onStatusChange: (id: string, status: 'active' | 'paused') => void;
  onDelete: (listing: Listing) => void;
}) {
  const cover = listing.images?.[0]?.url;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-sm sm:gap-4 sm:p-4">
      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-[72px] sm:w-[72px]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{listing.title}</p>
          <StatusBadge status={listing.status} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {listing.address}, {listing.city}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          <span className="text-sm font-semibold text-foreground">
            ₦{listing.monthlyRent.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {listing.bedrooms} bed · {listing.bathrooms ?? '—'} bath
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {listing.viewsCount} views
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        <Link
          href={`/listings/${listing.id}`}
          title="View listing"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <Link
          href={`/listings/${listing.id}/edit`}
          title="Edit listing"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        {listing.status === 'active' ? (
          <button
            title="Pause listing"
            onClick={() => onStatusChange(listing.id, 'paused')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pause className="h-4 w-4" />
          </button>
        ) : listing.status === 'paused' ? (
          <button
            title="Activate listing"
            onClick={() => onStatusChange(listing.id, 'active')}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Play className="h-4 w-4" />
          </button>
        ) : null}
        <button
          title="Delete listing"
          onClick={() => onDelete(listing)}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ManageListingsPage() {
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const addToast = useUIStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: getMyListingsApi,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' }) =>
      updateListingStatusApi(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      addToast(
        updated.status === 'active' ? 'Listing activated' : 'Listing paused',
        'success',
      );
    },
    onError: () => addToast('Failed to update listing status', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteListingApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      addToast('Listing deleted', 'success');
      setDeletingListing(null);
    },
    onError: () => addToast('Failed to delete listing', 'error'),
  });

  const active = listings.filter((l) => l.status === 'active').length;
  const paused = listings.filter((l) => l.status === 'paused').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
          {!isLoading && listings.length > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {active} active · {paused} paused
            </p>
          )}
        </div>
        <Link href="/listings/new">
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New listing
          </Button>
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && listings.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first listing to start receiving inquiries from renters.
            </p>
          </div>
          <Link href="/listings/new">
            <Button>Create first listing</Button>
          </Link>
        </div>
      )}

      {/* Listing rows */}
      {!isLoading && listings.length > 0 && (
        <div className="space-y-3">
          {listings.map((listing) => (
            <ListingRow
              key={listing.id}
              listing={listing}
              onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
              onDelete={setDeletingListing}
            />
          ))}
        </div>
      )}

      {/* Delete confirm dialog */}
      {deletingListing && (
        <DeleteDialog
          listing={deletingListing}
          onConfirm={() => deleteMutation.mutate(deletingListing.id)}
          onClose={() => setDeletingListing(null)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
