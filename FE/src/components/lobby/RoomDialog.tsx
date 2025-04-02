import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Room } from '@/pages/game/lobby/[channelId]';

const passwordSchema = z.object({
  password: z
    .string()
    .min(1, { message: '비밀번호를 입력해주세요' })
    .max(20, { message: '비밀번호는 최대 20자까지 입력 가능합니다' }),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface RoomDialogProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

// API 응답 타입 정의
interface EnterRoomResponse {
  roomId: string;
  success: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function RoomDialog({ room, isOpen, onClose }: RoomDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 창이 열릴 때마다 에러 메시지와 로딩 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });

  const handleEnterRoom = async (password: string = '') => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/room/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          password: password,
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 오류가 발생했습니다. (${response.status})`);
      }

      const data: EnterRoomResponse = await response.json();

      if (!data.success) {
        throw new Error(
          room.hasPassword
            ? '비밀번호가 틀렸습니다.'
            : '방 입장에 실패했습니다.',
        );
      }

      onClose();

      const currentChannelId = router.query.channelId || '1';
      router.push(`/game/room/${currentChannelId}/${room.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    await handleEnterRoom(values.password);
  };

  const currentStatus = room.status || 'WAITING';
  const isInProgress = currentStatus === 'IN_PROGRESS';

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='bg-opacity-100 w-full rounded-lg border-4 border-white bg-gradient-to-b from-[#9F89EB] to-[#5D42AA] sm:max-w-[450px]'
      >
        {/* 1. DialogTitle */}
        <DialogHeader className='absolute top-[-25px] left-[20px]'>
          <DialogTitle
            className='text-4xl font-bold text-white'
            style={{
              textShadow: `-3px -3px 0 #6548B9, 3px -3px 0 #6548B9, -3px 3px 0 #6548B9, 3px 3px 0 #6548B9`,
            }}
          >
            {isInProgress
              ? '게임 진행 중'
              : room.hasPassword
                ? '비밀번호 입력'
                : '방 입장'}
          </DialogTitle>
        </DialogHeader>

        <div className='text-center'>
          {/* 2. 방의 설명 부분 */}
          <p className='my-8 text-lg text-white'>
            {isInProgress
              ? `게임 중인 방에는 입장하실 수 없습니다.`
              : room.hasPassword
                ? `'${room.title}' 방에 입장하기 위해 비밀번호를 입력해주세요.`
                : `'${room.title}' 방에 입장하시겠습니까?`}
          </p>

          {/* 3. 비밀번호 Form (비밀방인 경우만 표시) */}
          {!isInProgress && room.hasPassword && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPasswordSubmit)}>
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='mb-8 flex'>
                      <FormLabel className='text-white'>비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='방 비밀번호를 입력하세요'
                          autoFocus
                          className='mx-auto max-w-[300px] border-white focus-visible:ring-white'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='text-white' />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {/* 4. 에러 메시지 영역 (방 입장 시에만 표시) */}
          {!isInProgress && error && (
            <div className='mx-auto mt-4 max-w-[300px] rounded border border-red-100 bg-red-50 p-2 text-sm font-medium text-red-500'>
              {error}
            </div>
          )}

          {/* 5. 버튼 영역 */}
          <div className='absolute right-0 flex justify-between px-8'>
            {/* DialogClose 버튼: 게임 진행 중일 때는 '확인', 아니면 '취소' */}
            <DialogClose asChild>
              <button
                type='button'
                className='relative mr-4 flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:opacity-70'
                onClick={e => {
                  onClose();
                  e.stopPropagation();
                }}
              >
                {isInProgress ? '확인' : '취소'}
              </button>
            </DialogClose>

            {/* 방 입장 버튼: 게임 진행 중이 아닐 때만 표시 */}
            {!isInProgress && (
              <button
                type={room.hasPassword ? 'submit' : 'button'}
                disabled={isLoading}
                className='relative flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:opacity-70'
                onClick={
                  room.hasPassword
                    ? form.handleSubmit(onPasswordSubmit)
                    : () => handleEnterRoom()
                }
              >
                {isLoading ? '...' : '입장'}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
