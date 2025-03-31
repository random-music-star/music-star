import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { createRoomFormSchema } from '@/types/rooms';
import { Mode } from '@/types/websocket';

// Zod 스키마로부터 타입 추론
export type RoomFormValues = z.infer<typeof createRoomFormSchema>;

interface UseRoomFormProps {
  initialData?: {
    roomTitle?: string;
    format?: 'GENERAL' | 'BOARD';
    mode?: Mode[];
    selectedYear?: number[];
    hasPassword?: boolean;
  };
}

export function useRoomForm({ initialData }: UseRoomFormProps = {}) {
  // React Hook Form 설정
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(createRoomFormSchema),
    defaultValues: {
      title: '',
      format: 'BOARD',
      modes: ['FULL'],
      years: [],
      hasPassword: false,
      password: '',
    },
  });

  // 초기 데이터가 있을 경우 폼에 설정
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.roomTitle || '',
        format: initialData.format || 'BOARD',
        modes: initialData.mode?.map(m => m) || [],
        years: initialData.selectedYear || [],
        hasPassword: initialData.hasPassword || false,
        password: '',
      });
    }
  }, [initialData, form]);

  // 폼 상태 가져오기
  const selectedModes = form.watch('modes');
  const selectedYears = form.watch('years');
  const hasPassword = form.watch('hasPassword');

  // 비밀번호 필드 값이 변경될 때마다 유효성 검사 실행
  useEffect(() => {
    if (hasPassword) {
      form.trigger('password');
    }
  }, [hasPassword, form]);

  return {
    form,
    selectedModes,
    selectedYears,
    hasPassword,
  };
}
