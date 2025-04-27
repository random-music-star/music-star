import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { enterRoomAPI } from '@/api/room';
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

export default function RoomDialog({ room, isOpen, onClose }: RoomDialogProps) {
  const router = useRouter();
  const [error, setError] = useState('');

  const currentPlayers = room.currentPlayers ?? 0;
  const maxPlayer = room.maxPlayer ?? 4;
  const isFull = currentPlayers >= maxPlayer;

  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  const resetForm = () => {
    setError('');
    form.reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });

  const handleEnterRoom = async (password: string = '') => {
    const {
      data,
      error: apiResponseError,
      success,
    } = await enterRoomAPI(room.id, password);

    if (!success) {
      toast.error(apiResponseError);
    }

    if (success && !data.success) {
      setError('비밀번호가 틀렸습니다.');
      if (room.hasPassword) {
        form.setError('password', {
          type: 'manual',
          message: '비밀번호가 틀렸습니다.',
        });
        handleClose();
        return;
      }
    }

    const currentChannelId = router.query.channelId || '1';
    router.push(`/game/room/${currentChannelId}/${room.id}`);
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    await handleEnterRoom(values.password);
  };

  const currentStatus = room.status || 'WAITING';
  const isInProgress = currentStatus === 'IN_PROGRESS';

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
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
              ? 'IN PROGRESS'
              : isFull
                ? 'ROOM FULL'
                : room.hasPassword
                  ? 'PASSWORD'
                  : 'JOIN ROOM'}
          </DialogTitle>
        </DialogHeader>

        <div className='text-center'>
          {/* 2. 방의 설명 부분 */}
          <p className='my-8 text-lg text-white'>
            {isInProgress ? (
              `게임 중인 방에는 입장하실 수 없습니다.`
            ) : isFull ? (
              `정원이 가득 찬 방에는 입장하실 수 없습니다.`
            ) : room.hasPassword ? (
              <>
                {`'${room.title}' 방의 `}
                {room.title.length > 6 && <br />}
                {`비밀번호를 입력해주세요.`}
              </>
            ) : (
              <>
                {`'${room.title}' 방에 `}
                {room.title.length > 6 && <br />}
                {`입장하시겠습니까?`}
              </>
            )}
          </p>

          {/* 3. 비밀번호 Form (비밀방인 경우만 표시) */}
          {!isInProgress && !isFull && room.hasPassword && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPasswordSubmit)}>
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='mb-8'>
                      <div className='flex justify-between'>
                        <FormLabel className='mb-2 text-white'>
                          비밀번호
                        </FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='방 비밀번호를 입력하세요'
                          autoFocus
                          className='mx-auto w-full border-white text-purple-200 placeholder:text-purple-200 focus-visible:ring-white'
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {!isInProgress &&
            !isFull &&
            error &&
            !form.formState.errors.password && (
              <div className='mx-auto mt-4 w-full rounded border p-2 text-sm font-medium text-red-500'>
                {error}
              </div>
            )}

          {/* 5. 버튼 영역 */}
          <div className='absolute right-0 flex flex-row-reverse justify-between px-8'>
            {/* 방 입장 버튼: 게임 진행 중이 아닐 때만 표시 */}
            {!isInProgress && !isFull && (
              <button
                type={room.hasPassword ? 'submit' : 'button'}
                className='relative flex h-[60px] w-[60px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:opacity-70'
                onClick={
                  room.hasPassword
                    ? form.handleSubmit(onPasswordSubmit)
                    : () => handleEnterRoom()
                }
              >
                입장
              </button>
            )}
            {/* DialogClose 버튼: 게임 진행 중일 때는 '확인', 아니면 '취소' */}
            <DialogClose asChild>
              <button
                type='button'
                className='relative mr-4 flex h-[60px] w-[60px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:opacity-70'
                onClick={e => {
                  handleClose();
                  e.stopPropagation();
                }}
              >
                {isInProgress || isFull ? '확인' : '취소'}
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
