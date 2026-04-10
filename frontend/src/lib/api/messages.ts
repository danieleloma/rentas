import { apiClient } from './client';
import type { Conversation, Message, ApiResponse } from '@/types';

export async function getConversationsApi(page = 1) {
  const { data } = await apiClient.get<ApiResponse<Conversation[]>>('/conversations', {
    params: { page },
  });
  return data;
}

export async function getMessagesApi(conversationId: string, page = 1) {
  const { data } = await apiClient.get<ApiResponse<Message[]>>(
    `/conversations/${conversationId}/messages`,
    { params: { page } },
  );
  return data;
}

export async function sendMessageApi(
  conversationId: string,
  payload: { content: string; messageType?: string },
) {
  const { data } = await apiClient.post<ApiResponse<Message>>(
    `/conversations/${conversationId}/messages`,
    payload,
  );
  return data.data;
}
