import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Room } from '@/pages/lobby';

// 비밀번호 검증 스키마
const passwordSchema = z.object({
  password: z.string().min(1, { message: '비밀번호를 입력해주세요' }),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface RoomItemProps {
  room: Room;
}

// 게임 모드별 뱃지 색상 매핑
const modeBadgeVariants: Record<string, string> = {
  '전곡 모드': 'bg-purple-100 text-purple-800 border-purple-200',
  '1초 모드': 'bg-amber-100 text-amber-800 border-amber-200',
  'AI 모드': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

// 상태별 뱃지 색상 및 텍스트 매핑
const statusConfig: Record<string, { className: string; text: string }> = {
  WAITING: {
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    text: '대기 중',
  },
  IN_PROGRESS: {
    className: 'bg-green-100 text-green-800 border-green-200',
    text: '게임 중',
  },
};

// 기본 뱃지 스타일
const defaultBadgeStyle = 'bg-gray-100 text-gray-800 border-gray-200';

export default function RoomItem({ room }: RoomItemProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 방이 가득 찼는지 확인
  const isFull = room.currentPlayers >= room.maxPlayer;

  // 현재 방 상태 (기본값 'WAITING')
  const currentStatus = room.status || 'WAITING';

  // 방 상태에 따른 설정 가져오기
  const statusDisplay = statusConfig[currentStatus] || statusConfig['WAITING'];

  // React Hook Form 설정
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });

  // 방 클릭 핸들러
  const handleRoomClick = () => {
    if (isFull) return; // 가득 찬 방은 클릭 무시

    // 게임 중인 방인 경우
    if (currentStatus === 'IN_PROGRESS') {
      setError(''); // 에러 메시지 초기화
      setIsDialogOpen(true); // 게임 중이라고 알려주는 다이얼로그만 표시
      return;
    }

    setError(''); // 에러 메시지 초기화
    form.reset(); // 폼 초기화
    setIsDialogOpen(true);
  };

  // 방 입장 처리 핸들러 (비밀번호가 있는 방)
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      // 비밀번호 확인 API 호출
      const response = await fetch(`/api/rooms/${room.id}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.password }),
      });

      if (!response.ok) {
        throw new Error('비밀번호가 틀렸습니다.');
      }

      // 다이얼로그 닫기
      setIsDialogOpen(false);
      // 해당 방 라우트로 이동
      router.push(`/game-room/${room.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 방 입장 처리 핸들러 (열린 방) - API 호출 없이 바로 라우팅
  const handleEnterOpenRoom = () => {
    // 다이얼로그 닫기
    setIsDialogOpen(false);
    // 해당 방 라우트로 직접 이동
    router.push(`/game-room/${room.id}`);
  };

  // 사용률 계산 (시각적 표현용)
  const usagePercentage = (room.currentPlayers / room.maxPlayer) * 100;

  // 상태와 사용률에 따른 배경색 스타일
  const getCapacityStyle = () => {
    // 게임 중인 방에 다른 스타일 적용
    if (currentStatus === 'IN_PROGRESS') return 'bg-green-50 border-green-200';

    // 대기 중인 방은 기존 로직 적용
    if (isFull) return 'bg-red-50 border-red-200';
    if (usagePercentage > 75) return 'bg-amber-50 border-amber-200';
    if (usagePercentage > 50) return 'bg-blue-50 border-blue-200';
    return 'bg-white border-slate-200';
  };

  return (
    <>
      <Card
        className={`overflow-hidden transition-all duration-200 hover:shadow-md ${getCapacityStyle()} ${
          isFull
            ? 'cursor-not-allowed opacity-70'
            : 'cursor-pointer hover:scale-[1.02]'
        }`}
        onClick={handleRoomClick}
      >
        <CardHeader className='flex flex-row items-start justify-between p-4 pb-2'>
          <div className='flex-1'>
            <CardTitle className='truncate text-lg' title={room.title}>
              {room.title}
            </CardTitle>
            <div className='text-muted-foreground text-sm'>
              방 번호 {room.id}
            </div>
          </div>
          <div className='ml-2 flex items-center space-x-2'>
            {/* 상태 뱃지 추가 */}
            <Badge
              variant='outline'
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusDisplay.className}`}
            >
              {statusDisplay.text}
            </Badge>

            {room.hasPassword && (
              <div className='flex items-center'>
                <span className='text-xs font-bold text-amber-500'>🔒</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className='p-4 pt-2'>
          {/* 사용자 수 표시 */}
          <div className='mb-3'>
            <div className='mb-1 flex items-center justify-between'>
              <div className='flex items-center text-sm'>
                <span className='mr-1'>👥</span>
                <span
                  className={
                    isFull ? 'font-medium text-red-600' : 'text-slate-600'
                  }
                >
                  {room.currentPlayers} / {room.maxPlayer}
                </span>
              </div>
              <span
                className={`text-xs ${isFull ? 'text-red-600' : 'text-slate-500'}`}
              >
                {isFull ? '정원 초과' : usagePercentage > 75 ? '거의 찼음' : ''}
              </span>
            </div>

            {/* 사용률 진행 표시줄 */}
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-200'>
              <div
                className={`h-full rounded-full ${
                  isFull
                    ? 'bg-red-500'
                    : usagePercentage > 75
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          {/* 게임 모드 뱃지 */}
          <div className='mt-2'>
            <div className='flex flex-wrap gap-1.5'>
              {room.gameModes &&
                Array.isArray(room.gameModes) &&
                room.gameModes.map(mode => (
                  <Badge
                    key={mode}
                    variant='outline'
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${modeBadgeVariants[mode] || defaultBadgeStyle}`}
                  >
                    {mode}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 방 입장 다이얼로그 */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={open => !open && setIsDialogOpen(false)}
      >
        <DialogContent className='sm:max-w-[400px]'>
          <DialogHeader>
            <DialogTitle
              className={
                currentStatus === 'IN_PROGRESS'
                  ? 'text-green-600'
                  : room.hasPassword
                    ? 'text-amber-600'
                    : 'text-blue-600'
              }
            >
              {currentStatus === 'IN_PROGRESS' ? (
                <div className='flex items-center'>게임 진행 중</div>
              ) : room.hasPassword ? (
                <div className='flex items-center'>비밀번호 입력</div>
              ) : (
                '방 입장'
              )}
            </DialogTitle>
            <DialogDescription>
              {currentStatus === 'IN_PROGRESS'
                ? `'${room.title}' 방은 현재 게임이 진행 중입니다. 게임이 끝날 때까지 입장할 수 없습니다.`
                : room.hasPassword
                  ? `'${room.title}' 방에 입장하기 위해 비밀번호를 입력해주세요.`
                  : `'${room.title}' 방에 입장하시겠습니까?`}
            </DialogDescription>
          </DialogHeader>

          {currentStatus === 'IN_PROGRESS' ? (
            // 게임 진행 중일 때는 확인 버튼만 표시
            <DialogFooter className='pt-4'>
              <Button variant='outline' onClick={() => setIsDialogOpen(false)}>
                확인
              </Button>
            </DialogFooter>
          ) : room.hasPassword ? (
            // 비밀번호가 있는 방
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onPasswordSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='방 비밀번호를 입력하세요'
                          autoFocus
                          className='focus-visible:ring-amber-500'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 오류 메시지 표시 영역 */}
                {error && (
                  <div className='rounded border border-red-100 bg-red-50 p-2 text-sm font-medium text-red-500'>
                    {error}
                  </div>
                )}

                <DialogFooter className='pt-2'>
                  <Button
                    variant='outline'
                    type='button'
                    onClick={() => setIsDialogOpen(false)}
                  >
                    취소
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading}
                    className={`bg-amber-600 text-white hover:bg-amber-700 ${isLoading ? 'opacity-70' : ''}`}
                  >
                    {isLoading ? '처리 중...' : '입장'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            // 일반 방
            <>
              {/* 오류 메시지 표시 영역 (열린 방) */}
              {error && (
                <div className='mt-2 mb-4 rounded border border-red-100 bg-red-50 p-2 text-sm font-medium text-red-500'>
                  {error}
                </div>
              )}

              <DialogFooter className='pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                >
                  취소
                </Button>
                <Button
                  onClick={handleEnterOpenRoom}
                  className='bg-blue-600 text-white hover:bg-blue-700'
                >
                  입장
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
