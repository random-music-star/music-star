import { create } from 'zustand';

import { Mode } from '@/types/websocket';

export interface RoundInfo {
  mode: Mode;
  round: number;
  songUrl: string;
}

const initialRoundInfo: RoundInfo = {
  mode: 'DEFAULT' as Mode,
  round: 0,
  songUrl: '',
};

interface GameRoundInfoStore {
  roundInfo: RoundInfo;
  setRoundInfo: (info: RoundInfo) => void;
}

export const useGameRoundInfoStore = create<GameRoundInfoStore>(set => ({
  roundInfo: initialRoundInfo,

  setRoundInfo: (info: RoundInfo) => set({ roundInfo: info }),
}));
