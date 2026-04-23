'use client';

import type { UserRole, Visit } from '@/types';
import { VisitCard } from '@/components/visits/visit-card';
import { formatDate } from '@/lib/utils/format';

export interface VisitCalendarProps {
  visits: Visit[];
  userRole: UserRole;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason?: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onReschedule?: (id: string, newDate: string) => void;
}

function startOfLocalDayMs(iso: string) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function groupByDate(visits: Visit[]) {
  const map = new Map<number, Visit[]>();
  for (const v of visits) {
    const key = startOfLocalDayMs(v.scheduledAt);
    const list = map.get(key) ?? [];
    list.push(v);
    map.set(key, list);
  }
  for (const list of Array.from(map.values())) {
    list.sort(
      (a: Visit, b: Visit) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  }
  return map;
}

export function VisitCalendar({
  visits,
  userRole,
  onApprove,
  onReject,
  onCancel,
  onComplete,
  onReschedule,
}: VisitCalendarProps) {
  if (visits.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
        No scheduled visits. Request a viewing from a listing to see it here.
      </div>
    );
  }

  const grouped = groupByDate(visits);
  const sortedDayKeys = Array.from(grouped.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {sortedDayKeys.map((dayKey) => {
        const dayVisits = grouped.get(dayKey) ?? [];
        const heading = dayVisits[0]
          ? formatDate(dayVisits[0].scheduledAt)
          : '';
        return (
        <section key={dayKey}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {heading}
          </h2>
          <ul className="space-y-4">
            {dayVisits.map((visit) => (
              <li key={visit.id}>
                <VisitCard
                  visit={visit}
                  userRole={userRole}
                  onApprove={onApprove}
                  onReject={onReject}
                  onCancel={onCancel}
                  onComplete={onComplete}
                  onReschedule={onReschedule}
                />
              </li>
            ))}
          </ul>
        </section>
        );
      })}
    </div>
  );
}
