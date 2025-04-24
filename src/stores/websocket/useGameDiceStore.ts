import { create } from 'zustand';

interface MovementInfo {
  username: string;
  totalMovement: number;
}

interface GameDiceStore {
  isActiveDice: boolean;
  diceUsername: string;
  diceTotalmovement: number | null;

  setIsActiveDice: (isActiceDice: boolean) => void;
  setDice: (movement: MovementInfo) => void;
  resetDice: () => void;
}

export const useGameDiceStore = create<GameDiceStore>(set => ({
  isActiveDice: false,
  diceUsername: '',
  diceTotalmovement: null,
  setIsActiveDice: (isActiceDice: boolean) => {
    set({ isActiveDice: isActiceDice });
  },
  setDice: (movement: MovementInfo) => {
    set({
      diceUsername: movement.username,
      diceTotalmovement: movement.totalMovement,
    });
  },

  resetDice: () => {
    set({
      diceUsername: '',
      diceTotalmovement: null,
    });
  },
}));
