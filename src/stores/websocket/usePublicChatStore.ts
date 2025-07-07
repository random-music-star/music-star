import { create } from 'zustand';

import { Chatting } from '@/types/websocket';

export interface PublicChatStore {
  publicChattings: Chatting[];
  addPublicChattings: (publicChatting: Chatting) => void;
  resetPublicChatStore: () => void;
}

const initialState = {
  publicChattings: [],
};

export const usePublicChatStore = create<PublicChatStore>((set, get) => ({
  publicChattings: [],
  addPublicChattings: (publicChatting: Chatting) => {
    set({ publicChattings: [...get().publicChattings, publicChatting] });
  },

  resetPublicChatStore: () => set(initialState),
}));
