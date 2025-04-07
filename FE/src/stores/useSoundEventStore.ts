import { create } from 'zustand';

type SoundEventKeys =
  | 'EVENT_CARD'
  | 'ROULETTE'
  | 'ROULETTE_123'
  | 'ROULETTE_123_RESULT'
  | 'WARNING'
  | 'WINNER'
  | 'CORRECT'
  | 'ROULETTE_RESULT'
  | 'JUMP'
  | null;

interface SoundEventStore {
  soundEvent: SoundEventKeys;
  setSoundEvent: (soundEventKey: SoundEventKeys) => void;
}

export const useSoundEventStore = create<SoundEventStore>(set => ({
  soundEvent: null,
  setSoundEvent: (soundEventKey: SoundEventKeys) => {
    set({ soundEvent: soundEventKey });
  },
}));
