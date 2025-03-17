import { create } from 'zustand';

import {
  Board,
  BoardUser,
  GameHint,
  GameResult,
  GameScreenState,
  RoundInfo,
} from '@/types/websocket';

const initialState = {
  remainTime: null,
  roundInfo: null,
  songUrl: null,
  boardInfo: null,
  score: [],
  gameResult: null,
  gameHint: null,
};

export const useGameScreenStore = create<GameScreenState>(set => ({
  remainTime: null,
  setRemainTime: (remainTime: number | null) => set({ remainTime }),

  roundInfo: null,
  setGameMode: (roundInfo: RoundInfo | null) => set({ roundInfo }),

  songUrl: null,
  setSongUrl: (songUrl: string | null) => set({ songUrl }),

  boardInfo: null,
  setBoardInfo: (boardInfo: Board | null) => set({ boardInfo }),

  score: [],
  setScore: (score: BoardUser[] | []) => set({ score }),

  gameResult: null,
  setGameResult: (gameResult: GameResult | null) => set({ gameResult }),

  gameHint: null,
  setGameHint: (gameHint: GameHint | null) => set({ gameHint }),

  resetGameScreenStore: () => set(initialState),
}));
