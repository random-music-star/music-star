import { useState } from 'react';

import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Room } from '@/pages/game/lobby/[channelId]';

import RoomDialog from './RoomDialog';

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

// 게임 모드 매핑
const gameModeLabels: Record<string, string> = {
  FULL: '전곡',
  '1SEC': '1초',
  AI: 'AI',
};

// 게임 모드 배지 스타일
const modeBadgeVariants: Record<string, string> = {
  FULL: 'bg-purple-100 text-purple-800 border-purple-200',
  '1SEC': 'bg-amber-100 text-amber-800 border-amber-200',
  AI: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isFull = room.currentPlayers >= room.maxPlayer;
  const currentStatus = room.status || 'WAITING';
  const statusDisplay = statusConfig[currentStatus] || statusConfig['WAITING'];
  const formatType = room.format as keyof typeof formatMapData;
  const formatData = formatMapData[formatType] || {
    className: defaultBadgeStyle,
    name: '점수판',
    image: '/scoreMap.svg',
  };

  // 방 클릭 처리
  const handleRoomClick = () => {
    if (isFull) return;

    setIsDialogOpen(true);
  };

  // 년도 정보에 대한 전처리
  const formatYearLabel = (years: number[]) => {
    if (!years || years.length === 0) return '모든 연도';

    // 년도 오름차순 정렬
    const sortedYears = [...years].sort((a, b) => a - b);

    if (sortedYears.length === 1) return `${sortedYears[0]}년대`;

    // 연속된 년도 그룹화
    const ranges: { start: number; end: number }[] = [];
    let currentRange = { start: sortedYears[0], end: sortedYears[0] };

    for (let i = 1; i < sortedYears.length; i++) {
      if (
        sortedYears[i] === sortedYears[i - 1] + 10 ||
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

    // 년도 값 내려올 경우 2020 이전은 년대로 표현현
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
      <article
        className='flex cursor-pointer flex-col'
        onClick={handleRoomClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* 상단 */}
        <section className='relative flex w-full'>
          {/* CD 배치 */}
          <div
            className='absolute top-[5%] left-[30%] z-0 aspect-square w-[55%]'
            style={{
              transform: isHovering ? 'translateX(10%)' : 'translateX(0)',
              transition: 'transform 0.5s ease-in-out',
            }}
          >
            <Image
              src='/lp.svg'
              alt='CD'
              fill
              style={{
                animation: isHovering
                  ? 'spin 3s linear infinite'
                  : currentStatus === 'IN_PROGRESS'
                    ? 'spin 10s linear infinite' // 게임 중일 경우 천천히 회전
                    : 'none', // 대기 중일 경우 회전 없음
                transition: 'all 0.7s ease-in-out',
              }}
            />
          </div>

          {/* CD 케이스 (왼쪽 60%, CD 일부를 가림) */}
          <div className='relative z-10 flex aspect-square w-3/5 flex-col justify-between bg-white p-2'>
            {/* 게임 모드 뱃지 */}
            <div className='flex justify-center'>
              {room.gameModes &&
                Array.isArray(room.gameModes) &&
                room.gameModes.map(mode => (
                  <Badge
                    key={mode}
                    variant='outline'
                    className={`rounded-full border px-2 text-xs ${modeBadgeVariants[mode] || defaultBadgeStyle}`}
                  >
                    {gameModeLabels[mode] || mode}
                  </Badge>
                ))}
            </div>
            {/* 선택한 맵 */}
            <div className='relative h-24 w-full overflow-hidden'>
              <Image
                src={formatData.image}
                alt={formatData.name}
                fill
                sizes='100%'
                className='h-full object-contain'
              />
            </div>
            <div className='flex items-center justify-between'>
              {/* 방 상태 표시 */}
              <div>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${statusDisplay.className}`}
                >
                  {statusDisplay.text}
                </span>
              </div>
              {/* 방 인원 */}
              <div className='flex justify-end'>
                <span className='mr-1 text-xs'>👨‍👩‍👦</span>
                <span
                  className={`${isFull ? 'text-red-600' : 'text-black'} text-xs`}
                >
                  {room.currentPlayers} / {room.maxPlayer}
                </span>
              </div>
            </div>
            {/* 선택 년도 - 라벨 */}
            <div className='text-xs'>
              {room.selectedYears && room.selectedYears.length > 0 && (
                <span className='text-xs'>
                  {formatYearLabel(room.selectedYears)}
                </span>
              )}
              <span>2024</span>
            </div>
          </div>
        </section>

        {/* 하단 : 방 이름, 번호, 잠금 여부 */}
        <section className='mt-2 flex items-center justify-between'>
          <div className='flex items-center'>
            {/* 방 번호 */}
            <div className='mr-2 rounded-md bg-gradient-to-b from-[#8352D1] to-[#5B3A91] px-2 py-1 text-white'>
              {String(room.roomNumber).padStart(3, '0')}
            </div>
            {/* 잠금방 아이콘 표시 */}
            {room.hasPassword ? (
              <span className='rounded-full bg-amber-100 p-1.5 text-xs font-bold text-amber-500'>
                🔒
              </span>
            ) : (
              <span></span>
            )}
            {/* 방 이름 */}
            <span
              className='my-4 truncate text-2xl font-bold text-white'
              style={{
                textShadow: `-3px -3px 0 #6548B9, 3px -3px 0 #6548B9, -3px 3px 0 #6548B9, 3px 3px 0 #6548B9`,
              }}
            >
              {room.title.length > 10
                ? `${room.title.slice(0, 10)}...`
                : room.title}
            </span>
          </div>
        </section>
      </article>

      {/* 방 입장 시 나오는 dialog */}
      <RoomDialog
        room={room}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
