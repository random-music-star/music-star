import { create } from 'zustand';

import { Mode } from '@/types/websocket';

export type SelectedYearType =
  | 1970
  | 1980
  | 1990
  | 2000
  | 2010
  | 2020
  | 2021
  | 2022
  | 2023
  | 2024;

interface GameInfoStore {
  gameRoomInfo: GameInfoState | null;
  setGameInfo: (newGameRoomInfo: GameInfoState) => void;
}

interface GameInfoState {
  roomTitle: string;
  roomNumber: number;
  maxPlayer: number;
  hasPassword: boolean;
  maxGameRound: number;
  format: 'GENERAL' | 'BOARD';
  selectedYear: SelectedYearType[];
  mode: Mode[];
  status: 'WAITING' | 'IN_PROGRESS';
}

export const useGameInfoStore = create<GameInfoStore>(set => ({
  gameRoomInfo: null,
  setGameInfo: (newGameRoomInfo: GameInfoState) => {
    set({ gameRoomInfo: newGameRoomInfo });
  },
}));
