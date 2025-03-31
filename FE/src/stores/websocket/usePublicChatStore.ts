import { create } from 'zustand';

import { Chatting } from '@/types/websocket';

export interface PublicChatStore {
  publicChattings: Chatting[];
  setPublicChattings: (publicChatting: Chatting) => void;
  resetPublicChatStore: () => void;
}

const initialState = {
  publicChattings: [],
};

export const usePublicChatStore = create<PublicChatStore>((set, get) => ({
  publicChattings: [],
  setPublicChattings: (publicChatting: Chatting) => {
    set({ publicChattings: [...get().publicChattings, publicChatting] });
  },

  resetPublicChatStore: () => set(initialState),
}));
