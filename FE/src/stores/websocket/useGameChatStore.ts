import { create } from 'zustand';

import { Chatting, GameChatState, SkipUser } from '@/types/websocket';

const initialState = {
  gameChattings: [],
  skipInfo: [],
};

export const useGameChatStore = create<GameChatState>((set, get) => ({
  gameChattings: [],
  setGameChattings: (gameChatting: Chatting) => {
    set({ gameChattings: [...get().gameChattings, gameChatting] });
  },

  skipInfo: [],
  setSkipInfo: (skipUser: SkipUser) => {
    set({ skipInfo: [...get().skipInfo, skipUser] });
  },

  resetGameChatStore: () => set(initialState),
}));
