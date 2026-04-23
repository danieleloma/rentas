'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, MessageSquare, Clock } from 'lucide-react';
import type { UserRole, Visit } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils/format';

export interface VisitCardProps {
  visit: Visit;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason?: string) => void;
  onCancel?: (id: string) => void;
  onComplete?: (id: string) => void;
  onReschedule?: (id: string, newDate: string) => void;
  userRole: UserRole;
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = status.toLowerCase();
  if (s === 'pending') return 'secondary';
  if (s === 'approved') return 'default';
  if (s === 'rejected') return 'destructive';
  if (s === 'completed') return 'outline';
  return 'secondary';
}

function isPast(scheduledAt: string) {
  return new Date(scheduledAt).getTime() < Date.now();
}

export function VisitCard({ visit, onApprove, onReject, onCancel, onComplete, onReschedule, userRole }: VisitCardProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestDate, setSuggestDate] = useState('');
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const status = visit.status.toLowerCase();
  const isLandlord = userRole === 'landlord' || userRole === 'admin';
  const isRenter = userRole === 'renter';

  const showApprove = isLandlord && status === 'pending';
  const showReject = isLandlord && status === 'pending';
  const showSuggestAlt = isLandlord && status === 'pending';
  const showComplete = isLandlord && status === 'approved' && isPast(visit.scheduledAt);
  const showCancel = isRenter && (status === 'pending' || status === 'approved');
  const showReschedule = isRenter && status === 'pending';
  const showRenterPhone = isLandlord && status === 'approved' && visit.renter?.phone;

  function handleRejectConfirm() {
    onReject?.(visit.id, rejectReason || undefined);
    setRejectOpen(false);
    setRejectReason('');
  }

  function handleSuggestSubmit() {
    if (!suggestDate) return;
    // Send the suggestion as a system message — for now we trigger a reschedule mutation
    onReschedule?.(visit.id, suggestDate);
    setSuggestOpen(false);
    setSuggestDate('');
  }

  function handleRescheduleSubmit() {
    if (!rescheduleDate) return;
    onReschedule?.(visit.id, rescheduleDate);
    setRescheduleOpen(false);
    setRescheduleDate('');
  }

  const dateInputMin = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 pt-5">
        {/* Title + badges */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{visit.listing.title}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {visit.viewingType.replace(/-/g, ' ')}
            </Badge>
            <Badge variant={statusVariant(status)} className="capitalize">
              {status}
            </Badge>
          </div>
        </div>

        {/* Address */}
        <p className="text-sm text-muted-foreground">
          {visit.listing.address}, {visit.listing.city}
        </p>

        {/* Date/time */}
        <p className="text-sm font-medium text-foreground">
          <Clock className="mr-1.5 inline h-3.5 w-3.5 text-muted-foreground" />
          {formatDateTime(visit.scheduledAt)}
          {visit.endAt ? ` – ${formatDateTime(visit.endAt)}` : null}
        </p>

        {/* Renter info — shown to landlord */}
        {isLandlord && visit.renter && (
          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">Requested by </span>
              <span className="font-medium text-foreground">
                {visit.renter.firstName} {visit.renter.lastName}
              </span>
            </div>
            {/* Phone shown only after approval */}
            {showRenterPhone && (
              <a
                href={`tel:${visit.renter.phone}`}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Phone className="h-3 w-3" />
                {visit.renter.phone}
              </a>
            )}
          </div>
        )}

        {/* Landlord info — shown to renter */}
        {isRenter && visit.landlord && (
          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Landlord: </span>
            <span className="font-medium text-foreground">
              {visit.landlord.firstName} {visit.landlord.lastName}
            </span>
          </div>
        )}

        {/* Note */}
        {visit.note && (
          <p className="text-sm text-muted-foreground italic">&quot;{visit.note}&quot;</p>
        )}
      </CardContent>

      {/* Actions footer */}
      {(showApprove || showComplete || showCancel || showSuggestAlt || showReschedule || isRenter) && (
        <CardFooter className="flex flex-col gap-2 border-t border-border bg-muted/30 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            {showApprove && (
              <Button type="button" size="sm" onClick={() => onApprove?.(visit.id)}>
                Approve
              </Button>
            )}
            {showReject && !rejectOpen && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
            )}
            {showSuggestAlt && !suggestOpen && !rejectOpen && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSuggestOpen(true)}
              >
                Suggest different time
              </Button>
            )}
            {showComplete && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onComplete?.(visit.id)}
              >
                Mark Completed
              </Button>
            )}
            {showCancel && (
              <Button type="button" variant="outline" size="sm" onClick={() => onCancel?.(visit.id)}>
                Cancel
              </Button>
            )}
            {showReschedule && !rescheduleOpen && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRescheduleOpen(true)}
              >
                Reschedule
              </Button>
            )}
            {/* Message landlord — renter can always message */}
            {isRenter && (
              <Link href="/messages">
                <Button type="button" variant="ghost" size="sm" className="gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Message {visit.landlord?.firstName ?? 'landlord'}
                </Button>
              </Link>
            )}
          </div>

          {/* Reject with reason */}
          {rejectOpen && (
            <div className="w-full space-y-2 pt-1">
              <textarea
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                rows={2}
                maxLength={200}
                placeholder="Reason for rejection (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRejectConfirm}
                >
                  Confirm rejection
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setRejectOpen(false); setRejectReason(''); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Suggest alternative time (landlord) */}
          {suggestOpen && (
            <div className="w-full space-y-2 pt-1">
              <p className="text-xs font-medium text-foreground">Suggest a different time:</p>
              <input
                type="datetime-local"
                min={dateInputMin}
                value={suggestDate}
                onChange={(e) => setSuggestDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={!suggestDate}
                  onClick={handleSuggestSubmit}
                >
                  Send suggestion
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSuggestOpen(false); setSuggestDate(''); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Reschedule (renter) */}
          {rescheduleOpen && (
            <div className="w-full space-y-2 pt-1">
              <p className="text-xs font-medium text-foreground">Choose a new date and time:</p>
              <input
                type="datetime-local"
                min={dateInputMin}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={!rescheduleDate}
                  onClick={handleRescheduleSubmit}
                >
                  Reschedule
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setRescheduleOpen(false); setRescheduleDate(''); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
