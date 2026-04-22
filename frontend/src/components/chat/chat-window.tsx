'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMessages, useSendMessage } from '@/hooks/useMessages';
import { useAuthStore } from '@/store/authStore';
import { MessageBubble } from '@/components/chat/message-bubble';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const [text, setText] = useState('');

  const { data: response, isLoading, isFetching } = useMessages(conversationId);
  const messages = useMemo(() => response?.data ?? [], [response?.data]);
  const send = useSendMessage(conversationId);

  const orderedForReverseColumn = useMemo(
    () => [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [messages],
  );

  const onSend = useCallback(() => {
    const content = text.trim();
    if (!content || !conversationId) return;
    send.mutate(content, {
      onSuccess: () => setText(''),
    });
  }, [conversationId, send, text]);

  const showInitialLoad = isLoading && messages.length === 0;

  if (!conversationId) {
    return (
      <div className="flex min-h-[40vh] flex-1 flex-col items-center justify-center bg-white px-4 text-center text-sm text-gray-500 md:min-h-0">
        Select a conversation to view messages.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto px-3 py-4">
        {showInitialLoad ? (
          <div className="flex flex-col-reverse gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={i % 2 === 0 ? 'ml-auto h-10 w-2/3' : 'mr-auto h-10 w-3/5'} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center text-sm text-gray-500">
            No messages yet. Say hello to start the conversation.
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-3">
            {orderedForReverseColumn.map((m) => (
              <MessageBubble key={m.id} message={m} isMine={m.senderId === userId} />
            ))}
          </div>
        )}
        {isFetching && !isLoading && messages.length > 0 ? (
          <p className="pb-2 text-center text-xs text-gray-400">Updating…</p>
        ) : null}
      </div>

      <form
        className="border-t border-gray-100 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            disabled={send.isPending}
            className="flex-1"
            aria-label="Message"
          />
          <Button type="submit" disabled={send.isPending || !text.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
