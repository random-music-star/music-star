import { create } from 'zustand';

export interface GameHint {
  title: string;
  singer: string;
}

interface RoundHintStore {
  roundHint: GameHint | null;
  updateGameHint: (roundHint: GameHint | null) => void;
}

export const useRoundHintStore = create<RoundHintStore>(set => ({
  roundHint: null,

  updateGameHint: (newHint: GameHint | null) => set({ roundHint: newHint }),
}));
