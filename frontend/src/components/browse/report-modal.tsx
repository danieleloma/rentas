'use client';

import { useState } from 'react';
import { X, Flag, Loader2, CheckCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-500" />
            <p className="text-[13px] font-semibold text-stone-900">Report Listing</p>
          </div>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
            <p className="font-semibold text-stone-900">Report submitted</p>
            <p className="text-[13px] text-stone-500">
              Thank you. Our moderation team will review this listing within 24 hours.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-lg bg-stone-900 px-6 py-3 text-[13px] font-semibold text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-[12px] text-stone-500">
              Reporting: <span className="font-medium text-stone-700">{listingTitle}</span>
            </p>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
                Reason
              </p>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <label key={cat.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 p-3 hover:border-stone-400 transition">
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={() => setCategory(cat.value)}
                      className="accent-emerald-700"
                    />
                    <span className="text-[13px] text-stone-700">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
                Additional details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed…"
                rows={3}
                className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-[13px] text-stone-900 placeholder-stone-400 focus:border-stone-500 focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3.5 text-[13px] font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
              Submit Report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
