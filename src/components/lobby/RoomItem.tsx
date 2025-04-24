import { useState } from 'react';

import { Lock } from 'lucide-react';
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
  FULL: '한곡',
  DUAL: '믹스',
  TTS: 'AI',
};

// 게임 모드 배지 스타일
const modeBadgeVariants: Record<string, string> = {
  FULL: 'bg-purple-100 text-purple-800 border-purple-200',
  DUAL: 'bg-amber-100 text-amber-800 border-amber-200',
  TTS: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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

  const currentPlayers = room.currentPlayers ?? 0;
  const maxPlayer = room.maxPlayer ?? 4;

  const isFull = currentPlayers >= maxPlayer;
  const currentStatus = room.status || 'WAITING';
  const statusDisplay = statusConfig[currentStatus] || statusConfig['WAITING'];

  // LP 이미지 경로 결정
  const lpImageSrc =
    currentStatus === 'IN_PROGRESS' ? '/lp_playing.svg' : '/lp_waiting.svg';

  // 방 클릭 처리
  const handleRoomClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <article
        className='flex w-full cursor-pointer flex-col'
        onClick={handleRoomClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        title={`방 제목 : ${room.title}`}
      >
        {/* 상단 */}
        <section className='relative w-full'>
          {/* CD 배치 */}
          <div
            className='absolute top-[4%] left-[25%] z-0 aspect-square w-[55%]'
            style={{
              transform: isHovering ? 'translateX(15%)' : 'translateX(5%)',
              transition: 'transform 0.5s ease-in-out',
            }}
          >
            <Image
              src={lpImageSrc}
              alt='LP 디스크'
              fill
              style={{
                animation: isHovering
                  ? 'spin 3s linear infinite'
                  : currentStatus === 'IN_PROGRESS'
                    ? 'spin 10s linear infinite'
                    : 'none',
                transition: 'all 0.7s ease-in-out',
              }}
            />
          </div>

          {/* CD 케이스 (CD 일부를 가림) */}
          <div className='relative z-10 flex aspect-square w-[60%] flex-col justify-between bg-white p-2 shadow-md'>
            {/* CD 케이스 상단 : 상태, 모드 */}
            <div className='mb-1 flex w-full items-center justify-between'>
              {/* 방 상태 표시 */}
              <span
                className={`rounded-full px-1 py-0.5 text-xs ${statusDisplay.className}`}
              >
                {statusDisplay.text}
              </span>
              {/* 게임 모드 뱃지 */}
              <div className='ml-1 flex flex-wrap justify-end gap-1'>
                {room.gameModes &&
                  Array.isArray(room.gameModes) &&
                  room.gameModes.map(mode => (
                    <Badge
                      key={mode}
                      variant='outline'
                      className={`rounded-full border px-1 text-xs ${modeBadgeVariants[mode] || defaultBadgeStyle}`}
                    >
                      {gameModeLabels[mode] || mode}
                    </Badge>
                  ))}
              </div>
            </div>
            {/* CD 케이스 하단 : 년도, 맵, 인원 수, 라운드 수 */}
            <div className='flex w-full flex-1'>
              {/* CD 케이스 우측 : 맵, 인원 현황, 라운드 설정 값*/}
              <div className='relative flex w-full flex-col justify-center'>
                {/* 선택한 맵 - 맵 형식에 따라 다른 컴포넌트 렌더링 */}
                <div className='mb-2 h-3/5 w-full overflow-hidden rounded'>
                  {room.format === 'GENERAL' ? (
                    <GeneralMapPreview />
                  ) : (
                    <BoardMapPreview />
                  )}
                </div>
                {/* CD 케이스 좌측 사이드 : 년도 */}
                <div className='mb-1 flex w-full flex-wrap items-center'>
                  {/* 년대 (2020년 미만) */}
                  <div className='mb-0.5 flex w-full flex-wrap items-center justify-center'>
                    {room.years &&
                      Array.isArray(room.years) &&
                      room.years
                        .filter(year => year < 2020)
                        .map(year => (
                          <span
                            key={year}
                            className='mr-1 rounded-2xl bg-blue-600/60 px-1 text-[0.5rem] whitespace-nowrap text-white'
                          >
                            {`${year}s`}
                          </span>
                        ))}
                  </div>
                  {/* 년도 (2020년 이상) */}
                  <div className='flex w-full flex-wrap items-center justify-center'>
                    {room.years &&
                      Array.isArray(room.years) &&
                      room.years
                        .filter(year => year >= 2020)
                        .map(year => (
                          <span
                            key={year}
                            className='mr-1 rounded-2xl bg-purple-600/60 px-1 text-[0.5rem] whitespace-nowrap text-white'
                          >
                            {`${year}`}
                          </span>
                        ))}
                  </div>
                </div>
                {/* 방 인원 */}
                <div className='absolute right-0 bottom-0 flex items-end justify-end'>
                  <span className='mr-0.5 text-[9px]'>👨‍👩‍👦</span>
                  <span
                    className={`${isFull ? 'text-red-600' : 'text-black'} text-xs font-medium`}
                  >
                    {room.currentPlayers} / {room.maxPlayer}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 하단 : 방 이름, 번호, 잠금 여부 */}
        <section className='mt-2 mb-6 flex items-center justify-between'>
          <div className='flex w-full items-center'>
            {/* 방 번호 */}
            <div className='text-md mr-2 rounded-md bg-gradient-to-b from-[#8352D1] to-[#5B3A91] px-1.5 py-0.5 text-white'>
              {String(room.roomNumber).padStart(3, '0')}
            </div>
            {/* 잠금방 아이콘 표시 */}
            <div className='mr-2'>
              {room.hasPassword && (
                <Lock className='mb-[1px] ml-2 h-5 w-5 text-yellow-200' />
              )}
            </div>
            {/* 방 이름 */}
            <h3
              className='truncate text-xl font-bold text-white'
              style={{
                textShadow: `-1px -1px 0 #6548B9, 1px -1px 0 #6548B9, -1px 1px 0 #6548B9, 1px 1px 0 #6548B9`,
              }}
            >
              {room.title.length > 8
                ? `${room.title.slice(0, 8)}...`
                : room.title}
            </h3>
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
