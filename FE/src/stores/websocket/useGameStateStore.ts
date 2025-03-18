import { create } from 'zustand';

type GameStateType =
  | 'TIMER_WAIT'
  | 'QUIZ_OPEN'
  | 'GAME_RESULT'
  | 'SCORE_UPDATE'
  | 'REFUSED'
  | null;

interface GameStateStore {
  gameState: GameStateType | null;
  setGameState: (gameState: GameStateType) => void;
  resetGameState: () => void;
}

export const useGameStateStore = create<GameStateStore>(set => ({
  gameState: null,
  setGameState: (gameState: GameStateType) => set({ gameState }),
  resetGameState: () => set({ gameState: null }),
}));
