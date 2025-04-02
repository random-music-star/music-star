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
} as const;

// 액션 타입 상수 추가
const ACTION_TYPES = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  FINISHED: 'FINISHED',
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
  const roomsRef = useRef<Room[]>([]);
  const router = useRouter();

  const SSE_ENDPOINT = `${process.env.NEXT_PUBLIC_SSE_URL}/${channelId}`;

  // rooms 상태가 변경될 때마다 ref도 업데이트
  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

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

        if (!data) return;

        const pageNow = currentPageRef.current;

        // FINISHED 상태인 방 처리
        if (data.actionType === ACTION_TYPES.FINISHED) {
          const roomId = data.roomId;

          // roomsRef를 사용하여 최신 rooms 상태 참조
          const isRoomInCurrentPage = roomsRef.current.some(
            (room: Room) => room.id === roomId,
          );

          // 현재 페이지에 없을 경우 관련 정보를 무시
          if (!isRoomInCurrentPage) {
            return;
          }

          // 현재 페이지에 있을 경우 FINISHED된 방의 입장을 제한
          setRooms(currentRooms => {
            const roomIndex = currentRooms.findIndex(
              (room: Room) => room.id === roomId,
            );

            if (roomIndex !== -1) {
              const newRooms = [...currentRooms];
              newRooms[roomIndex] = {
                ...newRooms[roomIndex],
                disabled: true,
              } as Room;
              return newRooms;
            }
            return currentRooms;
          });

          // 페이지에 대한 GET 요청을 보내 새로운 목록을 받아옴
          const fetchUpdatedRooms = async () => {
            try {
              const response = await axios.get(`${API_URL}/room`, {
                params: {
                  channelId: channelId,
                  page: pageNow,
                  size: pageSize,
                },
              });

              const newRoomsData = response.data.content || [];

              setRooms(currentRooms => {
                // 방 목록 업데이트 로직
                const finishedRoomIndex = currentRooms.findIndex(
                  (room: Room) => room.id === roomId,
                );

                if (finishedRoomIndex === -1) {
                  return currentRooms; // FINISHED 방이 이미 처리되었거나 없는 경우
                }

                // 기존 방 목록에서 FINISHED 방을 제외한 나머지 방들
                const remainingRooms = currentRooms.filter(
                  (room: Room) => room.id !== roomId,
                );

                // 결과 목록의 개수가 기존과 동일한 경우
                if (newRoomsData.length === currentRooms.length) {
                  // 기존 목록에 없는 새로운 방 찾기
                  const newRoom = newRoomsData.find(
                    (room: Room) =>
                      !currentRooms.some(
                        (existingRoom: Room) => existingRoom.id === room.id,
                      ),
                  );

                  if (newRoom) {
                    // FINISHED된 방 위치에 새로운 방으로 대체
                    const result = [...remainingRooms];
                    result.splice(finishedRoomIndex, 0, newRoom);
                    return result;
                  }

                  // 새로운 방을 찾지 못한 경우 기존 목록 유지 (FINISHED 방은 disabled 상태로)
                  return currentRooms;
                }
                // 결과 목록의 개수가 기존보다 적은 경우
                else if (newRoomsData.length < currentRooms.length) {
                  // FINISHED된 방을 제외
                  return remainingRooms;
                }
                // 결과 목록의 개수가 기존보다 많은 경우
                else {
                  // 1. FINISHED 방을 제외한 기존 방 목록 구성
                  const remainingRooms = currentRooms.filter(
                    (room: Room) => room.id !== roomId,
                  );

                  // 2. 기존에 없던 새로운 방들 찾기
                  const newRooms = newRoomsData.filter(
                    (room: Room) =>
                      !currentRooms.some(
                        (existingRoom: Room) => existingRoom.id === room.id,
                      ),
                  );

                  // 3. FINISHED 방 위치에 새로운 방 중 하나를 배치
                  const result = [...remainingRooms];
                  if (newRooms.length > 0) {
                    result.splice(finishedRoomIndex, 0, newRooms[0]);

                    // 4. 나머지 새로운 방들은 배열 뒤에 추가
                    if (newRooms.length > 1) {
                      result.push(...newRooms.slice(1));
                    }
                  }

                  // 5. 페이지 크기에 맞게 목록 조정
                  return result.slice(0, pageSize);
                }
              });
            } catch (error) {
              console.error(
                'FINISHED 상태 방 처리 중 방 목록 가져오기 오류:',
                error,
              );
            }
          };

          fetchUpdatedRooms();
          return;
        }

        // CREATED 또는 UPDATED 상태인 방 처리 (room 객체가 있는 경우)
        if (
          (data.actionType === ACTION_TYPES.CREATED ||
            data.actionType === ACTION_TYPES.UPDATED) &&
          data.room
        ) {
          const updatedRoom = data.room;

          // CREATED 액션 처리 - 주로 첫 페이지에 새 방을 추가
          if (data.actionType === ACTION_TYPES.CREATED) {
            // 사용자가 첫페이지에 있을 경우에만 새 방 추가
            if (pageNow === 0) {
              setRooms(currentRooms => {
                const roomIndex = currentRooms.findIndex(
                  (room: Room) => room.id === updatedRoom.id,
                );

                if (roomIndex !== -1) {
                  // 이미 존재하는 방이면 업데이트
                  const newRooms = [...currentRooms];
                  newRooms[roomIndex] = updatedRoom;
                  return newRooms;
                } else {
                  // 새 방이면 맨 앞에 추가
                  const newRooms = [updatedRoom, ...currentRooms];
                  if (newRooms.length > pageSize) {
                    return newRooms.slice(0, pageSize);
                  }
                  return newRooms;
                }
              });
            }
          }
          // UPDATED 액션 처리 - 현재 페이지에 해당 방이 있으면 정보 업데이트
          else if (data.actionType === ACTION_TYPES.UPDATED) {
            setRooms(currentRooms => {
              const roomIndex = currentRooms.findIndex(
                (room: Room) => room.id === updatedRoom.id,
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
    <div className='flex h-full items-center justify-center overflow-y-auto'>
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
