import { create } from 'zustand';

interface NicknameStore {
  nickname: string;
  setNickname: (nickname: string) => void;
}
export const useNicknameStore = create<NicknameStore>(set => ({
  nickname: '',
  setNickname: (newNickname: string) => {
    set({ nickname: newNickname });
  },
}));
