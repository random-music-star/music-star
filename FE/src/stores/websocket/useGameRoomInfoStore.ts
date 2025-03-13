import { GameInfoState, GameInfoStore } from '@/types/websocket';
import { create } from 'zustand';

export const useGameInfoStore = create<GameInfoStore>(set => ({
  gameRoomInfo: {} as GameInfoState,
  setGameInfo: (newGameRoomInfo: GameInfoState) => {
    set({ gameRoomInfo: newGameRoomInfo });
  },
}));
