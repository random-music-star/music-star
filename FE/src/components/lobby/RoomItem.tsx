import { useState } from 'react';
import { useRouter } from 'next/router';
import { Room } from '@/pages/lobby';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LockIcon, Users } from 'lucide-react';

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

// 기본 뱃지 스타일
const defaultBadgeStyle = 'bg-gray-100 text-gray-800 border-gray-200';

export default function RoomItem({ room }: RoomItemProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 방이 가득 찼는지 확인
  const isFull = room.currentPlayers >= room.maxPlayer;

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
      router.push(`/game-room?roomId=${room.id}`);
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
    router.push(`/game-room?roomId=${room.id}`);
  };

  // 사용률 계산 (시각적 표현용)
  const usagePercentage = (room.currentPlayers / room.maxPlayer) * 100;

  // 사용률에 따른 배경색 스타일
  const getCapacityStyle = () => {
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
            ? 'opacity-70 cursor-not-allowed'
            : 'cursor-pointer hover:scale-[1.02]'
        }`}
        onClick={handleRoomClick}
      >
        <CardHeader className='p-4 pb-2 flex flex-row justify-between items-start'>
          <div className='flex-1'>
            <CardTitle className='text-lg truncate' title={room.title}>
              {room.title}
            </CardTitle>
            <div className='text-sm text-muted-foreground'>
              방 번호 {room.id}
            </div>
          </div>
          {room.hasPassword && (
            <div className='flex items-center ml-2'>
              <LockIcon size={16} className='text-amber-500' />
            </div>
          )}
        </CardHeader>

        <CardContent className='p-4 pt-2'>
          {/* 사용자 수 표시 */}
          <div className='mb-3'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center text-sm'>
                <Users size={14} className='mr-1' />
                <span
                  className={
                    isFull ? 'text-red-600 font-medium' : 'text-slate-600'
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
            <div className='w-full bg-gray-200 rounded-full h-1.5 overflow-hidden'>
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
                    className={`text-xs border rounded-full px-2 py-0.5 font-medium ${modeBadgeVariants[mode] || defaultBadgeStyle}`}
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
              className={room.hasPassword ? 'text-amber-600' : 'text-blue-600'}
            >
              {room.hasPassword ? (
                <div className='flex items-center'>
                  <LockIcon size={18} className='mr-2' />
                  비밀번호 입력
                </div>
              ) : (
                '방 입장'
              )}
            </DialogTitle>
            <DialogDescription>
              {room.hasPassword
                ? `'${room.title}' 방에 입장하기 위해 비밀번호를 입력해주세요.`
                : `'${room.title}' 방에 입장하시겠습니까?`}
            </DialogDescription>
          </DialogHeader>

          {room.hasPassword ? (
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
                  <div className='text-sm font-medium text-red-500 bg-red-50 p-2 rounded border border-red-100'>
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
                    className={`bg-amber-600 hover:bg-amber-700 text-white ${isLoading ? 'opacity-70' : ''}`}
                  >
                    {isLoading ? '처리 중...' : '입장'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <>
              {/* 오류 메시지 표시 영역 (열린 방) */}
              {error && (
                <div className='text-sm font-medium text-red-500 bg-red-50 p-2 rounded border border-red-100 mt-2 mb-4'>
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
                  className='bg-blue-600 hover:bg-blue-700 text-white'
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
