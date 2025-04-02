import { create } from 'zustand';

type SoundEventKeys =
  | 'EVENT_CARD'
  | 'ROULETTE'
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
