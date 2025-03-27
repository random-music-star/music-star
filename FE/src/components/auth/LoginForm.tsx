import { useEffect, useState } from 'react';

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

const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: '닉네임을 입력해주세요.' })
    .max(20, { message: '닉네임은 20글자 이하여야 합니다.' }),
  password: z
    .string()
    .min(1, { message: '비밀번호를 입력해주세요.' })
    .max(30, { message: '비밀번호는 30글자 이하여야 합니다.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  initialUsername?: string;
}

export default function LoginForm({
  onSuccess,
  initialUsername,
}: LoginFormProps) {
  const { userLogin, guestLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 폼
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: initialUsername || '',
      password: '',
    },
  });

  // initialUsername이 변경되면 폼 업데이트
  useEffect(() => {
    if (initialUsername) {
      form.setValue('username', initialUsername);
    }
  }, [initialUsername, form]);

  // 로그인 제출 핸들러
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      await userLogin(data);
      form.reset();

      // 성공은 toast로만 표시
      toast.success('로그인 성공', {
        description: '환영합니다!',
      });

      // 성공 콜백 호출
      onSuccess?.();
    } catch (error) {
      console.error('로그인 실패:', error);
      // 에러는 콘솔에만 로깅하고 사용자에게는 표시하지 않음

      // 에러 상황에서도 폼 필드 리셋하지만 username은 유지
      const username = form.getValues('username');
      form.reset({ username, password: '' });
    } finally {
      setIsLoading(false);
    }
  };

  // 게스트 로그인 핸들러
  const handleGuestLogin = async () => {
    setIsLoading(true);

    try {
      await guestLogin();

      // 성공은 toast로만 표시
      toast.success('게스트 로그인', {
        description: '게스트로 로그인했습니다.',
      });

      // 성공 콜백 호출
      onSuccess?.();
    } catch (error) {
      console.error('게스트 로그인 실패:', error);
      // 에러는 콘솔에만 로깅하고 사용자에게는 표시하지 않음
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
                  className={`bg-white ${
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
                  className={`bg-white ${
                    form.formState.errors.password ? 'border-red-400' : ''
                  }`}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className='flex flex-col gap-2 pt-2'>
          <Button
            type='submit'
            disabled={isLoading}
            className='border-[0.5px] border-white bg-[#433c92] shadow-md transition-colors duration-300 ease-in-out hover:bg-[#352f74] disabled:hover:bg-[#433c92]'
          >
            {isLoading ? '로그인 중...' : '회원 로그인'}
          </Button>

          <Button
            type='button'
            variant='outline'
            onClick={handleGuestLogin}
            disabled={isLoading}
            className='border-[0.5px] border-white bg-[#433c92] shadow-md transition-colors duration-300 ease-in-out hover:bg-[#352f74] disabled:hover:bg-[#433c92]'
          >
            비회원 로그인
          </Button>
        </div>
      </form>
    </Form>
  );
}
