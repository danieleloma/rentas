'use client';

import { useState } from 'react';
import { Flag, Loader2, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { createReportApi } from '@/lib/api/reviews';

const CATEGORIES = [
  { value: 'fake_listing', label: 'Fake / fraudulent listing' },
  { value: 'wrong_price', label: 'Wrong price advertised' },
  { value: 'already_rented', label: 'Property already rented out' },
  { value: 'scam', label: 'Suspected scam' },
  { value: 'duplicate', label: 'Duplicate listing' },
  { value: 'other', label: 'Other issue' },
];

interface Props {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}

export function ReportModal({ listingId, listingTitle, onClose }: Props) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      setError('Please select a reason.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createReportApi(listingId, category, description || undefined);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Report Listing">
      {done ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-600" />
          <p className="font-semibold text-foreground">Report submitted</p>
          <p className="text-sm text-muted-foreground">
            Thank you. Our moderation team will review this listing within 24 hours.
          </p>
          <Button onClick={onClose} className="mt-2">Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Reporting: <span className="font-medium text-foreground">{listingTitle}</span>
          </p>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Reason
            </p>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition hover:border-foreground/30 hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={category === cat.value}
                    onChange={() => setCategory(cat.value)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Additional details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed…"
              rows={3}
              className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            variant="destructive"
            className="w-full gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
            Submit Report
          </Button>
        </form>
      )}
    </Modal>
  );
}
