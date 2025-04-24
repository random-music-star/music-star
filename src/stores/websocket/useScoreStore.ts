import { create } from 'zustand';

type PlayingGameScore = Record<string, number>;

export interface ScoreStore {
  scores: PlayingGameScore;
  setScores: (initialScores: PlayingGameScore) => void;
  updateScore: (username: string, score: number) => void;
  resetScores: () => void;
}

export const useScoreStore = create<ScoreStore>(set => ({
  scores: {},

  setScores: initialScores => set({ scores: initialScores }),

  updateScore: (username, score) =>
    set(state => ({
      scores: {
        ...state.scores,
        [username]: score,
      },
    })),

  resetScores: () => set({ scores: {} }),
}));
