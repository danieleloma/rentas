'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getListingsApi,
  getListingByIdApi,
  createListingApi,
  toggleFavoriteApi,
} from '@/lib/api/listings';
import { useListingStore } from '@/store/listingStore';
import { useUIStore } from '@/store/uiStore';

export function useListings() {
  const filters = useListingStore((s) => s.filters);

  return useInfiniteQuery({
    queryKey: ['listings', filters],
    queryFn: ({ pageParam = 1 }) =>
      getListingsApi({
        page: pageParam,
        city: filters.city || undefined,
        propertyType: filters.propertyType || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
        keyword: filters.keyword || undefined,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingByIdApi(id),
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: createListingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      addToast('Listing created successfully', 'success');
    },
    onError: () => {
      addToast('Failed to create listing', 'error');
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavoriteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
