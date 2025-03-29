import { create } from 'zustand';

interface NicknameStore {
  nickname: string;
  setNickname: (nickname: string) => void;
}
export const useNicknameStore = create<NicknameStore>((set, get) => ({
  nickname: '',
  setNickname: (newNickname: string) => {
    const currentNickname = get().nickname;

    if (currentNickname !== newNickname) {
      set({ nickname: newNickname });
    }
  },
}));
