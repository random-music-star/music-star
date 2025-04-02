import { useState } from 'react';

import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Room } from '@/pages/game/lobby/[channelId]';

import BoardMapPreview from './BoardMapPreview';
import GeneralMapPreview from './GeneralMapPreview';
import RoomDialog from './RoomDialog';

interface RoomItemProps {
  room: Room;
}

// 게임 모드 매핑
const gameModeLabels: Record<string, string> = {
  FULL: '전곡',
  DOUBLE: '2배속',
  AI: 'AI',
};

// 게임 모드 배지 스타일
const modeBadgeVariants: Record<string, string> = {
  FULL: 'bg-purple-100 text-purple-800 border-purple-200',
  DOUBLE: 'bg-amber-100 text-amber-800 border-amber-200',
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

  // 방 클릭 처리
  const handleRoomClick = () => {
    if (isFull) return;
    setIsDialogOpen(true);
  };

  // 년도 표시 함수
  const renderYearOptions = () => {
    const allYears = [
      1970, 1980, 1990, 2000, 2010, 2020, 2021, 2022, 2023, 2024,
    ];
    const selectedYears = room.years || [];

    return (
      <div className='mr-2 flex flex-col gap-1 text-[8px]'>
        {allYears.map(year => {
          const isSelected = selectedYears.includes(year);
          const needSuffix = year < 2020;

          return (
            <span
              key={year}
              className={`rounded px-1 ${isSelected ? 'font-medium text-purple-600' : 'text-gray-700'}`}
            >
              {year}
              {needSuffix ? 's' : ''}
            </span>
          );
        })}
      </div>
    );
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
          <div className='relative z-10 flex aspect-square w-4/5 flex-col justify-between bg-white p-2'>
            {/* CD 케이스 상단 : 상태, 모드 */}
            <div className='flex w-full items-center justify-between'>
              {/* 방 상태 표시 */}
              <span
                className={`rounded-full px-2 py-1 text-xs ${statusDisplay.className}`}
              >
                {statusDisplay.text}
              </span>
              {/* 게임 모드 뱃지 */}
              <div className='ml-2 flex flex-wrap justify-center gap-1'>
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
            </div>
            {/* CD 케이스 하단 : 년도, 맵, 인원 수, 라운드 수 */}
            <div className='flex w-full flex-1'>
              {/* CD 케이스 좌측 사이드 : 년도 */}
              <div className='flex flex-col justify-end'>
                {/* 모든 년도 표시 - 선택된 년도는 보라색으로 */}
                <div>{renderYearOptions()}</div>
              </div>
              {/* CD 케이스 우측 : 맵, 인원 현황, 라운드 설정 값*/}
              <div className='relative flex w-full flex-col justify-center'>
                {/* 선택한 맵 - 맵 형식에 따라 다른 컴포넌트 렌더링 */}
                <div className='relative h-24 w-full overflow-hidden'>
                  {room.format === 'GENERAL' ? (
                    <GeneralMapPreview />
                  ) : (
                    <BoardMapPreview />
                  )}
                </div>
                {/* 방 인원 */}
                <div className='absolute right-0 bottom-0 flex justify-end'>
                  <span className='mr-1 text-xs'>👨‍👩‍👦</span>
                  <span
                    className={`${isFull ? 'text-red-600' : 'text-black'} text-xs`}
                  >
                    {room.currentPlayers} / {room.maxPlayer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 하단 : 방 이름, 번호, 잠금 여부 */}
        <section className='mt-2 flex items-center justify-between'>
          <div className='flex items-center'>
            {/* 방 번호 */}
            <div className='mr-2 rounded-md bg-gradient-to-b from-[#8352D1] to-[#5B3A91] px-2 py-1 text-white'>
              {String(room.roomNumber).padStart(5, '0')}
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
