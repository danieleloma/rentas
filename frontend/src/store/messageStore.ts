'use client';

import { create } from 'zustand';

interface MessageState {
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),
}));
