import { useState } from 'react';

import { createRoomAPI, patchRoomAPI } from '@/api/room';
import { formToApiData } from '@/components/room/utils/roomDataConverter';

import type { RoomFormValues } from './useRoomForm';

interface UseRoomApiProps {
  mode: 'create' | 'edit';
  roomId?: string;
  onSuccess: (data: RoomFormValues, roomId?: string) => void;
}

export function useRoomApi({ mode, roomId, onSuccess }: UseRoomApiProps) {
  const [error, setError] = useState<Error | null>(null);

  const submitForm = async (data: RoomFormValues) => {
    setError(null);

    const requestData = formToApiData(
      data,
      mode === 'edit' ? roomId : undefined,
    );

    if (mode === 'edit') {
      const {
        data: responseData,
        success,
        error,
      } = await patchRoomAPI(requestData);
      if (success) {
        onSuccess(data, responseData.roomId);
      } else {
        setError(new Error(error));
      }

      return success;
    }

    if (mode === 'create') {
      const {
        data: responseData,
        success,
        error,
      } = await createRoomAPI(requestData);
      if (success) {
        onSuccess(data, responseData.roomId);
      } else {
        setError(new Error(error));
      }

      return success;
    }
  };

  return { error, submitForm };
}
