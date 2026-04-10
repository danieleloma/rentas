import { apiClient } from './client';
import type { Listing, ApiResponse, PaginationMeta } from '@/types';
import { demoListings } from '@/lib/mock/listings';

interface ListingFilters {
  page?: number;
  limit?: number;
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  keyword?: string;
}

export async function getListingsApi(filters: ListingFilters = {}) {
  try {
    const { data } = await apiClient.get<ApiResponse<Listing[]> & { meta: PaginationMeta }>(
      '/listings',
      { params: filters },
    );
    return data;
  } catch {
    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 20);
    const start = (page - 1) * limit;
    const paged = demoListings.slice(start, start + limit);
    const totalPages = Math.max(1, Math.ceil(demoListings.length / limit));
    const meta: PaginationMeta = {
      page,
      limit,
      total: demoListings.length,
      totalPages,
    };
    return { success: true, data: paged, meta };
  }
}

export async function getListingByIdApi(id: string) {
  try {
    const { data } = await apiClient.get<ApiResponse<Listing>>(`/listings/${id}`);
    return data.data;
  } catch {
    return demoListings.find((listing) => listing.id === id) ?? null;
  }
}

export async function createListingApi(payload: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<Listing>>('/listings', payload);
  return data.data;
}

export async function updateListingApi(id: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.put<ApiResponse<Listing>>(`/listings/${id}`, payload);
  return data.data;
}

export async function deleteListingApi(id: string) {
  await apiClient.delete(`/listings/${id}`);
}

export async function toggleFavoriteApi(id: string) {
  const { data } = await apiClient.post<ApiResponse<{ favorited: boolean }>>(
    `/listings/${id}/favorite`,
  );
  return data.data;
}

export async function getFavoritesApi(page = 1) {
  const { data } = await apiClient.get<ApiResponse<Listing[]>>('/listings/favorites', {
    params: { page },
  });
  return data;
}
