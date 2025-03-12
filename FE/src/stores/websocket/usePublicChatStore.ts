import { Chatting, PublicChatState } from '@/types/websocket';
import { create } from 'zustand';

const initialState = {
  publicChattings: [],
};
export const usePublicChatStore = create<PublicChatState>((set, get) => ({
  publicChattings: [],
  setPublicChattings: (publicChatting?: Chatting) => {
    if (publicChatting)
      set({ publicChattings: [...get().publicChattings, publicChatting] });
    else set({ publicChattings: [] });
  },

  resetPublicChatStore: () => set(initialState),
}));
