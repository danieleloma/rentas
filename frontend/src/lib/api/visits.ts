import { apiClient } from './client';
import type { Visit, ApiResponse } from '@/types';

export async function getVisitsApi(page = 1) {
  const { data } = await apiClient.get<ApiResponse<Visit[]>>('/visits', {
    params: { page },
  });
  return data;
}

export async function createVisitApi(payload: {
  listingId: string;
  scheduledAt: string;
  viewingType?: string;
  note?: string;
}) {
  const { data } = await apiClient.post<ApiResponse<Visit>>('/visits', payload);
  return data.data;
}

export async function updateVisitStatusApi(id: string, status: string) {
  const { data } = await apiClient.put<ApiResponse<Visit>>(`/visits/${id}/status`, { status });
  return data.data;
}

export async function cancelVisitApi(id: string) {
  const { data } = await apiClient.put<ApiResponse<Visit>>(`/visits/${id}/cancel`);
  return data.data;
}
