import { create } from 'zustand';

import { GameInfoState, GameInfoStore } from '@/types/websocket';

export const useGameInfoStore = create<GameInfoStore>(set => ({
  gameRoomInfo: {} as GameInfoState,
  setGameInfo: (newGameRoomInfo: GameInfoState) => {
    set({ gameRoomInfo: newGameRoomInfo });
  },
}));
