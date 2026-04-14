'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  getListingsApi,
  getListingByIdApi,
  createListingApi,
  uploadListingImageApi,
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
    mutationFn: async ({
      listingData,
      images,
    }: {
      listingData: Record<string, unknown>;
      images?: File[];
    }) => {
      const listing = await createListingApi(listingData);
      if (images?.length && listing?.id) {
        await Promise.all(images.map((file) => uploadListingImageApi(listing.id, file)));
      }
      return listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      addToast('Listing created successfully', 'success');
    },
    onError: (err) => {
      let message = 'Failed to create listing';
      if (isAxiosError(err)) {
        const data = err.response?.data as { error?: { message?: string } } | undefined;
        const msg = data?.error?.message;
        if (typeof msg === 'string' && msg.length > 0) message = msg;
      }
      addToast(message, 'error');
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
