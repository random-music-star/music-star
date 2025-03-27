import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

// 스키마 정의
const signupFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: '사용자명을 입력해주세요.' })
    .max(20, { message: '사용자명은 20글자 이하여야 합니다.' }),
  password: z
    .string()
    .min(1, { message: '비밀번호를 입력해주세요.' })
    .max(30, { message: '비밀번호는 30글자 이하여야 합니다.' }),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

interface SignupFormProps {
  onSuccess?: (username: string) => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 회원가입 폼
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // 회원가입 제출 핸들러
  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);

    try {
      await signUp(data);

      // 성공은 toast로만 표시
      toast.success('회원가입 성공', {
        description: '로그인하여 시작하세요!',
      });

      // 성공 콜백 호출 (username 전달)
      onSuccess?.(data.username);

      // 폼 리셋은 성공 콜백 후에 수행
      form.reset();
    } catch (error) {
      console.error('회원가입 실패:', error);
      // 에러는 콘솔에만 로깅하고 사용자에게는 표시하지 않음

      // 에러 상황에서도 폼 필드 리셋
      form.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 px-4'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel
                className={`flex justify-between text-lg font-bold ${
                  form.formState.errors.username
                    ? 'text-red-400'
                    : 'text-pink-200'
                }`}
              >
                <span className='drop-shadow-md'>닉네임</span>
                <FormMessage className='text-red-400' />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className={`bg-white text-black ${
                    form.formState.errors.username ? 'border-red-400' : ''
                  }`}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='mb-6'>
              <FormLabel
                className={`flex justify-between text-lg font-bold ${
                  form.formState.errors.password
                    ? 'text-red-400'
                    : 'text-amber-400'
                }`}
              >
                <span className='drop-shadow-md'>비밀번호</span>
                <FormMessage className='text-red-400' />
              </FormLabel>
              <FormControl>
                <Input
                  type='password'
                  {...field}
                  className={`bg-white text-black ${
                    form.formState.errors.password ? 'border-red-400' : ''
                  }`}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className='my-8 flex flex-col gap-2 pt-2'>
          <Button
            type='submit'
            disabled={isLoading}
            className='border-[0.5px] border-white bg-[#433c92] shadow-md transition-colors duration-300 ease-in-out hover:bg-[#352f74] disabled:hover:bg-[#433c92]'
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
