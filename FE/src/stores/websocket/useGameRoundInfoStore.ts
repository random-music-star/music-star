import { create } from 'zustand';

import { Mode } from '@/types/websocket';

interface GameRoundInfoStore {
  roundInfo: RoundInfo | null;
  setGameMode: (roundInfo: RoundInfo | null) => void;
}

export interface RoundInfo {
  mode: Mode;
  round: number;
}

export const useGameRoundInfoStore = create<GameRoundInfoStore>(set => ({
  roundInfo: null,
  setGameMode: (roundInfo: RoundInfo | null) => set({ roundInfo }),
}));
