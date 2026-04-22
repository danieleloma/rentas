import { supabase } from '@/lib/supabase';
import type { Conversation, Message } from '@/types';

const CONVERSATION_QUERY = `
  id, listing_id, participant_one_id, participant_two_id, last_message_at, created_at,
  listing:listings ( id, title, images:listing_images ( id, url, position ) ),
  participantOne:users!participant_one_id ( id, first_name, last_name, avatar_url ),
  participantTwo:users!participant_two_id ( id, first_name, last_name, avatar_url ),
  messages ( id, content, created_at, sender_id, is_read )
` as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapConversation(row: any): Conversation {
  return {
    id: row.id,
    listing: {
      id: row.listing?.id ?? row.listing_id,
      title: row.listing?.title ?? '',
      images: (row.listing?.images ?? [])
        .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
        .map((img: { id: string; url: string }) => ({ id: img.id, url: img.url, position: 0, isVirtualTour: false })),
    },
    participantOne: {
      id: row.participantOne?.id ?? row.participant_one_id,
      firstName: row.participantOne?.first_name ?? '',
      lastName: row.participantOne?.last_name ?? '',
      avatarUrl: row.participantOne?.avatar_url ?? undefined,
    },
    participantTwo: {
      id: row.participantTwo?.id ?? row.participant_two_id,
      firstName: row.participantTwo?.first_name ?? '',
      lastName: row.participantTwo?.last_name ?? '',
      avatarUrl: row.participantTwo?.avatar_url ?? undefined,
    },
    lastMessageAt: row.last_message_at ?? undefined,
    messages: (row.messages ?? []).map((m: { content: string; created_at: string; sender_id: string; is_read: boolean }) => ({
      content: m.content,
      createdAt: m.created_at,
      senderId: m.sender_id,
      isRead: m.is_read,
    })),
  };
}

const MESSAGE_QUERY = `
  id, conversation_id, sender_id, message_type, content, media_url, is_read, created_at,
  sender:users!sender_id ( id, first_name, last_name, avatar_url )
` as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    messageType: row.message_type,
    content: row.content,
    mediaUrl: row.media_url ?? undefined,
    isRead: row.is_read,
    createdAt: row.created_at,
    sender: {
      id: row.sender?.id ?? row.sender_id,
      firstName: row.sender?.first_name ?? '',
      lastName: row.sender?.last_name ?? '',
      avatarUrl: row.sender?.avatar_url ?? undefined,
    },
  };
}

export async function getConversationsApi(page = 1) {
  const limit = 20;
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('conversations')
    .select(CONVERSATION_QUERY, { count: 'exact' })
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    success: true,
    data: (data ?? []).map(mapConversation),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getMessagesApi(conversationId: string, page = 1) {
  const limit = 50;
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('messages')
    .select(MESSAGE_QUERY, { count: 'exact' })
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    success: true,
    data: (data ?? []).map(mapMessage),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function sendMessageApi(
  conversationId: string,
  payload: { content: string; messageType?: string },
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('messages')
    .insert({
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      sender_id: user.id,
      message_type: payload.messageType ?? 'text',
      content: payload.content,
    })
    .select(MESSAGE_QUERY)
    .single();

  if (error) throw new Error(error.message);

  // Update last_message_at on the conversation
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return mapMessage(data);
}

/** Find or create a conversation between the current user and another user about a listing. */
export async function getOrCreateConversationApi(listingId: string, otherUserId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check both orderings of participants (the constraint sorts them)
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .or(
      `and(participant_one_id.eq.${user.id},participant_two_id.eq.${otherUserId}),` +
      `and(participant_one_id.eq.${otherUserId},participant_two_id.eq.${user.id})`,
    )
    .maybeSingle();

  if (existing) return existing.id as string;

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      id: crypto.randomUUID(),
      listing_id: listingId,
      participant_one_id: user.id,
      participant_two_id: otherUserId,
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}
