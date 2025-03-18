import { create } from 'zustand';

import { Mode } from '@/types/websocket';

interface GameInfoStore {
  gameRoomInfo: GameInfoState | null;
  setGameInfo: (newGameRoomInfo: GameInfoState) => void;
}

interface GameInfoState {
  roomTitle: string;
  maxPlayer: number;
  hasPassword: boolean;
  maxGameRound: number;
  format: 'GENERAL' | 'BOARD';
  selectedYear: number[];
  mode: Mode[];
  status: 'WAITING' | 'IN_PROGRESS';
}

export const useGameInfoStore = create<GameInfoStore>(set => ({
  gameRoomInfo: null,
  setGameInfo: (newGameRoomInfo: GameInfoState) => {
    set({ gameRoomInfo: newGameRoomInfo });
  },
}));
