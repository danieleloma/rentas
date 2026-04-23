'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateVisit } from '@/hooks/useVisits';
import { useAuthStore } from '@/store/authStore';

interface VisitModalProps {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}

export function VisitModal({ listingId, listingTitle, onClose }: VisitModalProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createVisit = useCreateVisit();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [viewingType, setViewingType] = useState<'in_person' | 'video_call'>('in_person');
  const [note, setNote] = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    if (!user) { router.push('/login'); return; }
    createVisit.mutate(
      {
        listingId,
        scheduledAt: `${date}T${time}:00`,
        viewingType,
        note: note.trim() || undefined,
      },
      { onSuccess: () => { onClose(); router.push('/visits'); } },
    );
  }

  return (
    <Modal isOpen onClose={onClose} title="Book a visit">
      <p className="mb-5 truncate text-sm text-muted-foreground">{listingTitle}</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Date"
          type="date"
          required
          min={minDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Time"
          type="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        {/* Viewing type */}
        <div>
          <label className="mb-2 block text-sm font-medium leading-none">Visit type</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {(['in_person', 'video_call'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={viewingType === type ? 'default' : 'outline'}
                onClick={() => setViewingType(type)}
              >
                {type === 'in_person' ? 'In person' : 'Video call'}
              </Button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="mb-1.5 block text-sm font-medium leading-none">
            Note <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any questions for the landlord…"
            rows={3}
            className="mt-1.5 w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!date || createVisit.isPending}
        >
          {createVisit.isPending ? 'Sending request…' : user ? 'Request visit' : 'Sign in to request'}
        </Button>
      </form>
    </Modal>
  );
}
