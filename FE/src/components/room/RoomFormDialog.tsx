import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { RoomFormValues } from '@/types/rooms';

import RoomForm from './RoomForm';

interface RoomFormDialogProps {
  mode: 'create' | 'edit';
  roomId?: string;
  buttonText?: string;
  buttonClassName?: string;
  onDialogClose?: () => void;
}

interface InitialDataType {
  roomTitle?: string;
  format?: 'GENERAL' | 'BOARD';
  mode?: ('FULL' | 'DOUBLE' | 'AI')[];
  selectedYear?: number[];
  hasPassword?: boolean;
  maxGameRound?: number;
  maxPlayer?: number;
}

export default function RoomFormDialog({
  mode,
  roomId,
  buttonText,
  buttonClassName = 'bg-[#9FFCFE] text-black hover:bg-opacity-80 rounded-full px-6',
  onDialogClose,
}: RoomFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { gameRoomInfo } = useGameInfoStore();
  const router = useRouter();

  // 초기 데이터를 저장할 ref
  const initialDataRef = useRef<InitialDataType | null>(null);

  useEffect(() => {
    if (isOpen && mode === 'edit' && gameRoomInfo && !initialDataRef.current) {
      initialDataRef.current = {
        roomTitle: gameRoomInfo.roomTitle,
        format: gameRoomInfo.format,
        mode: gameRoomInfo.mode,
        selectedYear: gameRoomInfo.selectedYear,
        hasPassword: gameRoomInfo.hasPassword,
        maxGameRound: gameRoomInfo.maxGameRound, // 추가됨
        maxPlayer: gameRoomInfo.maxPlayer, // 추가됨
      };
    }
  }, [isOpen, mode, gameRoomInfo]);

  // 방 생성 또는 수정 성공 핸들러
  const handleSuccess = (_data: RoomFormValues, newRoomId?: string) => {
    if (mode === 'create') {
      router.push(`/game/room/${newRoomId}`);
    } else if (mode === 'edit') {
      // 방 정보는 소켓 연결을 통해 자동으로 업데이트될 거라 없음
    }
    setIsOpen(false);
    initialDataRef.current = null;

    if (onDialogClose) {
      onDialogClose();
    }
  };

  // 다이얼로그 상태 변경 핸들러
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      initialDataRef.current = null;
    }

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
        <DialogContent
          showCloseButton={false}
          className='bg-opacity-100 w-full rounded-lg border-4 border-white bg-gradient-to-b from-[#9F89EB] to-[#5D42AA] sm:max-w-[60vw] lg:max-w-[850px]'
        >
          <DialogHeader className='absolute top-[-25px] left-[20px]'>
            <DialogTitle
              className='text-4xl font-bold text-white'
              style={{
                textShadow: `-3px -3px 0 #6548B9, 3px -3px 0 #6548B9, -3px 3px 0 #6548B9, 3px 3px 0 #6548B9`,
              }}
            >
              {mode === 'create' ? 'NEW GAME' : 'EDIT GAME'}
            </DialogTitle>
          </DialogHeader>
          <RoomForm
            mode={mode}
            roomId={roomId}
            initialData={
              initialDataRef.current ||
              (mode === 'edit' && gameRoomInfo
                ? {
                    roomTitle: gameRoomInfo.roomTitle,
                    format: gameRoomInfo.format,
                    mode: gameRoomInfo.mode,
                    selectedYear: gameRoomInfo.selectedYear,
                    hasPassword: gameRoomInfo.hasPassword,
                  }
                : undefined)
            }
            onSuccess={handleSuccess}
            onCancel={() => handleOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
