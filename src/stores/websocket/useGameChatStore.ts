import { create } from 'zustand';

import { Chatting } from '@/types/websocket';

const initialChat: Chatting = {
  sender: 'system',
  messageType: 'notice',
  message: '방에 입장하였습니다.',
};

interface GameChatStore {
  gameChattings: Chatting[];
  setGameChattings: (gameChatting: Chatting) => void;
  resetGameChatStore: () => void;
}

export const useGameChatStore = create<GameChatStore>((set, get) => ({
  gameChattings: [initialChat],
  setGameChattings: (gameChatting: Chatting) => {
    set({ gameChattings: [...get().gameChattings, gameChatting] });
  },
  resetGameChatStore: () => set({ gameChattings: [initialChat] }),
}));
