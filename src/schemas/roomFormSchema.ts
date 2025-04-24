import * as z from 'zod';

export const createRoomFormSchema = z
  .object({
    title: z
      .string()
      .min(1, '방 이름을 설정해주세요')
      .max(15, '방 이름은 15글자 미만이어야 합니다'),
    format: z.string().min(1, '맵을 선택해주세요'),
    modes: z.array(z.string()).min(1, '모드를 선택해주세요'),
    years: z.array(z.number()).min(1, '연도를 선택해주세요'),
    hasPassword: z.boolean().default(false),
    password: z.string(),
    maxGameRound: z.number().refine(value => [5, 10, 20, 30].includes(value), {
      message: '라운드는 5, 10, 20, 30 중 하나를 선택해주세요',
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
