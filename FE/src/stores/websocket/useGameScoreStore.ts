import { create } from 'zustand';

import { Board, GameScoreState } from '@/types/websocket';

import { useGameScreenStore } from './useGameScreenStore';

export const useGameScoreStore = create<GameScoreState>(set => ({
  scores: null,
  setScores: (scores: Board) => set({ scores }),
  updateScores: (player: string, score: number) => {
    let count = 0;

    const interval = setInterval(() => {
      set(state => {
        if (!state.scores || !(player in state.scores)) {
          clearInterval(interval);
          return state;
        }

        return {
          scores: {
            ...state.scores,
            [player]: (state.scores[player] || 0) + 1,
          },
        };
      });

      count++;
      if (count >= score) {
        clearInterval(interval);
        useGameScreenStore.getState().setGameResult(null);
      }
    }, 500);
  },
}));
