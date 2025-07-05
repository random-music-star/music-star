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
  setEventType: (newEvent: EventType) => void;
  setTriggerUser: (newTriggerUser: string) => void;
  setTargetUser: (newTargetUser: string) => void;
  resetGameChatStore: () => void;
}

export const useGameBubbleStore = create<GameBubbleStore>(set => ({
  triggerUser: null,
  targetUser: null,
  eventType: null,
  setEventType: (newEvent: EventType) => {
    set({ eventType: newEvent });
  },

  setTriggerUser: (newTriggerUser: string) => {
    set({ triggerUser: newTriggerUser });
  },

  setTargetUser: (newTargetUser: string) => {
    set({ targetUser: newTargetUser });
  },
  resetGameChatStore: () => {
    set({
      triggerUser: null,
      targetUser: null,
      eventType: null,
    });
  },
}));
