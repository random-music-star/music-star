import { create } from 'zustand';

type GameStateType =
  | 'gameWait'
  | 'gameQuizOpened'
  | 'gameResultOpened'
  | 'gameScoreUpdate'
  | null;

interface GameState {
  gameState: GameStateType | null;
  setGameState: (gameState: GameStateType) => void;
}

export const useGameStateStore = create<GameState>(set => ({
  gameState: 'gameWait',
  setGameState: (gameState: GameStateType) => set({ gameState }),
}));
