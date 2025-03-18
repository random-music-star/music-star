import { create } from 'zustand';

import { Chatting } from '@/types/websocket';

export interface PublicChatStore {
  publicChattings: Chatting[];
  setPublicChattings: (publicChatting?: Chatting) => void;
  resetPublicChatStore: () => void;
}

const initialState = {
  publicChattings: [],
};

export const usePublicChatStore = create<PublicChatStore>((set, get) => ({
  publicChattings: [],
  setPublicChattings: (publicChatting?: Chatting) => {
    if (publicChatting)
      set({ publicChattings: [...get().publicChattings, publicChatting] });
    else set({ publicChattings: [] });
  },

  resetPublicChatStore: () => set(initialState),
}));
