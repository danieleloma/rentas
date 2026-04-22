'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversationsApi, getMessagesApi, sendMessageApi } from '@/lib/api/messages';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversationsApi(),
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessagesApi(conversationId),
    enabled: !!conversationId,
    refetchInterval: 10_000,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessageApi(conversationId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
