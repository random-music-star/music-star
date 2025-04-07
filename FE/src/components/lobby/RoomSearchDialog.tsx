import React, { useState } from 'react';

import { useRouter } from 'next/router';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import RoomDialog from './RoomDialog';

// API 응답 타입 정의
interface RoomSearchResponse {
  Rooms: Room[];
}

interface Room {
  format: string;
  roomId: string;
  roomNumber: number;
  title: string;
  playerCount: number;
  maxPlayer: number;
  hasPassword: boolean;
}

const RoomSearchDialog = () => {
  const [searchType, setSearchType] = useState<'title' | 'number'>('title');
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [showRoomDialog, setShowRoomDialog] = useState(false);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const channelId = router.query.channelId || '1';

  // 검색 타입 변경 시 검색 결과와 입력값 초기화
  const handleSearchTypeChange = (type: 'title' | 'number') => {
    setSearchType(type);
    setSearchQuery('');
    setRooms([]);
    setError('');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 방 번호로 검색 시 입력값 검증
    if (searchType === 'number') {
      if (!searchQuery.trim()) {
        setError('방 번호를 숫자값으로 입력해주세요.');
        return;
      }

      // 숫자값 이외의 값이 입력된 경우 검증
      if (!/^\d+$/.test(searchQuery.trim())) {
        setError('방 번호는 숫자만 입력 가능합니다.');
        return;
      }
    }

    setIsLoading(true);
    setRooms([]);

    try {
      const endpoint =
        searchType === 'title'
          ? `/room/search/title?channelId=${channelId}&title=${encodeURIComponent(searchQuery)}`
          : `/room/search/number?channelId=${channelId}&roomNumber=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`서버 오류가 발생했습니다. (${response.status})`);
      }
      const data: RoomSearchResponse = await response.json();
      setRooms(data.Rooms);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setIsSearchDialogOpen(false); // 검색 다이얼로그를 닫고
    setShowRoomDialog(true); // RoomDialog를 표시합니다
  };

  const handleCloseRoomDialog = () => {
    setSelectedRoom(null);
    setShowRoomDialog(false);
    setIsSearchDialogOpen(true); // RoomDialog가 닫히면 다시 검색 다이얼로그를 표시합니다
  };

  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false);
    setRooms([]);
  };

  return (
    <>
      <button
        className='hover:bg-opacity-80 mr-2 cursor-pointer rounded-full bg-[#DA9FFE] px-5 py-1.5 text-sm font-bold text-black hover:bg-[#DA9FFE]/80'
        onClick={() => setIsSearchDialogOpen(true)}
      >
        방 검색
      </button>

      {/* 검색 다이얼로그 */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className='bg-opacity-100 w-full min-w-[800px] rounded-lg border-4 border-white bg-gradient-to-b from-[#9F89EB] to-[#5D42AA] p-10 sm:max-w-[450px]'
        >
          <DialogHeader className='absolute top-[-25px] left-[20px]'>
            <DialogTitle
              className='text-4xl font-bold text-white'
              style={{
                textShadow: `-3px -3px 0 #6548B9, 3px -3px 0 #6548B9, -3px 3px 0 #6548B9, 3px 3px 0 #6548B9`,
              }}
            >
              ROOM SEARCH
            </DialogTitle>
          </DialogHeader>
          <section className='mt-3'>
            <div className='mb-4 flex'>
              <label className='mr-6 flex cursor-pointer items-center text-lg font-medium text-white'>
                <div className='relative mr-3'>
                  <input
                    type='radio'
                    name='searchType'
                    value='title'
                    checked={searchType === 'title'}
                    onChange={() => handleSearchTypeChange('title')}
                    className='sr-only'
                  />
                  <div className='h-6 w-6 rounded-full border-2 border-white bg-white'></div>
                  {searchType === 'title' && (
                    <div className='absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9F89EB]'></div>
                  )}
                </div>
                방 제목으로 검색
              </label>
              <label className='flex cursor-pointer items-center text-lg font-medium text-white'>
                <div className='relative mr-3'>
                  <input
                    type='radio'
                    name='searchType'
                    value='number'
                    checked={searchType === 'number'}
                    onChange={() => handleSearchTypeChange('number')}
                    className='sr-only'
                  />
                  <div className='h-6 w-6 rounded-full border-2 border-white bg-white'></div>
                  {searchType === 'number' && (
                    <div className='absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9F89EB]'></div>
                  )}
                </div>
                방 번호로 검색
              </label>
            </div>
            <form onSubmit={handleSearch} className='flex justify-center'>
              <Input
                type='text'
                placeholder={
                  searchType === 'title'
                    ? '방 제목을 입력하세요'
                    : '방 번호를 입력하세요'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='flex-1 border-white bg-white py-5 text-lg focus-visible:ring-white'
              />
              <button
                type='submit'
                disabled={isLoading}
                className='ml-2 rounded-full bg-purple-600 px-4 py-2 text-white shadow-md hover:bg-purple-700 disabled:opacity-50'
              >
                검색
              </button>
            </form>
          </section>
          <section className='neon-scrollbar mt-6 h-[300px] overflow-y-auto rounded-2xl bg-black/43 text-center text-lg text-white'>
            <div className='sticky top-0 z-10 flex w-full bg-[#6548B9] py-2'>
              <div className='w-18'>번호</div>
              <div className='flex-1'>제목</div>
              <div className='w-18'>인원</div>
              <div className='w-18'>🔒</div>
            </div>
            <div>
              {isLoading ? (
                <div className='flex min-h-60 items-center justify-center'>
                  검색 중입니다...
                </div>
              ) : error ? (
                <p className='flex min-h-60 items-center justify-center text-red-500'>
                  {error}
                </p>
              ) : rooms.length === 0 ? (
                <div className='flex min-h-60 items-center justify-center'>
                  검색 결과가 없습니다.
                </div>
              ) : (
                <div className='mt-2 w-full'>
                  {rooms.map(room => (
                    <div
                      key={room.roomId}
                      onClick={() => handleRoomSelect(room)}
                      className='mb-1 flex w-full cursor-pointer hover:bg-[#9F89EB]'
                    >
                      <div className='w-18'>{room.roomNumber}</div>
                      <div className='flex-1'>{room.title}</div>
                      <div className='w-18'>
                        {room.playerCount}/{room.maxPlayer}
                      </div>
                      <div className='w-18'>
                        {room.hasPassword ? '🔒' : '🔓'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
          <div className='text-center'>
            <div className='absolute top-[-20px] right-[-73px] flex justify-between px-8'>
              <button
                type='button'
                onClick={handleCloseSearchDialog}
                className='relative mr-4 flex h-[45px] w-[45px] items-center justify-center overflow-hidden rounded-full border-3 border-white bg-gradient-to-br from-purple-400 to-purple-900 font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-xl disabled:opacity-70'
              >
                X
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 방 선택 다이얼로그 - 별도로 렌더링 */}
      {selectedRoom && showRoomDialog && (
        <RoomDialog
          room={{
            id: selectedRoom.roomId,
            title: selectedRoom.title,
            hasPassword: selectedRoom.hasPassword,
            status: 'WAITING',
          }}
          isOpen={showRoomDialog}
          onClose={handleCloseRoomDialog}
        />
      )}
    </>
  );
};

export default RoomSearchDialog;
