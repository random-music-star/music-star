import { create } from 'zustand';

const initialState = {
  remainTime: null, // 제거
  songUrl: null,
  boardInfo: null, // 게임 시작할 때 유저데이터 순환하면서 초기화 해야 함
  gameHint: null,
};

export interface GameHint {
  title: string;
  singer: string | null;
}

export type Board = Record<string, number>;

interface GameScreenState {
  remainTime: number | null;
  setRemainTime: (remainTime: number | null) => void;
  songUrl: string | null;
  setSongUrl: (songUrl: string | null) => void;
  boardInfo: Board | null;
  setBoardInfo: (boardInfo: Board | null) => void;
  gameHint: GameHint | null;
  setGameHint: (gameHint: GameHint | null) => void;
  resetGameScreenStore: () => void;
}

export const useGameScreenStore = create<GameScreenState>(set => ({
  remainTime: null,
  setRemainTime: (remainTime: number | null) => set({ remainTime }),

  songUrl: null,
  setSongUrl: (songUrl: string | null) => set({ songUrl }),

  boardInfo: null,
  setBoardInfo: (boardInfo: Board | null) => set({ boardInfo }),

  gameHint: null,
  setGameHint: (gameHint: GameHint | null) => set({ gameHint }),

  resetGameScreenStore: () => set(initialState),
}));
