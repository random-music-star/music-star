import * as z from 'zod';

// API 요청 및 응답 타입 정의
export interface CreateRoomRequest {
  title: string;
  password: string;
  format: string;
  gameModes: string[];
  selectedYears: number[];
}

export interface CreateRoomResponse {
  roomId: number;
}

export const createRoomFormSchema = z.object({
  title: z.string().min(1, '방 이름을 설정해주세요'),
  format: z.string().min(1, '포맷을 선택해주세요'),
  modes: z.array(z.string()).min(1, '모드는 최소 한 개 이상 선택해야 합니다'),
  years: z.array(z.number()).min(1, '연도는 최소 한 개 이상 선택해야 합니다'),
});

export type CreateRoomFormValues = z.infer<typeof createRoomFormSchema>;

export const AVAILABLE_MODES = ['FULL'] as const;
export const AVAILABLE_YEARS = [2020, 2021] as const;

export type GameMode = (typeof AVAILABLE_MODES)[number];

export type GameFormat = 'BOARD' | 'GENERAL';
