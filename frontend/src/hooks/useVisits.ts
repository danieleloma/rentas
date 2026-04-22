'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVisitsApi, createVisitApi, updateVisitStatusApi, cancelVisitApi } from '@/lib/api/visits';
import { useUIStore } from '@/store/uiStore';

export function useVisits() {
  return useQuery({
    queryKey: ['visits'],
    queryFn: () => getVisitsApi(),
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: createVisitApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      addToast('Visit request sent', 'success');
    },
    onError: () => {
      addToast('Failed to schedule visit', 'error');
    },
  });
}

export function useUpdateVisitStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateVisitStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}

export function useCancelVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelVisitApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
  });
}
