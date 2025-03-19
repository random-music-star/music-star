import { useState } from 'react';

import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { CreateRoomFormValues } from '@/types/rooms';

import RoomForm from './RoomForm';

interface RoomFormDialogProps {
  mode: 'create' | 'edit';
  roomId?: string;
  buttonText?: string;
  buttonClassName?: string;
  onDialogClose?: () => void;
}

export default function RoomFormDialog({
  mode,
  roomId,
  buttonText,
  buttonClassName = 'bg-blue-600 text-white hover:bg-blue-700',
  onDialogClose,
}: RoomFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { gameRoomInfo } = useGameInfoStore();
  const router = useRouter();

  // 방 생성 또는 수정 성공 핸들러
  const handleSuccess = (_data: CreateRoomFormValues, newRoomId?: string) => {
    if (mode === 'create') {
      router.push(`/game-room/${newRoomId}`);
    } else if (mode === 'edit') {
      // 방 정보는 소켓 연결을 통해 자동으로 업데이트될 거라 없음
    }
    setIsOpen(false);
    if (onDialogClose) {
      onDialogClose();
    }
  };

  // 다이얼로그 상태 변경 핸들러
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onDialogClose) {
      onDialogClose();
    }
  };

  const defaultButtonText = mode === 'create' ? '방 생성' : '방 정보 수정';

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className={buttonClassName}>
        {buttonText || defaultButtonText}
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? '새로운 게임방 생성' : '게임방 정보 수정'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? '게임할 방의 정보를 입력해주세요.'
                : '방 정보를 수정해주세요.'}
            </DialogDescription>
          </DialogHeader>
          <RoomForm
            mode={mode}
            roomId={roomId}
            initialData={
              mode === 'edit' && gameRoomInfo
                ? {
                    roomTitle: gameRoomInfo.roomTitle,
                    format: gameRoomInfo.format,
                    mode: gameRoomInfo.mode,
                    selectedYear: gameRoomInfo.selectedYear,
                    hasPassword: gameRoomInfo.hasPassword,
                  }
                : undefined
            }
            onSuccess={handleSuccess}
            onCancel={() => handleOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
