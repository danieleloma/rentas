'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Manrope } from 'next/font/google';
import { useListingStore } from '@/store/listingStore';

const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

const PROPERTY_TYPES = [
  { value: '', label: 'All types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
];

const BEDROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '0', label: 'Studio' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4+' },
];

const BATHROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
];

const AMENITY_OPTIONS = [
  'Parking', 'Pool', 'Gym', 'Laundry', 'Pet-friendly',
  'Furnished', 'A/C', 'Dishwasher', 'Balcony', 'Elevator',
];

const inputCls =
  'w-full border-b border-stone-300 bg-transparent py-2 text-[13px] text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:outline-none transition';

const selectCls =
  'w-full border-b border-stone-300 bg-transparent py-2 text-[13px] text-stone-900 focus:border-stone-800 focus:outline-none transition appearance-none cursor-pointer';

const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400 mb-2';

export function BrowseListingFilters() {
  const [showFilters, setShowFilters] = useState(false);
  const { filters, setFilter, resetFilters } = useListingStore();

  const hasActiveFilters =
    filters.city || filters.propertyType || filters.minPrice || filters.maxPrice ||
    filters.bedrooms || filters.bathrooms || filters.amenities.length > 0;

  function toggleAmenity(amenity: string) {
    const current = filters.amenities;
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    setFilter('amenities', next);
  }

  return (
    <div className={`${sans.className} mb-10 space-y-5`}>
      {/* Search row */}
      <div className="flex items-center gap-4 border-b border-stone-300">
        <Search className="h-4 w-4 shrink-0 text-stone-400" />
        <input
          type="text"
          placeholder="Search by keyword, city, or address…"
          value={filters.keyword}
          onChange={(e) => setFilter('keyword', e.target.value)}
          className="flex-1 bg-transparent py-3 text-[14px] text-stone-900 placeholder-stone-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex shrink-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500 transition hover:text-stone-900"
        >
          {showFilters ? <X className="h-3.5 w-3.5" /> : <SlidersHorizontal className="h-3.5 w-3.5" />}
          {showFilters ? 'Close' : 'Filters'}
          {hasActiveFilters && !showFilters && (
            <span className="h-1.5 w-1.5 rounded-full bg-stone-800" />
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            <div>
              <label className={labelCls}>City</label>
              <input
                type="text"
                placeholder="e.g. New York"
                value={filters.city}
                onChange={(e) => setFilter('city', e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Property type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilter('propertyType', e.target.value)}
                className={selectCls}
              >
                {PROPERTY_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilter('bedrooms', e.target.value)}
                className={selectCls}
              >
                {BEDROOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Bathrooms</label>
              <select
                value={filters.bathrooms}
                onChange={(e) => setFilter('bathrooms', e.target.value)}
                className={selectCls}
              >
                {BATHROOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className={labelCls}>Price range</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min $"
                  value={filters.minPrice}
                  onChange={(e) => setFilter('minPrice', e.target.value)}
                  className={`${inputCls} w-1/2`}
                />
                <span className="text-stone-300">–</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter('maxPrice', e.target.value)}
                  className={`${inputCls} w-1/2`}
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className={labelCls}>Amenities</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      active
                        ? 'border-stone-900 bg-stone-900 text-[#f7f6f4]'
                        : 'border-stone-300 text-stone-600 hover:border-stone-600'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-400 transition hover:text-stone-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
