import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { DoorOpen } from 'lucide-react';
import Image from 'next/image';
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
import { Room } from '@/pages/game/lobby';

const passwordSchema = z.object({
  password: z.string().min(1, { message: '비밀번호를 입력해주세요' }),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface RoomItemProps {
  room: Room;
}

// 맵 이미지 및 데이터 정의
const formatMapData = {
  BOARD: {
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    name: '보드판',
    image: '/boardMap.svg',
  },
  GENERAL: {
    className: 'bg-pink-100 text-pink-800 border-pink-200',
    name: '점수판',
    image: '/scoreMap.svg',
  },
};

const modeBadgeVariants: Record<string, string> = {
  '전곡 모드': 'bg-purple-100 text-purple-800 border-purple-200',
  '1초 모드': 'bg-amber-100 text-amber-800 border-amber-200',
  'AI 모드': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FULL: 'bg-purple-100 text-purple-800 border-purple-200',
};

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

const defaultBadgeStyle = 'bg-gray-100 text-gray-800 border-gray-200';

export default function RoomItem({ room }: RoomItemProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isFull = room.currentPlayers >= room.maxPlayer;
  const currentStatus = room.status || 'WAITING';
  const statusDisplay = statusConfig[currentStatus] || statusConfig['WAITING'];
  const formatType = room.format as keyof typeof formatMapData;
  const formatData = formatMapData[formatType] || {
    className: defaultBadgeStyle,
    name: '점수판',
    image: '/scoreMap.svg',
  };

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  });

  const handleRoomClick = () => {
    if (isFull) return;

    if (currentStatus === 'IN_PROGRESS') {
      setError('');
      setIsDialogOpen(true);
      return;
    }

    setError('');
    form.reset();
    setIsDialogOpen(true);
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/rooms/${room.id}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.password }),
      });

      if (!response.ok) {
        throw new Error('비밀번호가 틀렸습니다.');
      }

      setIsDialogOpen(false);
      router.push(`/game/room/${room.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterOpenRoom = () => {
    setIsDialogOpen(false);
    router.push(`/game/room/${room.id}`);
  };

  const usagePercentage = (room.currentPlayers / room.maxPlayer) * 100;

  const getCapacityStyle = () => {
    if (currentStatus === 'IN_PROGRESS') return 'border-green-200';
    if (isFull) return 'border-red-200';
    if (usagePercentage > 75) return 'border-amber-200';
    if (usagePercentage > 50) return 'border-blue-200';
    return 'border-slate-200';
  };

  const formatYearLabel = (years: number[]) => {
    if (!years || years.length === 0) return '모든 연도';

    // Sort years in ascending order
    const sortedYears = [...years].sort((a, b) => a - b);

    if (sortedYears.length === 1) return `${sortedYears[0]}년대`;

    // Group consecutive years
    const ranges: { start: number; end: number }[] = [];
    let currentRange = { start: sortedYears[0], end: sortedYears[0] };

    for (let i = 1; i < sortedYears.length; i++) {
      if (
        sortedYears[i] === sortedYears[i - 1] + 10 ||
        // Special case for consecutive years after 2020
        (sortedYears[i - 1] >= 2020 &&
          sortedYears[i] === sortedYears[i - 1] + 1)
      ) {
        currentRange.end = sortedYears[i];
      } else {
        ranges.push(currentRange);
        currentRange = { start: sortedYears[i], end: sortedYears[i] };
      }
    }
    ranges.push(currentRange);

    // Format the ranges
    return ranges
      .map(range => {
        if (range.start === range.end) {
          return range.start >= 2020
            ? `${range.start}년`
            : `${range.start}년대`;
        } else if (range.start >= 2020) {
          return `${range.start}-${range.end}년`;
        } else {
          return `${range.start}-${range.end}년대`;
        }
      })
      .join(', ');
  };

  return (
    <>
      <Card
        className={`overflow-hidden rounded-none bg-black/70 text-white transition-all duration-200 hover:shadow-md ${getCapacityStyle()} ${
          isFull
            ? 'cursor-not-allowed opacity-70'
            : 'cursor-pointer hover:scale-[1.02]'
        }`}
        onClick={handleRoomClick}
      >
        <CardHeader>
          <CardTitle className='truncate text-lg' title={room.title}>
            <span>
              {room.title.length > 20
                ? `${room.title.slice(0, 20)}...`
                : room.title}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <section>
            {/* 게임 맵 정보 - 이미지가 가로 전체를 차지하도록 변경 */}
            <div>
              <div className='relative overflow-hidden rounded-lg border'>
                {/* 맵 이미지 - 높이 증가 및 가로 전체 차지 */}
                <div className='relative h-36 w-full overflow-hidden'>
                  <Image
                    src={formatData.image}
                    alt={formatData.name}
                    fill
                    sizes='100%'
                    className='h-full object-contain'
                  />
                </div>

                <section className='absolute top-2 flex w-full justify-between px-3'>
                  {/* 좌측 상단: 대기 상태 표시 */}
                  <Badge
                    variant='outline'
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusDisplay.className}`}
                  >
                    {statusDisplay.text}
                  </Badge>

                  {/* 우측 상단: 잠김 유무 표시 */}
                  {room.hasPassword ? (
                    <span className='rounded-full bg-amber-100 p-1.5 text-xs font-bold text-amber-500'>
                      🔒
                    </span>
                  ) : (
                    <span className='rounded-full bg-green-100 p-1.5'>
                      <DoorOpen size={16} className='text-green-500' />
                    </span>
                  )}
                </section>

                {/* 맵 이름 하단에 표시 */}
                <div className='absolute right-0 bottom-0 left-0 bg-black/60 p-1 text-center'>
                  <span className='text-sm font-medium text-white'>
                    {formatData.name}
                  </span>
                </div>

                {/* 음악 년도 정보 - 이미지 위에 추가 */}
                {room.selectedYears && room.selectedYears.length > 0 && (
                  <div className='absolute right-0 bottom-8 left-0 bg-black/40 p-1 text-center'>
                    <span className='text-xs text-gray-200'>
                      {formatYearLabel(room.selectedYears)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className='mt-3'>
            {/* 게임 모드 뱃지 */}
            <div className='flex justify-end'>
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

            {/* 사용자 수 표시 */}
            <div className='mt-2'>
              <div className='mb-1 flex items-center justify-between'>
                <div className='flex items-center text-sm'>
                  <span className='mr-1'>👨‍👩‍👦</span>
                  <span
                    className={
                      isFull ? 'font-medium text-red-600' : 'text-white'
                    }
                  >
                    {room.currentPlayers} / {room.maxPlayer}
                  </span>
                </div>
                <span
                  className={`text-xs ${isFull ? 'text-red-600' : 'text-white'}`}
                >
                  {isFull
                    ? '정원 초과'
                    : usagePercentage > 75
                      ? '거의 찼음'
                      : ''}
                </span>
              </div>

              {/* 사용률 진행 표시줄 */}
              <div className='h-1.5 w-full overflow-hidden rounded-full bg-white'>
                <div
                  className={`h-full rounded-full ${
                    isFull
                      ? 'bg-red-500'
                      : usagePercentage > 75
                        ? 'bg-amber-500'
                        : 'bg-[#905AE5]'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </section>
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
