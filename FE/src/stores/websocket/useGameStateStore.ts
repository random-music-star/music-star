import { create } from 'zustand';

type GameStateType =
  | 'TIMER_WAIT'
  | 'QUIZ_OPEN'
  | 'GAME_RESULT'
  | 'SCORE_UPDATE'
  | null;

interface GameState {
  gameState: GameStateType | null;
  setGameState: (gameState: GameStateType) => void;
  resetGameState: () => void;
}

export const useGameStateStore = create<GameState>(set => ({
  gameState: null,
  setGameState: (gameState: GameStateType) => set({ gameState }),

  resetGameState: () => set({ gameState: null }),
}));
