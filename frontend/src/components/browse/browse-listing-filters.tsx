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

const inputCls =
  'w-full border-b border-stone-300 bg-transparent py-2 text-[13px] text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:outline-none transition';

const selectCls =
  'w-full border-b border-stone-300 bg-transparent py-2 text-[13px] text-stone-900 focus:border-stone-800 focus:outline-none transition appearance-none cursor-pointer';

const labelCls = 'block text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400 mb-2';

export function BrowseListingFilters() {
  const [showFilters, setShowFilters] = useState(false);
  const { filters, setFilter, resetFilters } = useListingStore();

  const hasActiveFilters =
    filters.city || filters.propertyType || filters.minPrice || filters.maxPrice || filters.bedrooms;

  return (
    <div className={`${sans.className} mb-10 space-y-5`}>
      {/* Search bar */}
      <div className="flex items-center gap-4 border-b border-stone-300 pb-0">
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
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-2 sm:grid-cols-4">
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
            <label className={labelCls}>Price range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilter('minPrice', e.target.value)}
                className={`${inputCls} w-1/2`}
              />
              <span className="text-stone-300">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilter('maxPrice', e.target.value)}
                className={`${inputCls} w-1/2`}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="col-span-full flex justify-end">
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
