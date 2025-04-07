import * as z from 'zod';

// 로그인 폼 스키마마
export const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: '닉네임을 입력해주세요.' })
    .max(20, { message: '닉네임은 20글자 이하여야 합니다.' }),
  password: z
    .string()
    .min(1, { message: '비밀번호를 입력해주세요.' })
    .max(30, { message: '비밀번호는 30글자 이하여야 합니다.' }),
});

// 회원가입 폼 스키마
export const signupFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: '사용자명을 입력해주세요.' })
    .max(20, { message: '사용자명은 20글자 이하여야 합니다.' })
    .refine(value => value.trim().length > 0, {
      message: '공백만으로는 사용자명을 만들 수 없습니다.',
    })
    .refine(value => /^[a-zA-Z0-9_-]+$/.test(value), {
      message: '영문, 숫자, 밑줄(_) 및 하이픈(-)만 포함할 수 있습니다.',
    }),
  password: z
    .string()
    .min(1, { message: '비밀번호를 입력해주세요.' })
    .max(30, { message: '비밀번호는 30글자 이하여야 합니다.' })
    .refine(value => value.trim().length > 0, {
      message: '공백만으로는 비밀번호를 만들 수 없습니다.',
    })
    .refine(value => !/\s/.test(value), {
      message: '비밀번호에는 공백을 포함할 수 없습니다.',
    }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type SignupFormValues = z.infer<typeof signupFormSchema>;
