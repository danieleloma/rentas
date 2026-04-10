'use client';

import type { Conversation } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils/format';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils/cn';

export interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

function getOtherParticipant(conv: Conversation, userId: string | undefined) {
  if (!userId) return conv.participantOne;
  return conv.participantOne.id === userId ? conv.participantTwo : conv.participantOne;
}

function getLastMessage(conv: Conversation) {
  const msgs = conv.messages ?? [];
  if (msgs.length === 0) return null;
  return msgs[msgs.length - 1];
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  const userId = useAuthStore((s) => s.user?.id);

  return (
    <ul className="divide-y divide-gray-100" role="list">
      {conversations.map((conv) => {
        const other = getOtherParticipant(conv, userId);
        const name = `${other.firstName} ${other.lastName}`.trim();
        const last = getLastMessage(conv);
        const preview = last?.content ?? '';
        const timeSource = conv.lastMessageAt ?? last?.createdAt;
        const isActive = activeId === conv.id;

        return (
          <li key={conv.id}>
            <button
              type="button"
              onClick={() => onSelect(conv.id)}
              className={cn(
                'flex w-full gap-3 px-3 py-3 text-left transition-colors hover:bg-gray-50',
                isActive && 'bg-gray-100 hover:bg-gray-100',
              )}
            >
              <Avatar
                src={other.avatarUrl}
                name={name || 'User'}
                size="md"
                className="shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium text-gray-900">{name}</p>
                  {timeSource ? (
                    <time
                      dateTime={timeSource}
                      className="shrink-0 text-xs text-gray-500"
                    >
                      {formatRelativeTime(timeSource)}
                    </time>
                  ) : null}
                </div>
                <p className="truncate text-sm text-gray-600">{conv.listing.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{preview || '—'}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
