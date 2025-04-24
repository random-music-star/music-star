import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { createRoomFormSchema } from '@/schemas/roomFormSchema';
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
    maxGameRound?: number;
    maxPlayer?: number;
  };
}

export function useRoomForm({ initialData }: UseRoomFormProps = {}) {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(createRoomFormSchema),
    defaultValues: {
      title: '',
      format: 'BOARD',
      modes: ['FULL'],
      years: [],
      hasPassword: false,
      password: '',
      maxGameRound: 10,
      maxPlayer: 6, // BOARD 형식의 최대값으로 설정
    },
  });

  // 초기 데이터가 있을 경우 폼에 설정
  useEffect(() => {
    if (initialData) {
      // 초기 format에 맞게 maxPlayer 설정
      const format = initialData.format || 'BOARD';
      // 초기 데이터에 maxPlayer가 없을 경우, 형식에 따라 최대값 설정
      const maxPlayerValue =
        initialData.maxPlayer || (format === 'BOARD' ? 6 : 60);

      form.reset({
        title: initialData.roomTitle || '',
        format: format,
        modes: initialData.mode?.map(m => m) || [],
        years: initialData.selectedYear || [],
        hasPassword: initialData.hasPassword || false,
        password: '',
        maxGameRound: initialData.maxGameRound || 10,
        maxPlayer: maxPlayerValue,
      });
    }
  }, [initialData, form]);

  // 폼 상태 가져오기
  const selectedModes = form.watch('modes');
  const selectedYears = form.watch('years');
  const hasPassword = form.watch('hasPassword');
  const selectedFormat = form.watch('format');

  // 비밀번호 필드 값이 변경될 때마다 유효성 검사 실행
  useEffect(() => {
    if (hasPassword) {
      form.trigger('password');
    }
  }, [hasPassword, form]);

  // 게임 형식이 변경될 때 maxPlayer 변경
  useEffect(() => {
    const currentValue = form.getValues('maxPlayer');

    // 형식이 변경되었을 때 최대값으로 설정
    if (selectedFormat === 'BOARD') {
      if (currentValue > 6) {
        form.setValue('maxPlayer', 6);
      }
    } else if (selectedFormat === 'GENERAL') {
      // GENERAL로 변경 시 최대값 60으로 설정 (이전 값이 작다면)
      if (currentValue <= 6) {
        form.setValue('maxPlayer', 60);
      }
    }

    form.trigger('maxPlayer');
  }, [selectedFormat, form]);

  return {
    form,
    selectedModes,
    selectedYears,
    hasPassword,
    selectedFormat,
  };
}
