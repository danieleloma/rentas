import type { Message } from '@/types';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const senderLabel = `${message.sender.firstName} ${message.sender.lastName}`.trim();

  return (
    <div
      className={cn('flex max-w-[85%] flex-col gap-0.5', isMine ? 'ml-auto items-end' : 'mr-auto items-start')}
    >
      {!isMine ? (
        <span className="px-1 text-xs font-medium text-gray-600">{senderLabel}</span>
      ) : null}
      <div
        className={cn(
          'rounded-2xl px-3 py-2 text-sm',
          isMine ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900',
        )}
      >
        {message.content}
      </div>
      <time
        dateTime={message.createdAt}
        className="px-1 text-[0.65rem] text-gray-500"
      >
        {formatDateTime(message.createdAt)}
      </time>
    </div>
  );
}
