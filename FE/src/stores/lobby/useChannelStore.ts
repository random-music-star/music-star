import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ChannelState {
  currentChannelId: number | null;
  setCurrentChannelId: (id: number | null) => void;
}

export const useChannelStore = create<ChannelState>()(
  devtools(
    persist(
      set => ({
        currentChannelId: null,
        setCurrentChannelId: id => set({ currentChannelId: id }),
      }),
      {
        name: 'channel-storage',
      },
    ),
  ),
);
