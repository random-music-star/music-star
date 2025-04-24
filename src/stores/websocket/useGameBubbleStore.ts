import { create } from 'zustand';

export type EventType =
  | 'MARK'
  | 'PLUS'
  | 'MINUS'
  | 'BOMB'
  | 'PULL'
  | 'NOTHING'
  | 'OVERLAP'
  | 'CLOVER'
  | 'SWAP'
  | 'WARP'
  | 'MAGNET';

interface GameBubbleStore {
  targetUser: null | string; // 느낌표(eventTrigger) => 이모지(event)
  triggerUser: null | string; // 무조건 물음표
  eventType: EventType | null;
  setEventType: (newEvent: EventType | null) => void;
  setTriggerUser: (newTriggerUser: string | null) => void;
  setTargetUser: (newTargetUser: string | null) => void;
}

export const useGameBubbleStore = create<GameBubbleStore>(set => ({
  triggerUser: null,
  targetUser: null,
  eventType: null,
  setEventType: (newEvent: EventType | null) => {
    set({ eventType: newEvent });
  },

  setTriggerUser: (newTriggerUser: string | null) => {
    set({ triggerUser: newTriggerUser });
  },

  setTargetUser: (newTargetUser: string | null) => {
    set({ targetUser: newTargetUser });
  },
}));
