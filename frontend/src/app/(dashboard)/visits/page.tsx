'use client';

import { useState } from 'react';
import { useVisits, useUpdateVisitStatus, useCancelVisit } from '@/hooks/useVisits';
import { useAuthStore } from '@/store/authStore';
import { VisitCalendar } from '@/components/visits/visit-calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

type FilterStatus = 'all' | 'pending' | 'approved' | 'completed';

export default function VisitsPage() {
  const userRole = useAuthStore((s) => s.user?.role ?? 'renter');
  const isLandlord = userRole === 'landlord' || userRole === 'admin';
  const { data, isLoading } = useVisits();
  const allVisits = data?.data ?? [];
  const updateStatus = useUpdateVisitStatus();
  const cancelVisit = useCancelVisit();
  const [filter, setFilter] = useState<FilterStatus>('all');

  const counts: Record<FilterStatus, number> = {
    all: allVisits.length,
    pending: allVisits.filter((v) => v.status === 'pending').length,
    approved: allVisits.filter((v) => v.status === 'approved').length,
    completed: allVisits.filter((v) => v.status === 'completed').length,
  };

  const visits =
    filter === 'all'
      ? allVisits
      : allVisits.filter((v) => v.status === filter);

  const filterTabs: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            {isLandlord ? 'Inspection Requests' : 'My Visits'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLandlord
              ? 'Review and manage visit requests from renters'
              : 'Track your scheduled property visits'}
          </p>
        </div>
      </div>

      {/* Filter tabs — landlord only */}
      {isLandlord && (
        <div className="mb-5 flex gap-1 border-b border-border">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                filter === t.key
                  ? 'border-b-2 border-foreground text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              {counts[t.key] > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">
                  {counts[t.key]}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground">
            {filter === 'all' ? 'No visits yet' : `No ${filter} visits`}
          </p>
          <p className="text-sm text-muted-foreground">
            {isLandlord
              ? 'Inspection requests from tenants will appear here.'
              : 'Schedule a visit from any listing page to get started.'}
          </p>
        </div>
      ) : (
        <VisitCalendar
          visits={visits}
          userRole={userRole}
          onApprove={(id) => updateStatus.mutate({ id, status: 'approved' })}
          onReject={(id, reason) => updateStatus.mutate({ id, status: 'rejected', reason })}
          onCancel={(id) => cancelVisit.mutate(id)}
          onComplete={(id) => updateStatus.mutate({ id, status: 'completed' })}
          onReschedule={(id, newDate) =>
            updateStatus.mutate({ id, status: 'pending', reason: `Rescheduled to ${newDate}` })
          }
        />
      )}
    </div>
  );
}
