'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createListingSchema, type CreateListingFormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AMENITY_OPTIONS = ['parking', 'pool', 'gym', 'laundry', 'pet-friendly', 'furnished'];

interface ListingFormProps {
  onSubmit: (data: CreateListingFormData) => void;
  isLoading?: boolean;
}

export function ListingForm({ onSubmit, isLoading }: ListingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      propertyType: 'apartment' as const,
      bedrooms: 1,
      monthlyRent: 0,
      amenities: [] as string[],
      title: '',
      address: '',
      city: '',
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as CreateListingFormData))} className="space-y-6">
      <Input
        label="Title"
        placeholder="Cozy 2BR apartment near downtown"
        error={errors.title?.message}
        {...register('title')}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          placeholder="Describe your property..."
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Property Type</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            {...register('propertyType')}
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
          </select>
        </div>
        <Input
          label="Monthly Rent ($)"
          type="number"
          placeholder="1500"
          error={errors.monthlyRent?.message}
          {...register('monthlyRent')}
        />
      </div>

      <Input
        label="Address"
        placeholder="123 Main St"
        error={errors.address?.message}
        {...register('address')}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="City"
          placeholder="New York"
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          label="State"
          placeholder="NY"
          {...register('state')}
        />
        <Input
          label="Zip Code"
          placeholder="10001"
          {...register('zipCode')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Bedrooms"
          type="number"
          error={errors.bedrooms?.message}
          {...register('bedrooms')}
        />
        <Input
          label="Bathrooms"
          type="number"
          step="0.5"
          {...register('bathrooms')}
        />
        <Input
          label="Square Footage"
          type="number"
          placeholder="800"
          {...register('squareFootage')}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Deposit ($)"
          type="number"
          placeholder="2000"
          {...register('deposit')}
        />
        <Input
          label="Available From"
          type="date"
          {...register('availableFrom')}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Amenities</label>
        <div className="flex flex-wrap gap-3">
          {AMENITY_OPTIONS.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                value={amenity}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                {...register('amenities')}
              />
              {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Create Listing
      </Button>
    </form>
  );
}
