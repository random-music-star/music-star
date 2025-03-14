import {
  Board,
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
  boardInfo: null,
  score: [],
  gameResult: null,
  gameHint: {
    title: 'ㅌㅂㅇ',
    singer: '',
  },
};

export const useGameScreenStore = create<GameScreenState>(set => ({
  remainTime: null,
  setRemainTime: (remainTime: number | null) => set({ remainTime }),

  gameMode: null,
  setGameMode: (gameMode: GameMode | null) => set({ gameMode }),

  songUrl: null,
  setSongUrl: (songUrl: string | null) => set({ songUrl }),

  boardInfo: null,
  setBoardInfo: (boardInfo: Board | null) => set({ boardInfo }),

  score: [],
  setScore: (score: BoardUser[] | []) => set({ score }),

  gameResult: null,
  setGameResult: (gameResult: GameResult | null) => set({ gameResult }),

  gameHint: {
    title: 'ㅌㅂㅇ',
    singer: '',
  },
  setGameHint: (gameHint: GameHint) => set({ gameHint }),

  resetGameScreenStore: () => set(initialState),
}));
