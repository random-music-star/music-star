import { useState } from 'react';

import axios from 'axios';

import { formToApiData } from '@/components/room/utils/roomDataConverter';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

import type { RoomFormValues } from './useRoomForm';

interface UseRoomApiProps {
  mode: 'create' | 'edit';
  roomId?: string;
  onSuccess: (data: RoomFormValues, roomId?: string) => void;
}

export function useRoomApi({ mode, roomId, onSuccess }: UseRoomApiProps) {
  const [loading, setLoading] = useState(false);
  const { nickname } = useNicknameStore();

  const submitForm = async (data: RoomFormValues) => {
    setLoading(true);
    console.log('폼 제출 데이터:', data);

    const requestData = formToApiData(
      data,
      mode === 'edit' ? roomId : undefined,
    );

    try {
      if (mode === 'create') {
        console.log('방 생성 요청 전송:', {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
          데이터: requestData,
        });

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
          requestData,
          {
            headers: {
              Authorization: nickname,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('방 생성 응답 결과:', response.data);
        onSuccess(data, response.data.roomId);
      } else if (mode === 'edit' && roomId) {
        console.log('방 수정 요청 전송:', {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
          방식: 'PATCH',
          데이터: requestData,
        });

        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
          requestData,
          {
            headers: {
              Authorization: nickname,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('방 수정 응답 코드:', response.status);
        console.log('방 수정 응답 결과:', response.data);

        // 웹소켓을 통해 서버에서 업데이트된 방 정보 전달 받아 방 정보 수정될 예정

        onSuccess(data, roomId);
      }
    } catch (error) {
      console.error('API 오류:', error);
      if (axios.isAxiosError(error)) {
        console.log('API 오류 상세 정보:', {
          상태: error.response?.status,
          응답데이터: error.response?.data,
          요청설정: error.config,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitForm,
  };
}
