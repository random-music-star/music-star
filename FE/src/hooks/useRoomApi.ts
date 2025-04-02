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

    const requestData = formToApiData(
      data,
      mode === 'edit' ? roomId : undefined,
    );

    try {
      if (mode === 'create') {
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

        onSuccess(data, response.data.roomId);
      } else if (mode === 'edit' && roomId) {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/room`,
          requestData,
          {
            headers: {
              Authorization: nickname,
              'Content-Type': 'application/json',
            },
          },
        );
        onSuccess(data, roomId);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    submitForm,
  };
}
