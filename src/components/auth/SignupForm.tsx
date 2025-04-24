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
import { useSignupForm } from '@/hooks/useSignupForm';

interface SignupFormProps {
  onSuccess?: (username: string) => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { form, isLoading, onSubmit } = useSignupForm({
    onSuccess,
  });

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

        <div className='flex flex-col gap-2 pt-2'>
          <Button
            type='submit'
            disabled={isLoading}
            className='cursor-pointer rounded-3xl bg-gradient-to-b from-[#5a4ca1] to-[#352f74] px-2 py-5 text-white shadow-md shadow-white/10 transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:from-[#4a4586] disabled:opacity-50'
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
