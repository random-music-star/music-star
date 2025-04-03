import { create } from 'zustand';

import { Mode } from '@/types/websocket';

export interface RoundInfo {
  mode: Mode;
  round: number;
  songUrl: string;
  songUrl2: string;
}

const initialRoundInfo: RoundInfo = {
  mode: 'FULL' as Mode,
  round: 0,
  songUrl: '',
  songUrl2: '',
};

export const MODE_DICT = {
  FULL: '한곡모드',
  DUAL: '두곡모드',
  TTS: 'AI모드',
};

interface GameRoundInfoStore {
  roundInfo: RoundInfo;
  setRoundInfo: (info: RoundInfo) => void;

  resetRoundInfo: () => void;
}

export const useGameRoundInfoStore = create<GameRoundInfoStore>(set => ({
  roundInfo: initialRoundInfo,

  setRoundInfo: (info: RoundInfo) => set({ roundInfo: info }),

  resetRoundInfo: () => set({ roundInfo: initialRoundInfo }),
}));
