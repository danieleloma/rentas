'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useListingStore } from '@/store/listingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const PROPERTY_TYPES = [
  { value: '_all', label: 'All types' },
  { value: 'apartment', label: 'Apartment / Flat' },
  { value: 'self_contained', label: 'Self-Contained' },
  { value: 'room_and_parlour', label: 'Room & Parlour' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'house', label: 'Detached House' },
  { value: 'mini_flat', label: 'Mini Flat' },
  { value: 'studio', label: 'Studio' },
];

const BEDROOM_OPTIONS = [
  { value: '_all', label: 'Any' },
  { value: '0', label: 'Self-Con / Studio' },
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4+ Bedrooms' },
];

const BATHROOM_OPTIONS = [
  { value: '_all', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
];

const AMENITY_OPTIONS = [
  'Prepaid Meter', 'Borehole', 'Fence / Gate', 'CCTV', 'Boys Quarters',
  'Parking', 'Generator', 'Air Conditioning', 'Tiled Floors', 'POP Ceiling',
];

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
    <div className="mb-10 space-y-3">
      {/* Search + filters toggle row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by area, estate, or address…"
            value={filters.keyword}
            onChange={(e) => setFilter('keyword', e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0 gap-1.5"
        >
          {showFilters ? <X className="h-3.5 w-3.5" /> : <SlidersHorizontal className="h-3.5 w-3.5" />}
          {showFilters ? 'Close' : 'Filters'}
          {hasActiveFilters && !showFilters && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="animate-slide-down rounded-xl border border-border bg-card p-5 space-y-5">
          {/* Grid of selects */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label>City / LGA</Label>
              <Input
                placeholder="e.g. Lekki, Ikeja"
                value={filters.city}
                onChange={(e) => setFilter('city', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Property type</Label>
              <Select
                value={filters.propertyType || '_all'}
                onValueChange={(val) => setFilter('propertyType', !val || val === '_all' ? '' : val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Bedrooms</Label>
              <Select
                value={filters.bedrooms || '_all'}
                onValueChange={(val) => setFilter('bedrooms', !val || val === '_all' ? '' : val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BEDROOM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Bathrooms</Label>
              <Select
                value={filters.bathrooms || '_all'}
                onValueChange={(val) => setFilter('bathrooms', !val || val === '_all' ? '' : val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BATHROOM_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Monthly Rent (₦)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilter('minPrice', e.target.value)}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilter('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Amenity chips */}
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end border-t border-border pt-3">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
