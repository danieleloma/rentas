'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Mail, Phone, MessageSquare, Clock, Archive, ArchiveRestore, Layers } from 'lucide-react';
import { getInquiriesApi } from '@/lib/api/inquiries';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/format';

type FilterTab = 'all' | 'unresponded' | 'archived';

function hoursAgo(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 1000 / 60 / 60;
}

function UrgencyDot({ hours }: { hours: number }) {
  const color =
    hours < 4 ? 'bg-green-500' : hours < 24 ? 'bg-amber-400' : 'bg-red-500';
  const label =
    hours < 4 ? 'Recent — reply soon' : hours < 24 ? 'Awaiting reply > 4h' : 'Overdue — > 24h';
  return (
    <span title={label} className={`inline-block h-2.5 w-2.5 rounded-full ${color} shrink-0 mt-1`} />
  );
}

function ResponseTimeBadge({ avgHours }: { avgHours: number | null }) {
  if (avgHours === null) return null;
  const color =
    avgHours <= 4
      ? 'text-green-600 bg-green-50 border-green-200'
      : avgHours <= 12
        ? 'text-amber-600 bg-amber-50 border-amber-200'
        : 'text-red-600 bg-red-50 border-red-200';
  const label =
    avgHours < 1
      ? `${Math.round(avgHours * 60)}m avg response`
      : `${avgHours.toFixed(1)}h avg response`;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${color}`}>
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
}

// ── Archive store (localStorage) ──────────────────────────────────────────────

function useArchivedIds() {
  const key = 'rentas:archived-inquiries';

  const getIds = useCallback((): Set<string> => {
    try {
      const raw = localStorage.getItem(key);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }, [key]);

  const [archivedIds, setArchivedIds] = useState<Set<string>>(getIds);

  const archive = useCallback(
    (id: string) => {
      setArchivedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        localStorage.setItem(key, JSON.stringify(Array.from(next)));
        return next;
      });
    },
    [key],
  );

  const unarchive = useCallback(
    (id: string) => {
      setArchivedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        localStorage.setItem(key, JSON.stringify(Array.from(next)));
        return next;
      });
    },
    [key],
  );

  return { archivedIds, archive, unarchive };
}

// ── Group by listing ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function groupByListing(inquiries: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = new Map<string, { title: string; items: any[] }>();
  for (const inq of inquiries) {
    const key = inq.listing?.id ?? 'unknown';
    const title = inq.listing?.title ?? 'Unknown listing';
    if (!map.has(key)) map.set(key, { title, items: [] });
    map.get(key)!.items.push(inq);
  }
  return Array.from(map.values());
}

// ── Inquiry card ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function InquiryCard({ inquiry, onArchive, onUnarchive, isArchived }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inquiry: any;
  onArchive: () => void;
  onUnarchive: () => void;
  isArchived: boolean;
}) {
  const hours = hoursAgo(inquiry.createdAt);

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <UrgencyDot hours={hours} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">{inquiry.name}</p>
              {inquiry.listing?.title && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Re: {inquiry.listing.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-xs text-muted-foreground">
                {hours < 1
                  ? `${Math.round(hours * 60)}m ago`
                  : hours < 24
                    ? `${Math.round(hours)}h ago`
                    : formatDate(inquiry.createdAt)}
              </p>
              <button
                onClick={isArchived ? onUnarchive : onArchive}
                title={isArchived ? 'Unarchive' : 'Archive'}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {isArchived ? (
                  <ArchiveRestore className="h-3.5 w-3.5" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {inquiry.message}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${inquiry.email}?subject=Re: ${inquiry.listing?.title ?? 'Your inquiry'}`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" />
              {inquiry.email}
            </a>
            {inquiry.phone && (
              <>
                <a
                  href={`tel:${inquiry.phone}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {inquiry.phone}
                </a>
                <a
                  href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </>
            )}
            <Link
              href="/messages"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Open in Messages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InquiriesPage() {
  const [tab, setTab] = useState<FilterTab>('all');
  const [groupByListingMode, setGroupByListingMode] = useState(false);
  const { archivedIds, archive, unarchive } = useArchivedIds();

  const { data: all = [], isLoading } = useQuery({
    queryKey: ['inquiries'],
    queryFn: getInquiriesApi,
  });

  const avgResponseHours: number | null = null;

  const unrespondedCount = all.filter((i) => !archivedIds.has(i.id)).length;
  const archivedCount = all.filter((i) => archivedIds.has(i.id)).length;

  const filtered = all.filter((inq) => {
    if (tab === 'archived') return archivedIds.has(inq.id);
    if (tab === 'unresponded') return !archivedIds.has(inq.id);
    return true;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: all.length },
    { key: 'unresponded', label: 'Unresponded', count: unrespondedCount },
    { key: 'archived', label: 'Archived', count: archivedCount },
  ];

  const groups = groupByListingMode ? groupByListing(filtered) : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inquiries</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Renters who have contacted you about your listings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ResponseTimeBadge avgHours={avgResponseHours} />
          <Button
            variant={groupByListingMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGroupByListingMode((v) => !v)}
            className="gap-1.5"
          >
            <Layers className="h-3.5 w-3.5" />
            Group by listing
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-b-2 border-foreground text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {t.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> &lt; 4h</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> 4–24h</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> &gt; 24h</span>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-muted-foreground">
            {tab === 'all'
              ? 'No inquiries yet.'
              : tab === 'archived'
                ? 'No archived inquiries.'
                : 'All inquiries have been archived.'}
          </p>
        </div>
      )}

      {/* Grouped view */}
      {!isLoading && filtered.length > 0 && groups && (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                {group.title}
                <Badge variant="secondary" className="text-xs">{group.items.length}</Badge>
              </h2>
              <div className="space-y-3">
                {group.items.map((inq) => (
                  <InquiryCard
                    key={inq.id}
                    inquiry={inq}
                    isArchived={archivedIds.has(inq.id)}
                    onArchive={() => archive(inq.id)}
                    onUnarchive={() => unarchive(inq.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flat view */}
      {!isLoading && filtered.length > 0 && !groups && (
        <div className="space-y-3">
          {filtered.map((inquiry) => (
            <InquiryCard
              key={inquiry.id}
              inquiry={inquiry}
              isArchived={archivedIds.has(inquiry.id)}
              onArchive={() => archive(inquiry.id)}
              onUnarchive={() => unarchive(inquiry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
