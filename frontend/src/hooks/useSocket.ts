'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(WS_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', conversationId);
  }, []);

  const sendTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:start', { conversationId });
  }, []);

  const onNewMessage = useCallback(
    (callback: (data: Record<string, unknown>) => void) => {
      socketRef.current?.on('message:new', callback);
      return () => {
        socketRef.current?.off('message:new', callback);
      };
    },
    [],
  );

  const onTyping = useCallback(
    (callback: (data: { userId: string; conversationId: string }) => void) => {
      socketRef.current?.on('typing:start', callback);
      return () => {
        socketRef.current?.off('typing:start', callback);
      };
    },
    [],
  );

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    sendTyping,
    onNewMessage,
    onTyping,
  };
}
