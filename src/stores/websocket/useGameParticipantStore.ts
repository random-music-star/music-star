import { create } from 'zustand';

interface ParticipantInfoStore {
  participantInfo: ParticipantInfo[];
  setParticipantInfo: (newPariticipantInfo: ParticipantInfo[]) => void;
  resetReadyInfo: () => void;
  hostNickname: string | null;
  isAllReady: boolean;
  setIsAllReady: (state: boolean) => void;
  resetParticipantInfo: () => void;
}

export interface ParticipantInfo {
  userName: string;
  isReady: boolean;
  isHost: boolean;
  character: string;
  colorNumber: number;
}

const initialState = {
  participantInfo: [],
  hostNickname: null,
  isAllReady: false,
};

export const useParticipantInfoStore = create<ParticipantInfoStore>(set => ({
  participantInfo: [],
  hostNickname: null,
  isAllReady: false,

  setIsAllReady: (newState: boolean) => set({ isAllReady: newState }),

  setParticipantInfo: (
    newParticipantInfo: Omit<ParticipantInfo, 'character'>[],
  ) => {
    set(() => {
      const updatedParticipants = newParticipantInfo.map(user => ({
        ...user,
        character: `/character/character_${user.colorNumber}.svg`,
      }));

      const host = updatedParticipants.find(user => user.isHost);

      return {
        participantInfo: updatedParticipants,
        hostNickname: host?.userName,
      };
    });
  },

  resetReadyInfo: () => {
    set(prev => ({
      participantInfo: prev.participantInfo.map(participant => ({
        ...participant,
        isReady: false,
      })),
    }));
  },

  resetParticipantInfo: () => set(initialState),
}));
