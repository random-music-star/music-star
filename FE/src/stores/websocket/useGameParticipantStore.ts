import { PariticpantInfo, ParticipantInfoStore } from '@/types/websocket';
import { create } from 'zustand';

export const useParticipantInfoStore = create<ParticipantInfoStore>(
  // 상태관리에 대한 고민 해볼 것(전역상태 or useMemo)
  (set, get) => ({
    participantInfo: [],
    readyPlayers: [],
    notReadyPlayers: [],

    hostNickname: null,
    isAllReady: false,

    setIsAllReady: (newState: boolean) => set({ isAllReady: newState }),

    setParticipantInfo: (newParticipantInfo: PariticpantInfo[]) => {
      const host = get().participantInfo.find(user => user.isHost);

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
  }),
);
