'use client';

import { create } from 'zustand';

interface ListingFilters {
  city: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  keyword: string;
}

interface ListingState {
  filters: ListingFilters;
  setFilter: (key: keyof ListingFilters, value: string) => void;
  resetFilters: () => void;
}

const defaultFilters: ListingFilters = {
  city: '',
  propertyType: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  keyword: '',
};

export const useListingStore = create<ListingState>((set) => ({
  filters: { ...defaultFilters },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),
}));
