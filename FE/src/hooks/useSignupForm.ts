import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/hooks/useAuth';
import { SignupFormValues, signupFormSchema } from '@/schemas/authSchemas';

interface UseSignupFormProps {
  onSuccess?: (username: string) => void;
}

export function useSignupForm({ onSuccess }: UseSignupFormProps) {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);

    try {
      const result = await signUp(data);
      if (result) {
        form.reset();
        onSuccess?.(data.username);
      }
    } catch {
      // 에러는 useAuth 내부에서 toast로 처리됨
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    onSubmit,
  };
}
