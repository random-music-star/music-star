import { create } from 'zustand';

interface ParticipantInfoStore {
  participantInfo: ParticipantInfo[];
  setParticipantInfo: (newPariticipantInfo: ParticipantInfo[]) => void;
  hostNickname: string | null;
  readyPlayers: ParticipantInfo[];
  notReadyPlayers: ParticipantInfo[];
  isAllReady: boolean;
  setIsAllReady: (state: boolean) => void;
  updateParticipantReadyStates: (userInfoList: ParticipantInfo[]) => void;
  resetParticipantInfo: () => void;
}

interface ParticipantInfo {
  userName: string;
  isReady: boolean;
  isHost: boolean;
  character: string;
}

const initialState = {
  participantInfo: [],
  readyPlayers: [],
  notReadyPlayers: [],
  hostNickname: null,
  isAllReady: false,
};

export const useParticipantInfoStore = create<ParticipantInfoStore>(set => ({
  participantInfo: [],
  readyPlayers: [],
  notReadyPlayers: [],
  hostNickname: null,
  isAllReady: false,

  setIsAllReady: (newState: boolean) => set({ isAllReady: newState }),

  setParticipantInfo: (
    newParticipantInfo: Omit<ParticipantInfo, 'character'>[],
  ) => {
    set(() => {
      const updatedParticipants = newParticipantInfo.map((user, index) => ({
        ...user,
        character: `/character/character_${index}.svg`,
      }));

      const host = updatedParticipants.find(user => user.isHost);

      return {
        participantInfo: updatedParticipants,
        hostNickname: host?.userName,
      };
    });
  },

  updateParticipantReadyStates: (userInfoList: ParticipantInfo[]) => {
    set({
      readyPlayers: userInfoList.filter(user => user.isReady),
      notReadyPlayers: userInfoList.filter(user => !user.isReady),
    });
  },

  resetParticipantInfo: () => set(initialState),
}));
