import React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Room } from '@/pages/game/lobby/[channelId]';

import RoomItem from './RoomItem';

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
  sseConnected: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function RoomList({
  rooms,
  isLoading,
  sseConnected,
  currentPage,
  totalPages,
  onPageChange,
}: RoomListProps) {
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1 || totalPages === 0;

  return (
    <div className='flex h-full items-center justify-center'>
      {isLoading ? (
        // 로딩 중
        <div className='flex items-center justify-center overflow-y-auto py-12'>
          <div
            className='mr-2 h-6 w-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-indigo-500'
            aria-hidden='true'
          ></div>
          <p className='font-medium text-indigo-700'>
            방 목록을 불러오는 중...
          </p>
        </div>
      ) : rooms.length === 0 ? (
        // SSE 연결 완료 & 현재 방 목록 없음
        <div className='flex flex-col items-center justify-center gap-2 py-20'>
          <div className='mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100'>
            <span className='text-2xl text-indigo-500'>🎵</span>
          </div>
          <p className='font-medium text-indigo-700'>생성된 방이 없습니다</p>
          <p className='text-sm text-white'>새로운 노래방을 만들어 보세요!</p>
        </div>
      ) : (
        // SSE 연결 완료 & 방 목록 내려받기 완료
        <div className='flex h-full w-full flex-1'>
          {/* 방 목록 표시 */}
          <div className='flex h-full w-full items-center justify-between'>
            {/* 이전 버튼 */}
            <button
              onClick={() => !isFirstPage && onPageChange(currentPage - 1)}
              disabled={isFirstPage}
              className={`${isFirstPage ? 'opacity-10' : 'hover:cursor-pointer hover:text-[#82cdce]'} mr-2 text-4xl text-[#9FFCFE]`}
            >
              ◀
            </button>
            {/* 방 목록 */}
            <div className='flex h-full w-full flex-col justify-between'>
              {!sseConnected && (
                <Alert className='mb-4 border-amber-200 bg-amber-50'>
                  <AlertDescription className='text-sm text-amber-700'>
                    ⚠️ 실시간 연결이 불가능합니다.
                  </AlertDescription>
                </Alert>
              )}
              <div className='flex h-full flex-wrap'>
                {rooms.map(room => (
                  <div key={room.id} className='w-1/3'>
                    <RoomItem room={room} />
                  </div>
                ))}
              </div>
            </div>
            {/* 다음 버튼 */}
            <button
              onClick={() => !isLastPage && onPageChange(currentPage + 1)}
              disabled={isLastPage}
              className={`${isLastPage ? 'opacity-10' : 'hover:cursor-pointer hover:text-[#82cdce]'} ml-2 text-4xl text-[#9FFCFE]`}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
