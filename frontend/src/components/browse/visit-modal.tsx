'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { useCreateVisit } from '@/hooks/useVisits';
import { useAuthStore } from '@/store/authStore';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'] });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

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

  // Redirect unauthenticated visitors to login
  if (!user) {
    router.push('/login');
    return null;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        aria-label="Close"
      />

      {/* Panel */}
      <div className={`${sans.className} relative w-full max-w-md bg-[#f7f6f4] px-6 py-8 sm:px-8`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-stone-400 transition hover:text-stone-900"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">Schedule</p>
        <h2 className={`mt-2 text-2xl font-normal text-stone-900 ${display.className}`}>
          Book a visit
        </h2>
        <p className="mt-1 truncate text-[13px] text-stone-500">{listingTitle}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Date */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              Date
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-b border-stone-300 bg-transparent py-2 text-[14px] text-stone-900 transition focus:border-stone-800 focus:outline-none"
            />
          </div>

          {/* Time */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              Time
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border-b border-stone-300 bg-transparent py-2 text-[14px] text-stone-900 transition focus:border-stone-800 focus:outline-none"
            />
          </div>

          {/* Viewing type */}
          <div>
            <label className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              Visit type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['in_person', 'video_call'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setViewingType(type)}
                  className={`border py-3 text-[12px] font-semibold uppercase tracking-[0.2em] transition ${
                    viewingType === type
                      ? 'border-stone-900 bg-stone-900 text-[#f7f6f4]'
                      : 'border-stone-300 text-stone-600 hover:border-stone-600'
                  }`}
                >
                  {type === 'in_person' ? 'In person' : 'Video call'}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
              Note{' '}
              <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any questions for the landlord…"
              rows={3}
              className="w-full resize-none border-b border-stone-300 bg-transparent py-2 text-[14px] text-stone-900 placeholder-stone-300 transition focus:border-stone-800 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!date || createVisit.isPending}
            className="w-full bg-stone-900 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#f7f6f4] transition hover:bg-stone-800 disabled:opacity-40"
          >
            {createVisit.isPending ? 'Sending request…' : 'Request visit'}
          </button>
        </form>
      </div>
    </div>
  );
}
