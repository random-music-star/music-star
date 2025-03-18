import { create } from 'zustand';

interface GameRoundResultStore {
  gameRoundResult: null | GameRoundResult;
  setGameRoundResult: (newGameRoundResult: GameRoundResult) => void;
}

export interface GameRoundResult {
  winner: string;
  songTitle: string;
  singer: string;
  score: number;
}

export const useGameRoundResultStore = create<GameRoundResultStore>(set => ({
  gameRoundResult: null,
  setGameRoundResult: (newGameRoundResult: GameRoundResult) => {
    set({ gameRoundResult: newGameRoundResult });
  },
}));
