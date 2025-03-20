import { create } from 'zustand';

interface GameWinnerStore {
  winner: string | null;
  setWinner: (winner: string) => void;
  resetWinnerStore: () => void;
}

export const useGameWinnerStore = create<GameWinnerStore>(set => ({
  winner: null,
  setWinner: (winner: string) => set({ winner }),
  resetWinnerStore: () => set({ winner: null }),
}));
