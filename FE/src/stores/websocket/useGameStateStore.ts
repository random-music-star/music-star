import { create } from 'zustand';

type GameStateType =
  | 'TIMER_WAIT'
  | 'QUIZ_OPEN'
  | 'ROUND_OPEN'
  | 'GAME_RESULT'
  | 'SCORE_UPDATE'
  | 'REFUSED'
  | null;

interface GameStateStore {
  gameState: GameStateType;
  setGameState: (gameState: GameStateType) => void;
  resetGameState: () => void;
}

export const useGameStateStore = create<GameStateStore>(set => ({
  gameState: 'TIMER_WAIT',
  setGameState: (gameState: GameStateType) => set({ gameState }),
  resetGameState: () => set({ gameState: null }),
}));
