import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/hooks/useAuth';
import { LoginFormValues, loginFormSchema } from '@/schemas/authSchemas';

interface UseLoginFormProps {
  onSuccess?: () => void;
  initialUsername?: string;
}

export function useLoginForm({
  onSuccess,
  initialUsername,
}: UseLoginFormProps) {
  const { userLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: initialUsername || '',
      password: '',
    },
  });

  useEffect(() => {
    if (initialUsername) {
      form.setValue('username', initialUsername);
    }
  }, [initialUsername, form]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      await userLogin(data);
      form.reset();
      onSuccess?.();
    } catch {
      const username = form.getValues('username');
      form.reset({ username, password: '' });
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
