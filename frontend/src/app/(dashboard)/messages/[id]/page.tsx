'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { ChatWindow } from '@/components/chat/chat-window';

export default function ConversationPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          <ChevronLeft className="size-5" aria-hidden />
          Back
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
        <ChatWindow conversationId={id} />
      </div>
    </div>
  );
}
