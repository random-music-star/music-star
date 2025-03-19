import { create } from 'zustand';

export interface GameBoardInfoStore {
  boardInfo: Record<string, number>;
  setBoardInfo: (boardInfo: Record<string, number>) => void;
  updateBoardInfo: (gameBoardMove: GameBoardMove) => void;
  resetBoard: () => void;
}

interface GameBoardMove {
  username: string;
  position: number;
}

export const useGameBoardInfoStore = create<GameBoardInfoStore>(set => ({
  boardInfo: {} as Record<string, number>,

  setBoardInfo: (boardInfo: Record<string, number>) =>
    set({
      boardInfo,
    }),

  updateBoardInfo: ({ username, position }: GameBoardMove) =>
    set(state => ({
      boardInfo: {
        ...state.boardInfo,
        [username]: position,
      },
    })),

  resetBoard: () => set({ boardInfo: {} as Record<string, number> }),
}));
