import { create } from 'zustand';

export type GameStateType =
  | 'ROUND_INFO'
  | 'ROUND_START'
  | 'ROUND_OPEN'
  | 'GAME_RESULT'
  | 'SCORE_UPDATE'
  | 'GAME_END'
  | 'REFUSED'
  | null;

interface GameStateStore {
  gameState: GameStateType;
  setGameState: (gameState: GameStateType) => void;
  resetGameState: () => void;
}

export const useGameStateStore = create<GameStateStore>(set => ({
  gameState: 'ROUND_INFO',
  setGameState: (gameState: GameStateType) => set({ gameState }),
  resetGameState: () => set({ gameState: null }),
}));
