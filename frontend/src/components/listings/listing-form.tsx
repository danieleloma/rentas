'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, X } from 'lucide-react';
import { createListingSchema, type CreateListingFormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AMENITY_OPTIONS = [
  { value: 'parking', label: 'Parking' },
  { value: 'pool', label: 'Pool' },
  { value: 'gym', label: 'Gym' },
  { value: 'laundry', label: 'In-unit Laundry' },
  { value: 'pet-friendly', label: 'Pet Friendly' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'air-conditioning', label: 'Air Conditioning' },
  { value: 'dishwasher', label: 'Dishwasher' },
  { value: 'balcony', label: 'Balcony/Patio' },
  { value: 'elevator', label: 'Elevator' },
  { value: 'storage', label: 'Storage' },
  { value: 'wheelchair-accessible', label: 'Wheelchair Accessible' },
  { value: 'ev-charging', label: 'EV Charging' },
  { value: 'doorman', label: 'Doorman' },
];

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface ListingFormProps {
  onSubmit: (data: CreateListingFormData, images: File[]) => void;
  isLoading?: boolean;
}

export function ListingForm({ onSubmit, isLoading }: ListingFormProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
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
    },
  });

  const titleValue = watch('title') ?? '';
  const descriptionValue = watch('description') ?? '';

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
        errs.push(`"${file.name}" is not a supported format (JPEG, PNG, WebP, GIF)`);
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
    // Normalize empty virtualTourUrl to undefined
    if (data.virtualTourUrl === '') data.virtualTourUrl = undefined;
    onSubmit(data, images);
  }

  const fieldClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20';

  const sectionHeading = 'text-sm font-semibold uppercase tracking-wide text-gray-500';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* ── Basic Information ─────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className={sectionHeading}>Basic Information</h2>

        {/* Title */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-400">{titleValue.length}/100</span>
          </div>
          <input
            type="text"
            placeholder="Cozy 2BR apartment near downtown"
            className={fieldClass}
            {...register('title')}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <span className="text-xs text-gray-400">{(descriptionValue ?? '').length}/5000</span>
          </div>
          <textarea
            placeholder="Describe your property — highlights, nearby attractions, what makes it special…"
            rows={5}
            className={fieldClass}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Property type + Available from */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select className={fieldClass} {...register('propertyType')}>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>
            {errors.propertyType && (
              <p className="mt-1 text-sm text-red-600">{errors.propertyType.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Available From
            </label>
            <input type="date" className={fieldClass} {...register('availableFrom')} />
          </div>
        </div>
      </section>

      {/* ── Location ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className={sectionHeading}>Location</h2>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Street Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="123 Main Street"
            className={fieldClass}
            {...register('address')}
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="New York"
              className={fieldClass}
              {...register('city')}
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
          </div>
          <Input label="State" placeholder="NY" {...register('state')} />
          <Input label="ZIP Code" placeholder="10001" {...register('zipCode')} />
        </div>
      </section>

      {/* ── Property Details ──────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className={sectionHeading}>Property Details</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Bedrooms *"
            type="number"
            min={0}
            error={errors.bedrooms?.message}
            {...register('bedrooms')}
          />
          <Input label="Bathrooms" type="number" min={0} step={0.5} {...register('bathrooms')} />
          <Input
            label="Square Footage"
            type="number"
            min={1}
            placeholder="850"
            {...register('squareFootage')}
          />
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className={sectionHeading}>Pricing</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Monthly Rent ($) *"
            type="number"
            min={1}
            placeholder="2000"
            error={errors.monthlyRent?.message}
            {...register('monthlyRent')}
          />
          <Input
            label="Security Deposit ($)"
            type="number"
            min={0}
            placeholder="2000"
            {...register('deposit')}
          />
        </div>
      </section>

      {/* ── Lease Terms ───────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className={sectionHeading}>Lease Terms</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Lease Duration
            </label>
            <select className={fieldClass} {...register('leaseDuration')}>
              <option value="">Not specified</option>
              <option value="month-to-month">Month-to-month</option>
              <option value="6-months">6 months</option>
              <option value="12-months">12 months</option>
              <option value="24-months">24 months</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Pet Policy</label>
            <select className={fieldClass} {...register('petPolicy')}>
              <option value="">Not specified</option>
              <option value="allowed">Pets allowed</option>
              <option value="not_allowed">No pets</option>
              <option value="case_by_case">Case by case</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Smoking Policy
            </label>
            <select className={fieldClass} {...register('smokingPolicy')}>
              <option value="">Not specified</option>
              <option value="not_allowed">No smoking</option>
              <option value="allowed">Smoking allowed</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Amenities ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className={sectionHeading}>Amenities</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {AMENITY_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-gray-400 has-[:checked]:border-gray-900 has-[:checked]:bg-gray-50"
            >
              <input
                type="checkbox"
                value={value}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                {...register('amenities')}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* ── Photos ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className={sectionHeading}>Photos</h2>
          <span className="text-xs text-gray-400">
            {images.length}/{MAX_IMAGES} photos · max 10 MB each
          </span>
        </div>

        {/* Upload trigger */}
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
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus className="h-5 w-5" />
          {images.length === 0 ? 'Click to add photos' : 'Add more photos'}
        </button>

        {imageError && <p className="text-sm text-red-600">{imageError}</p>}

        {/* Preview grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {previews.map((src, i) => (
              <div key={src} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Virtual Tour ──────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className={sectionHeading}>Virtual Tour</h2>
        <Input
          label="Virtual Tour URL"
          type="url"
          placeholder="https://my.matterport.com/show/?m=..."
          error={errors.virtualTourUrl?.message}
          {...register('virtualTourUrl')}
        />
        <p className="text-xs text-gray-500">
          Paste a link to your Matterport, YouTube walkthrough, or any 360° tour.
        </p>
      </section>

      {/* ── Submit ────────────────────────────────────────────── */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating listing…' : 'Create Listing'}
      </Button>
    </form>
  );
}
