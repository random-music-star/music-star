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

export const createRoomFormSchema = z
  .object({
    title: z.string().min(1, '방 이름을 설정해주세요'),
    format: z.string().min(1, '맵을 선택해주세요'),
    modes: z.array(z.string()).min(1, '모드를 선택해주세요'),
    years: z.array(z.number()).min(1, '연도를 선택해주세요'),
    hasPassword: z.boolean().default(false),
    password: z.string(),
  })
  .refine(
    data => {
      return (
        !data.hasPassword || (data.hasPassword && data.password.length > 0)
      );
    },
    {
      message: '비밀번호를 입력해주세요',
      path: ['hasPassword'],
    },
  );

export type RoomFormValues = z.infer<typeof createRoomFormSchema>;

export const AVAILABLE_MODES = ['FULL', 'DOUBLE', 'AI'] as const;
export const AVAILABLE_YEARS = [
  1970, 1980, 1990, 2000, 2010, 2020, 2021, 2022, 2023, 2024,
] as const;

export type GameMode = (typeof AVAILABLE_MODES)[number];

export type GameFormat = 'BOARD' | 'GENERAL';
