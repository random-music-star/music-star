import { create } from 'zustand';

interface GameRoundResultStore {
  gameRoundResult: null | GameRoundResult;
  setGameRoundResult: (newGameRoundResult: GameRoundResult | null) => void;
}

export interface GameRoundResult {
  winner: string;
  songTitle: string;
  songTitle2: string;
  singer: string;
  singer2: string;
  score: number;
}

export const useGameRoundResultStore = create<GameRoundResultStore>(set => ({
  gameRoundResult: null,
  setGameRoundResult: (newGameRoundResult: GameRoundResult | null) => {
    set({ gameRoundResult: newGameRoundResult });
  },
}));
