import * as z from 'zod';

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

export const createRoomFormSchema = z
  .object({
    title: z.string().min(1, '방 이름을 설정해주세요'),
    format: z.string().min(1, '맵을 선택해주세요'),
    modes: z.array(z.string()).min(1, '모드를 선택해주세요'),
    years: z.array(z.number()).min(1, '연도를 선택해주세요'),
    hasPassword: z.boolean().default(false),
    password: z.string(),
    maxGameRound: z.number().refine(value => [10, 20, 30].includes(value), {
      message: '라운드는 10, 20, 30 중 하나를 선택해주세요',
    }),
    maxPlayer: z.number(),
  })
  .superRefine((data, ctx) => {
    // 비밀번호 검증
    if (data.hasPassword && data.password.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '비밀번호를 입력해주세요',
        path: ['password'],
      });
    }

    // maxPlayer 검증
    if (data.format === 'BOARD') {
      if (data.maxPlayer < 2 || data.maxPlayer > 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '보드판 게임은 2~6인만 설정 가능합니다',
          path: ['maxPlayer'],
        });
      }
    } else {
      if (data.maxPlayer < 2 || data.maxPlayer > 60) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '점수판 게임은 2~60인만 설정 가능합니다',
          path: ['maxPlayer'],
        });
      }
    }
  });

export type RoomFormValues = z.infer<typeof createRoomFormSchema>;

export const AVAILABLE_MODES = ['FULL', 'DUAL', 'TTS'] as const;
export const AVAILABLE_YEARS = [
  1970, 1980, 1990, 2000, 2010, 2020, 2021, 2022, 2023, 2024,
] as const;
export const AVAILABLE_ROUNDS = [10, 20, 30] as const;

export type GameMode = (typeof AVAILABLE_MODES)[number];

export type GameFormat = 'BOARD' | 'GENERAL';
