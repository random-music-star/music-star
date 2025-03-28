import { useCallback, useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Room } from '@/pages/game/lobby';

import RoomItem from './RoomItem';

const SSE_ENDPOINT = `${process.env.NEXT_PUBLIC_SSE_URL}/lobby`;
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

const SSE_EVENTS = {
  CONNECT: 'CONNECT',
  ROOM_LIST: 'ROOM_LIST',
  ROOM_UPDATED: 'ROOM_UPDATED',
  ROOM_DELETE: 'ROOM_DELETE',
} as const;

interface RoomListProps {
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
}

export default function RoomList({
  currentPage: initialCurrentPage = 0,
  totalPages: initialTotalPages = 1,
  pageSize = 6,
}: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const currentPageRef = useRef<number>(initialCurrentPage);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/room`, {
        params: {
          page: newPage,
          size: pageSize,
        },
      });

      const data = response.data;
      setRooms(data.content || []);
      setCurrentPage(data.pageable?.pageNumber || newPage);
      setTotalPages(data.totalPages || 1);
      setIsLoading(false);
    } catch (error) {
      console.error('방 목록 가져오기 오류:', error);
      setIsLoading(false);
    }
  };

  const handleEventData = useCallback(
    (event: MessageEvent, eventName: string) => {
      try {
        let data;

        if (eventName === SSE_EVENTS.CONNECT) {
          data = event.data;
          return data;
        }

        if (eventName === SSE_EVENTS.ROOM_LIST) {
          data = JSON.parse(event.data);
          return data;
        }

        data = JSON.parse(event.data);
        return data;
      } catch (error) {
        console.error(`${eventName} 이벤트 처리 오류:`, error);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource(SSE_ENDPOINT);

      eventSource.onopen = () => {
        setSseConnected(true);
      };
      eventSource.onerror = () => {
        setSseConnected(false);
        setIsLoading(false);
      };

      eventSource.addEventListener(SSE_EVENTS.CONNECT, event => {
        handleEventData(event, SSE_EVENTS.CONNECT);
        setSseConnected(true);
      });

      eventSource.addEventListener(SSE_EVENTS.ROOM_LIST, event => {
        const data = handleEventData(event, SSE_EVENTS.ROOM_LIST);
        if (data && data.rooms) {
          const rooms = data.rooms;
          const totalPages = data.totalPages;
          const currentPage = data.currentPage;

          setRooms(rooms);
          setTotalPages(totalPages);
          setCurrentPage(currentPage);
          setIsLoading(false);
        } else {
          setRooms([]);
          setIsLoading(false);
        }
      });

      eventSource.addEventListener(SSE_EVENTS.ROOM_UPDATED, event => {
        const data = handleEventData(event, SSE_EVENTS.ROOM_UPDATED);

        if (data && data.room) {
          const updatedRoom = data.room;
          const pageNow = currentPageRef.current;

          if (pageNow === 0) {
            setRooms(currentRooms => {
              const roomIndex = currentRooms.findIndex(
                room => room.id === updatedRoom.id,
              );

              if (roomIndex !== -1) {
                const newRooms = [...currentRooms];
                newRooms[roomIndex] = updatedRoom;
                return newRooms;
              } else {
                const newRooms = [updatedRoom, ...currentRooms];
                if (newRooms.length > pageSize) {
                  return newRooms.slice(0, pageSize);
                }
                return newRooms;
              }
            });
          } else {
            setRooms(currentRooms => {
              const roomIndex = currentRooms.findIndex(
                room => room.id === updatedRoom.id,
              );

              if (roomIndex !== -1) {
                const newRooms = [...currentRooms];
                newRooms[roomIndex] = updatedRoom;
                return newRooms;
              }
              return currentRooms;
            });
          }
        }
      });

      eventSource.addEventListener(SSE_EVENTS.ROOM_DELETE, event => {
        const deletedRoom = handleEventData(event, SSE_EVENTS.ROOM_DELETE);
        if (deletedRoom) {
          setRooms(currentRooms =>
            currentRooms.filter(room => room.id !== deletedRoom.id),
          );
        }
      });
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [handleEventData, pageSize]);

  useEffect(() => {
    if (!sseConnected) {
      setCurrentPage(initialCurrentPage);
      setTotalPages(initialTotalPages);
    }
  }, [sseConnected, initialCurrentPage, initialTotalPages]);

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1 || totalPages === 0;

  return (
    <div>
      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <div
            className='mr-2 inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-indigo-500'
            aria-hidden='true'
          ></div>
          <p className='font-medium text-indigo-700'>
            방 목록을 불러오는 중...
          </p>
        </div>
      ) : rooms.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-2 py-20'>
          <div className='mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100'>
            <span className='text-2xl text-indigo-500'>🎵</span>
          </div>
          <p className='font-medium text-indigo-700'>생성된 방이 없습니다</p>
          <p className='text-sm text-gray-500'>
            새로운 노래방을 만들어 보세요!
          </p>
        </div>
      ) : (
        <>
          {!sseConnected && (
            <Alert className='mb-4 border-amber-200 bg-amber-50'>
              <AlertDescription className='text-sm text-amber-700'>
                ⚠️ 실시간 연결이 불가능합니다.
              </AlertDescription>
            </Alert>
          )}

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {rooms.map(room => (
              <RoomItem key={room.id} room={room} />
            ))}
          </div>

          {totalPages > 0 && (
            <div className='mt-6 flex items-center justify-center gap-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={isFirstPage || isLoading}
                className={`${isFirstPage ? 'cursor-not-allowed opacity-50' : 'hover:bg-indigo-50'} border-indigo-200`}
              >
                <ChevronLeft className='mr-1 h-4 w-4' />
                이전
              </Button>

              <div className='text-sm font-medium text-gray-700'>
                {totalPages > 0
                  ? `${currentPage + 1} / ${totalPages}`
                  : '0 / 0'}
              </div>

              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={isLastPage || isLoading}
                className={`${isLastPage ? 'cursor-not-allowed opacity-50' : 'hover:bg-indigo-50'} border-indigo-200`}
              >
                다음
                <ChevronRight className='ml-1 h-4 w-4' />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
