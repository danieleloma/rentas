'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, X } from 'lucide-react';
import { useCreateListing } from '@/hooks/useListings';
import { ListingForm } from '@/components/listings/listing-form';
import { Button } from '@/components/ui/button';
import type { CreateListingFormData } from '@/lib/utils/validators';

const DRAFT_KEY = 'rentas:listing-draft';

export default function NewListingPage() {
  const router = useRouter();
  const createListing = useCreateListing();

  const [draftBanner, setDraftBanner] = useState(false);
  const [draft, setDraft] = useState<Partial<CreateListingFormData> | undefined>(undefined);
  const [useDraft, setUseDraft] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.title) {
          setDraft(parsed);
          setDraftBanner(true);
        }
      }
    } catch { /* ignore */ }
  }, []);

  function discardDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setDraft(undefined);
    setDraftBanner(false);
    setUseDraft(false);
  }

  function resumeDraft() {
    setUseDraft(true);
    setDraftBanner(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/listings/manage"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my listings
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Create New Listing</h1>

      {/* Draft resume banner */}
      {draftBanner && draft && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">You have an unsaved draft</p>
            <p className="truncate text-xs text-muted-foreground">&quot;{draft.title}&quot;</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" onClick={resumeDraft}>Resume</Button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Discard draft"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <ListingForm
          key={useDraft ? 'draft' : 'fresh'}
          initialDraft={useDraft ? draft : undefined}
          onSubmit={(data, images) => {
            createListing.mutate(
              { listingData: data as Record<string, unknown>, images },
              { onSuccess: () => router.push('/listings/manage') },
            );
          }}
          isLoading={createListing.isPending}
        />
      </div>
    </div>
  );
}
