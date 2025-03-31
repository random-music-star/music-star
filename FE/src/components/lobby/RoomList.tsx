import { useCallback, useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { useRouter } from 'next/router';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Room } from '@/pages/game/lobby/[channelId]';

import RoomItem from './RoomItem';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

const SSE_EVENTS = {
  CONNECT: 'CONNECT',
  ROOM_UPDATED: 'ROOM_UPDATED',
  ROOM_DELETE: 'ROOM_DELETE',
} as const;

interface RoomListProps {
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  channelId: string;
}

export default function RoomList({
  currentPage: initialCurrentPage = 0,
  totalPages: initialTotalPages = 1,
  pageSize = 6,
  channelId,
}: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const currentPageRef = useRef<number>(initialCurrentPage);
  const router = useRouter();

  const SSE_ENDPOINT = `${process.env.NEXT_PUBLIC_SSE_URL}/${channelId}`;

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // URL 쿼리 파라미터에서 페이지 정보 가져오기
  useEffect(() => {
    const { page } = router.query;
    if (page && !isNaN(Number(page))) {
      const pageNum = Number(page);
      if (pageNum !== currentPage) {
        setCurrentPage(pageNum);
      }
    }
  }, [router.query, currentPage]);

  // 페이지 로딩 시 GET 요청으로 방 목록 가져옴
  useEffect(() => {
    setIsLoading(true);
    const fetchInitialRooms = async () => {
      try {
        const pageToFetch = router.query.page
          ? Number(router.query.page)
          : initialCurrentPage;

        const response = await axios.get(`${API_URL}/room`, {
          params: {
            channelId: channelId,
            page: pageToFetch,
            size: pageSize,
          },
        });

        const data = response.data;
        setRooms(data.content || []);
        setCurrentPage(data.number || 0);
        setTotalPages(data.totalPages || 1);
        setIsLoading(false);
      } catch (error) {
        console.error('초기 방 목록 가져오기 오류:', error);
        setIsLoading(false);
      }
    };

    fetchInitialRooms();
  }, [channelId, initialCurrentPage, pageSize, router.query.page]);

  // 페이지 전환 시 URL 업데이트 및 GET 요청 처리
  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);

      await router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            page: newPage,
          },
        },
        undefined,
        { shallow: true },
      );

      const response = await axios.get(`${API_URL}/room`, {
        params: {
          channelId: channelId,
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

      eventSource.addEventListener(SSE_EVENTS.ROOM_UPDATED, event => {
        const data = handleEventData(event, SSE_EVENTS.ROOM_UPDATED);

        if (data && data.room) {
          const updatedRoom = data.room;
          const pageNow = currentPageRef.current;

          // 사용자가 첫페이지에 있을 경우
          // 기존에 있던 방의 경우 갱신, 없던 방은 상단 추가 후 기존 아이템 한개 삭제
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
            // 사용자가 첫 페이지 이외 페이지에 있을 경우
            // 기존에 있던 방의 경우 갱신, 없던 방의 경우 처리 안함
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

      // 아직 서버 구현안된 type, finished로 들어올 예정
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
  }, [handleEventData, pageSize, SSE_ENDPOINT, channelId]);

  useEffect(() => {
    if (!sseConnected) {
      setCurrentPage(initialCurrentPage);
      setTotalPages(initialTotalPages);
    }
  }, [sseConnected, initialCurrentPage, initialTotalPages]);

  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(`${API_URL}/sse/disconnect`);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1 || totalPages === 0;

  return (
    <div className='flex items-center justify-center'>
      {isLoading ? (
        // 로딩 중
        <div className='flex items-center justify-center py-12'>
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
        <div className='flex flex-1'>
          {!sseConnected && (
            <Alert className='mb-4 border-amber-200 bg-amber-50'>
              <AlertDescription className='text-sm text-amber-700'>
                ⚠️ 실시간 연결이 불가능합니다.
              </AlertDescription>
            </Alert>
          )}
          {/* 방 목록 표시 */}
          <div className='flex flex-1 items-center justify-between'>
            {/* 이전 버튼 */}
            <button
              onClick={() => !isFirstPage && handlePageChange(currentPage - 1)}
              disabled={isFirstPage}
              className={`${isFirstPage ? 'opacity-10' : 'hover:cursor-pointer hover:text-[#82cdce]'} mr-3 text-7xl text-[#9FFCFE]`}
            >
              ◀
            </button>
            {/* 방 목록 */}
            <div className='relative flex flex-1 flex-col justify-between'>
              <div className='absolute top-[-50px] left-[50%] text-center text-sm font-medium text-white'>
                {totalPages > 0
                  ? `${currentPage + 1} / ${totalPages}`
                  : '0 / 0'}
              </div>
              <div className='grid min-h-[400px] grid-cols-2 gap-4 lg:grid-cols-3'>
                {rooms.map(room => (
                  <RoomItem key={room.id} room={room} />
                ))}
              </div>
            </div>
            {/* 다음 버튼 */}
            <button
              onClick={() => !isLastPage && handlePageChange(currentPage + 1)}
              disabled={isLastPage}
              className={`${isLastPage ? 'opacity-10' : 'hover:cursor-pointer hover:text-[#82cdce]'} ml-3 text-7xl text-[#9FFCFE]`}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
