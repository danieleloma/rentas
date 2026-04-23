'use client';

import { useRef, useState, useId, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { createListingSchema, type CreateListingFormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function formatTimeSince(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  return `${mins} min ago`;
}

const AMENITY_OPTIONS = [
  // Nigeria-specific
  { value: 'generator', label: 'Generator (steady power)' },
  { value: 'borehole', label: 'Borehole / Running water' },
  { value: 'prepaid-meter', label: 'Prepaid meter' },
  { value: 'security-guard', label: 'Security guard / Estate gating' },
  { value: 'bq', label: "BQ (Boys' Quarters)" },
  { value: 'pop-ceiling', label: 'POP ceiling' },
  { value: 'tiled-floors', label: 'Tiled floors' },
  // General
  { value: 'parking', label: 'Parking' },
  { value: 'pool', label: 'Pool' },
  { value: 'gym', label: 'Gym' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'air-conditioning', label: 'Air conditioning' },
  { value: 'laundry', label: 'In-unit laundry' },
  { value: 'balcony', label: 'Balcony / Patio' },
  { value: 'elevator', label: 'Elevator' },
  { value: 'pet-friendly', label: 'Pet friendly' },
  { value: 'storage', label: 'Storage' },
];

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const STEPS = ['Basics', 'Location', 'Photos', 'Details'] as const;
type Step = 0 | 1 | 2 | 3;

const DRAFT_KEY = 'rentas:listing-draft';

interface ListingFormProps {
  onSubmit: (data: CreateListingFormData, images: File[]) => void;
  isLoading?: boolean;
  initialDraft?: Partial<CreateListingFormData>;
}

export function ListingForm({ onSubmit, isLoading, initialDraft }: ListingFormProps) {
  const [step, setStep] = useState<Step>(0);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState('');
  const [rentType, setRentType] = useState<'monthly' | 'yearly'>('monthly');
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rentTypeId = useId();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CreateListingFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createListingSchema) as any,
    defaultValues: {
      propertyType: 'apartment',
      bedrooms: 1,
      amenities: [],
      title: '',
      address: '',
      city: '',
      ...initialDraft,
    },
  });

  // ── Draft auto-save (every 30s) ──────────────────────────────────────────
  const saveDraft = useCallback(() => {
    try {
      const values = getValues();
      if (!values.title) return; // don't save empty drafts
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      setDraftSavedAt(new Date());
    } catch {
      // localStorage may be unavailable
    }
  }, [getValues]);

  useEffect(() => {
    const id = setInterval(saveDraft, 30_000);
    return () => clearInterval(id);
  }, [saveDraft]);

  const titleValue = watch('title') ?? '';
  const descriptionValue = watch('description') ?? '';

  // Step validation fields
  const stepFields: Record<Step, (keyof CreateListingFormData)[]> = {
    0: ['title', 'propertyType', 'bedrooms', 'monthlyRent'],
    1: ['address', 'city'],
    2: [],
    3: [],
  };

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => (s + 1) as Step);
  }

  function goBack() {
    setStep((s) => (s - 1) as Step);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setImageError('');
    const remaining = MAX_IMAGES - images.length;
    const toAdd: File[] = [];
    const errs: string[] = [];

    for (const file of files) {
      if (toAdd.length >= remaining) {
        errs.push(`Only ${remaining} more photo(s) allowed (max ${MAX_IMAGES})`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        errs.push(`"${file.name}" exceeds the 10 MB limit`);
        continue;
      }
      if (!/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type)) {
        errs.push(`"${file.name}" is not a supported format`);
        continue;
      }
      toAdd.push(file);
    }

    if (errs.length) setImageError(errs.join(' · '));
    if (!toAdd.length) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFormSubmit(data: CreateListingFormData) {
    if (data.virtualTourUrl === '') data.virtualTourUrl = undefined;
    if (rentType === 'yearly') {
      data.monthlyRent = Math.round(data.monthlyRent / 12);
    }
    // Clear draft on publish
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    onSubmit(data, images);
  }

  const fieldClass =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20';

  const sectionHeading = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length} — {STEPS[step]}</span>
          <div className="flex items-center gap-3">
            {draftSavedAt && (
              <button
                type="button"
                onClick={saveDraft}
                className="text-xs text-muted-foreground hover:text-foreground"
                title="Click to save now"
              >
                Draft saved {formatTimeSince(draftSavedAt)}
              </button>
            )}
            {!draftSavedAt && (
              <button
                type="button"
                onClick={saveDraft}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Save draft
              </button>
            )}
            <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
          </div>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex gap-1">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Step 0: Basics ────────────────────────────────────── */}
      {step === 0 && (
        <section className="space-y-4">
          <h2 className={sectionHeading}>Basic information</h2>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label className="text-sm font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <span className="text-xs text-muted-foreground">{titleValue.length}/100</span>
            </div>
            <input
              type="text"
              placeholder="Spacious 3-bedroom flat in Lekki Phase 1"
              className={fieldClass}
              {...register('title')}
            />
            {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Property type <span className="text-destructive">*</span>
              </label>
              <select className={fieldClass} {...register('propertyType')}>
                <option value="apartment">Apartment / Flat</option>
                <option value="house">Detached house</option>
                <option value="semi-detached">Semi-detached</option>
                <option value="terraced">Terraced</option>
                <option value="condo">Condo</option>
                <option value="studio">Studio</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Available from
              </label>
              <input type="date" className={fieldClass} {...register('availableFrom')} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Bedrooms *"
              type="number"
              min={0}
              error={errors.bedrooms?.message}
              {...register('bedrooms')}
            />
            <Input label="Bathrooms" type="number" min={0} step={0.5} {...register('bathrooms')} />
            <Input label="Size (sq ft)" type="number" min={1} placeholder="1200" {...register('squareFootage')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor={rentTypeId} className="text-sm font-medium text-foreground">
                  Rent (₦) <span className="text-destructive">*</span>
                </label>
                {/* Rent type toggle */}
                <div className="flex rounded-md border border-border text-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setRentType('monthly')}
                    className={`px-2.5 py-1 transition-colors ${
                      rentType === 'monthly'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    /mo
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentType('yearly')}
                    className={`px-2.5 py-1 transition-colors border-l border-border ${
                      rentType === 'yearly'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    /yr
                  </button>
                </div>
              </div>
              <input
                id={rentTypeId}
                type="number"
                min={1}
                placeholder={rentType === 'yearly' ? '5400000' : '450000'}
                className={fieldClass}
                {...register('monthlyRent')}
              />
              {rentType === 'yearly' && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Yearly amount — stored as ₦{' '}
                  {watch('monthlyRent')
                    ? Math.round(Number(watch('monthlyRent')) / 12).toLocaleString()
                    : '—'}
                  /mo
                </p>
              )}
              {errors.monthlyRent && (
                <p className="mt-1 text-sm text-destructive">{errors.monthlyRent.message}</p>
              )}
            </div>
            <Input label="Security deposit (₦)" type="number" min={0} placeholder="900000" {...register('deposit')} />
          </div>
        </section>
      )}

      {/* ── Step 1: Location ──────────────────────────────────── */}
      {step === 1 && (
        <section className="space-y-4">
          <h2 className={sectionHeading}>Location</h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Street address <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="12 Admiralty Way"
              className={fieldClass}
              {...register('address')}
            />
            {errors.address && <p className="mt-1 text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                City / LGA <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Lagos"
                className={fieldClass}
                {...register('city')}
              />
              {errors.city && <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <Input label="State" placeholder="Lagos State" {...register('state')} />
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Be specific — include the estate or neighbourhood name (e.g. &quot;Lekki Phase 1, Lagos&quot;).
          </p>
        </section>
      )}

      {/* ── Step 2: Photos ────────────────────────────────────── */}
      {step === 2 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className={sectionHeading}>Photos</h2>
            <span className="text-xs text-muted-foreground">
              {images.length}/{MAX_IMAGES} · max 10 MB each
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus className="h-5 w-5" />
            {images.length === 0 ? 'Click to add photos' : 'Add more photos'}
          </button>

          {imageError && <p className="text-sm text-destructive">{imageError}</p>}

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {previews.map((src, i) => (
                <div
                  key={src}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <p className="text-xs text-muted-foreground">
              At least 1 photo required. Upload the best photo first — it becomes the cover image.
            </p>
          )}
        </section>
      )}

      {/* ── Step 3: Details & Terms ───────────────────────────── */}
      {step === 3 && (
        <section className="space-y-6">
          <div>
            <h2 className={sectionHeading}>Description</h2>
            <div className="mt-3">
              <div className="mb-1.5 flex items-baseline justify-between">
                <label className="text-sm font-medium text-foreground">Property description</label>
                <span className="text-xs text-muted-foreground">
                  {(descriptionValue ?? '').length}/5000
                </span>
              </div>
              <textarea
                placeholder="Describe the property — highlights, nearby landmarks (market, church, school), transport access, what makes it special…"
                rows={5}
                className={fieldClass}
                {...register('description')}
              />
            </div>
          </div>

          <div>
            <h2 className={sectionHeading}>Amenities</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AMENITY_OPTIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:border-foreground/40 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="checkbox"
                    value={value}
                    className="rounded border-border text-primary focus:ring-primary"
                    {...register('amenities')}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className={sectionHeading}>Lease terms</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Lease duration
                </label>
                <select className={fieldClass} {...register('leaseDuration')}>
                  <option value="">Not specified</option>
                  <option value="month-to-month">Month-to-month</option>
                  <option value="6-months">6 months</option>
                  <option value="12-months">12 months (standard)</option>
                  <option value="24-months">24 months</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Pet policy
                </label>
                <select className={fieldClass} {...register('petPolicy')}>
                  <option value="">Not specified</option>
                  <option value="allowed">Pets allowed</option>
                  <option value="not_allowed">No pets</option>
                  <option value="case_by_case">Case by case</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Smoking policy
                </label>
                <select className={fieldClass} {...register('smokingPolicy')}>
                  <option value="">Not specified</option>
                  <option value="not_allowed">No smoking</option>
                  <option value="allowed">Smoking allowed</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className={sectionHeading}>Virtual tour</h2>
            <div className="mt-3">
              <Input
                label="Tour URL"
                type="url"
                placeholder="https://my.matterport.com/show/?m=…"
                error={errors.virtualTourUrl?.message}
                {...register('virtualTourUrl')}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Paste a Matterport, YouTube walkthrough, or any 360° tour link.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {step < 3 ? (
          <Button type="button" onClick={goNext} className="gap-1">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating listing…' : 'Publish listing'}
          </Button>
        )}
      </div>
    </form>
  );
}
