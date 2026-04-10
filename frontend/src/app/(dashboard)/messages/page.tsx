'use client';

import { ChevronLeft } from 'lucide-react';
import { useConversations } from '@/hooks/useMessages';
import { useMessageStore } from '@/store/messageStore';
import { ConversationList } from '@/components/chat/conversation-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

export default function MessagesPage() {
  const { data, isLoading } = useConversations();
  const conversations = data?.data ?? [];
  const activeId = useMessageStore((s) => s.activeConversationId);
  const setActive = useMessageStore((s) => s.setActiveConversation);

  const showChatOnMobile = Boolean(activeId);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-1 flex-col md:min-h-[calc(100vh-6rem)]">
      <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100 md:text-2xl">Messages</h1>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white md:flex-row dark:border-gray-800 dark:bg-gray-900">
        <aside
          className={cn(
            'flex max-h-[50vh] min-h-0 w-full flex-col border-gray-200 md:max-h-none md:w-1/3 md:border-r',
            showChatOnMobile && 'hidden md:flex',
          )}
        >
          {isLoading ? (
            <div className="space-y-0 divide-y divide-gray-100 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              No conversations yet. Start from a listing to message a landlord or renter.
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={(id) => setActive(id)}
              />
            </div>
          )}
        </aside>

        <section
          className={cn(
            'flex min-h-0 min-h-[50vh] flex-1 flex-col md:min-h-0',
            !showChatOnMobile && 'hidden md:flex',
          )}
        >
          {showChatOnMobile ? (
            <div className="flex items-center gap-2 border-b border-gray-100 px-2 py-2 md:hidden dark:border-gray-800">
              <button
                type="button"
                onClick={() => setActive(null)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="size-5" aria-hidden />
                Back
              </button>
            </div>
          ) : null}
          <ChatWindow conversationId={activeId ?? ''} />
        </section>
      </div>
    </div>
  );
}
