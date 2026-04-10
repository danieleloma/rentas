'use client';

import type { UserRole, Visit } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils/format';

export interface VisitCardProps {
  visit: Visit;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  userRole: UserRole;
}

function statusVariant(status: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  const s = status.toLowerCase();
  if (s === 'pending') return 'warning';
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'error';
  if (s === 'completed') return 'info';
  return 'default';
}

export function VisitCard({ visit, onApprove, onReject, onCancel, userRole }: VisitCardProps) {
  const status = visit.status.toLowerCase();
  const isLandlord = userRole === 'landlord';
  const isRenter = userRole === 'renter';

  const showLandlordActions = isLandlord && status === 'pending';
  const showRenterCancel =
    isRenter && (status === 'pending' || status === 'approved');

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{visit.listing.title}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info" className="capitalize">
              {visit.viewingType.replace(/-/g, ' ')}
            </Badge>
            <Badge variant={statusVariant(visit.status)} className="capitalize">
              {visit.status}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {visit.listing.address}, {visit.listing.city}
        </p>
        <p className="text-sm font-medium text-gray-800">
          {formatDateTime(visit.scheduledAt)}
          {visit.endAt ? ` – ${formatDateTime(visit.endAt)}` : null}
        </p>
        {visit.note ? <p className="text-sm text-gray-600">{visit.note}</p> : null}
      </CardContent>
      {(showLandlordActions || showRenterCancel) && (
        <CardFooter className="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50/80">
          {showLandlordActions ? (
            <>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onApprove?.(visit.id)}
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => onReject?.(visit.id)}
              >
                Reject
              </Button>
            </>
          ) : null}
          {showRenterCancel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCancel?.(visit.id)}
            >
              Cancel
            </Button>
          ) : null}
        </CardFooter>
      )}
    </Card>
  );
}
