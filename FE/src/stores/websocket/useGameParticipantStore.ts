import { create } from 'zustand';

interface ParticipantInfoStore {
  participantInfo: PariticpantInfo[];
  setParticipantInfo: (newPariticipantInfo: PariticpantInfo[]) => void;
  hostNickname: string | null;
  readyPlayers: PariticpantInfo[];
  notReadyPlayers: PariticpantInfo[];
  isAllReady: boolean;
  setIsAllReady: (state: boolean) => void;
  updateParticipantReadyStates: (userInfoList: PariticpantInfo[]) => void;
  resetParticipantInfo: () => void;
}

interface PariticpantInfo {
  userName: string;
  isReady: boolean;
  isHost: boolean;
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

  setParticipantInfo: (newParticipantInfo: PariticpantInfo[]) => {
    const host = newParticipantInfo.find(user => user.isHost);

    set({
      participantInfo: newParticipantInfo,
      hostNickname: host?.userName,
    });
  },

  updateParticipantReadyStates: (userInfoList: PariticpantInfo[]) => {
    set({
      readyPlayers: userInfoList.filter(user => user.isReady),
      notReadyPlayers: userInfoList.filter(user => !user.isReady),
    });
  },

  resetParticipantInfo: () => set(initialState),
}));
