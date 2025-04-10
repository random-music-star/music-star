// API 요청 및 응답 타입 정의
export interface CreateRoomRequest {
  title: string;
  password: string;
  format: string;
  gameModes: string[];
  selectedYears: number[];
  maxGameRound: number;
  maxPlayer: number;
}

export interface CreateRoomResponse {
  roomId: number;
}

export const AVAILABLE_MODES = ['FULL', 'DUAL', 'TTS'] as const;
export const AVAILABLE_YEARS = [
  1970, 1980, 1990, 2000, 2010, 2020, 2021, 2022, 2023, 2024,
] as const;
export const AVAILABLE_ROUNDS = [5, 10, 20, 30] as const;

export type GameMode = (typeof AVAILABLE_MODES)[number];

export type GameFormat = 'BOARD' | 'GENERAL';
