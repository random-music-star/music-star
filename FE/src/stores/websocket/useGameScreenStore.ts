import {
  BoardUser,
  GameHint,
  GameMode,
  GameResult,
  GameScreenState,
} from '@/types/websocket';
import { create } from 'zustand';

const initialState = {
  remainTime: null,
  gameMode: null,
  songUrl: null,
  boardInfo: [],
  score: [],
  gameResult: null,
  gameHint: null,
};

export const useGameScreenStore = create<GameScreenState>(set => ({
  remainTime: null,
  setRemainTime: (remainTime: number) => set({ remainTime }),

  gameMode: null,
  setGameMode: (gameMode: GameMode) => set({ gameMode }),

  songUrl: null,
  setSongUrl: (songUrl: string) => set({ songUrl }),

  boardInfo: [],
  setBoardInfo: (boardInfo: BoardUser[]) => set({ boardInfo }),

  score: [],
  setScore: (score: BoardUser[]) => set({ score }),

  gameResult: null,
  setGameResult: (gameResult: GameResult) => set({ gameResult }),

  gameHint: null,
  setGameHint: (gameHint: GameHint) => set({ gameHint }),

  resetGameScreenStore: () => set(initialState),
}));
