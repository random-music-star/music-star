import { useState } from 'react';

import { formToApiData } from '@/components/room/utils/roomDataConverter';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

import type { RoomFormValues } from './useRoomForm';

interface UseRoomApiProps {
  mode: 'create' | 'edit';
  roomId?: string;
  onSuccess: (data: RoomFormValues, roomId?: string) => void;
}

export function useRoomApi({ mode, roomId, onSuccess }: UseRoomApiProps) {
  // 로딩 상태 관리
  const [loading, setLoading] = useState(false);
  // 에러 상태 관리
  const [error, setError] = useState<Error | null>(null);
  const { nickname } = useNicknameStore();

  const submitForm = async (data: RoomFormValues) => {
    setLoading(true);
    setError(null);

    const requestData = formToApiData(
      data,
      mode === 'edit' ? roomId : undefined,
    );

    const headers = {
      Authorization: nickname,
      'Content-Type': 'application/json',
    };

    try {
      let success = false;

      try {
        if (mode === 'create') {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify(requestData),
            },
          );

          if (!response.ok) {
            setError(new Error('방 생성에 실패했습니다.'));
          } else {
            const responseData = await response.json();
            onSuccess(data, responseData.roomId);
            success = true;
          }
        } else if (mode === 'edit' && roomId) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
            {
              method: 'PATCH',
              headers,
              body: JSON.stringify(requestData),
            },
          );

          if (!response.ok) {
            setError(new Error('방 수정에 실패했습니다.'));
          } else {
            onSuccess(data, roomId);
            success = true;
          }
        }
      } catch {
        setError(new Error('요청 처리 중 오류가 발생했습니다.'));
      }

      return success;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitForm,
  };
}
