'use client';

import { useVisits, useUpdateVisitStatus, useCancelVisit } from '@/hooks/useVisits';
import { useAuthStore } from '@/store/authStore';
import { VisitCalendar } from '@/components/visits/visit-calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';

export default function VisitsPage() {
  const userRole = useAuthStore((s) => s.user?.role ?? 'renter');
  const { data, isLoading } = useVisits();
  const visits = data?.data ?? [];
  const updateStatus = useUpdateVisitStatus();
  const cancelVisit = useCancelVisit();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            My Visits
          </h1>
          <p className="text-sm text-muted-foreground">
            {userRole === 'landlord' ? 'Manage inspection requests' : 'Track your scheduled property visits'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
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
          <p className="font-semibold text-foreground">No visits yet</p>
          <p className="text-sm text-muted-foreground">
            {userRole === 'landlord'
              ? 'Inspection requests from tenants will appear here.'
              : 'Schedule a visit from any listing page to get started.'}
          </p>
        </div>
      ) : (
        <VisitCalendar
          visits={visits}
          userRole={userRole}
          onApprove={(id) => updateStatus.mutate({ id, status: 'approved' })}
          onReject={(id) => updateStatus.mutate({ id, status: 'rejected' })}
          onCancel={(id) => cancelVisit.mutate(id)}
        />
      )}
    </div>
  );
}
