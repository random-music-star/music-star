import { PariticpantInfo, ParticipantInfoStore } from '@/types/websocket';
import { create } from 'zustand';

export const useParticipantInfoStore = create<ParticipantInfoStore>(set => ({
  participantInfo: [],
  setParticipantInfo: (newParticipantInfo: PariticpantInfo[]) => {
    set({ participantInfo: newParticipantInfo });
  },
}));
