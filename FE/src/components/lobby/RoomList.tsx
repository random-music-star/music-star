import { useCallback, useEffect, useRef, useState } from 'react';

import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Room } from '@/pages/lobby';

import RoomItem from './RoomItem';

// SSE 엔드포인트 URL 상수 정의 (나중에 env로 빼야 함)
const SSE_ENDPOINT = `${process.env.NEXT_PUBLIC_SSE_URL}/lobby`;
const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

// SSE 이벤트 타입 상수 정의
const SSE_EVENTS = {
  // 최초 연결 (SSE 연결 메시지 - data 문자열, 방 목록 리스트 전달 - data 배열)
  CONNECT: 'CONNECT',
  ROOM_LIST: 'ROOM_LIST',
  // 방 생성, 방 정보 수정 (actionType, room key 값으로 받음)
  ROOM_UPDATED: 'ROOM_UPDATED',
  // 방 삭제 (아직 없음)
  ROOM_DELETE: 'ROOM_DELETE',
} as const;

interface RoomListProps {
  rooms: Room[];
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
}

export default function RoomList({
  rooms: initialRooms,
  currentPage: initialCurrentPage = 0,
  totalPages: initialTotalPages = 1,
  pageSize = 8,
}: RoomListProps) {
  // 상태 관리 : 방 목록, 로딩 상태, SSE 연결 상태, 페이지네이션 정보
  const [rooms, setRooms] = useState<Room[]>(
    Array.isArray(initialRooms) ? initialRooms : [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    initialRooms.length === 0,
  );
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);

  // 현재 페이지를 ref로 관리하여 이벤트 핸들러에서 최신 값에 접근할 수 있도록 함
  const currentPageRef = useRef<number>(initialCurrentPage);

  // currentPage 상태가 변경될 때마다 ref 값도 업데이트
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // 페이지 이동 함수
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

  // 이벤트 데이터 처리 함수
  const handleEventData = useCallback(
    (event: MessageEvent, eventName: string) => {
      try {
        let data;

        // CONNECT 이벤트 : data (문자열)
        if (eventName === SSE_EVENTS.CONNECT) {
          data = event.data;
          console.log(`${eventName} 이벤트 수신:`, data);
          return data;
        }

        // ROOM_LIST 이벤트 : data (JSON)
        if (eventName === SSE_EVENTS.ROOM_LIST) {
          data = JSON.parse(event.data);
          console.log(`ROOM_LIST 조건 이벤트 수신:`, data);
          return data;
        }

        // 기타 이벤트 (ROOM_UPDATE, ROOM_DELETE)
        data = JSON.parse(event.data);
        console.log(`${eventName} 이벤트 수신:`, data);
        return data;
      } catch (error) {
        console.error(`${eventName} 이벤트 처리 오류:`, error);
        return null;
      }
    },
    [],
  );

  // 수정이 필요한 useEffect 부분
  useEffect(() => {
    let eventSource: EventSource | null = null;

    // SSE 연결 함수
    const connectSSE = () => {
      if (eventSource) {
        eventSource.close();
      }

      // SSE 연결 생성
      eventSource = new EventSource(SSE_ENDPOINT);

      // 기본 이벤트 핸들러
      eventSource.onopen = () => {
        console.log('SSE 연결됨');
        setSseConnected(true);
        setIsLoading(false);
      };
      eventSource.onerror = () => {
        console.error('SSE 연결 오류 발생');
        setSseConnected(false);
        // 초기 데이터가 있으면 로딩 상태 해제
        if (initialRooms.length > 0) {
          setIsLoading(false);
        }
      };

      // CONNECT 이벤트
      eventSource.addEventListener(SSE_EVENTS.CONNECT, event => {
        handleEventData(event, SSE_EVENTS.CONNECT);
        setSseConnected(true);
        setIsLoading(false);
      });

      // ROOM_LIST 이벤트
      eventSource.addEventListener(SSE_EVENTS.ROOM_LIST, event => {
        const data = handleEventData(event, SSE_EVENTS.ROOM_LIST);
        if (data && data.rooms) {
          const rooms = data.rooms;
          const totalPages = data.totalPages;
          const currentPage = data.currentPage;

          console.log(
            '방 목록',
            rooms,
            '전체 페이지 수',
            totalPages,
            '현재 페이지 번호',
            currentPage,
          );

          setRooms(rooms);
          setTotalPages(totalPages);
          setCurrentPage(currentPage);
          setIsLoading(false);
        } else {
          setRooms([]);
          setIsLoading(false);
        }
      });

      // ROOM_UPDATE 이벤트
      eventSource.addEventListener(SSE_EVENTS.ROOM_UPDATED, event => {
        const data = handleEventData(event, SSE_EVENTS.ROOM_UPDATED);

        if (data && data.room) {
          const updatedRoom = data.room;
          // 최신 currentPage 값을 ref에서 가져옴
          const pageNow = currentPageRef.current;
          console.log('현재 페이지 (ref):', pageNow);

          if (pageNow === 0) {
            // 첫 페이지인 경우: 함수형 업데이트 사용
            setRooms(currentRooms => {
              const roomIndex = currentRooms.findIndex(
                room => room.id === updatedRoom.id,
              );

              if (roomIndex !== -1) {
                // 이미 있는 방이면 업데이트
                const newRooms = [...currentRooms];
                newRooms[roomIndex] = updatedRoom;
                return newRooms;
              } else {
                // 새로운 방이면 목록 맨 앞에 추가하고, 페이지 크기 유지
                const newRooms = [updatedRoom, ...currentRooms];
                // 페이지 크기 유지
                if (newRooms.length > pageSize) {
                  return newRooms.slice(0, pageSize);
                }
                return newRooms;
              }
            });
          } else {
            // 첫 페이지가 아닌 경우: 함수형 업데이트 사용
            setRooms(currentRooms => {
              const roomIndex = currentRooms.findIndex(
                room => room.id === updatedRoom.id,
              );

              if (roomIndex !== -1) {
                // 방이 목록에 있을 경우 해당 방 정보 업데이트
                const newRooms = [...currentRooms];
                newRooms[roomIndex] = updatedRoom;
                return newRooms;
              }
              // 방이 목록에 없을 경우 기존 배열 반환
              return currentRooms;
            });
          }
        }
      });

      // ROOM_DELETE 이벤트
      eventSource.addEventListener(SSE_EVENTS.ROOM_DELETE, event => {
        const deletedRoom = handleEventData(event, SSE_EVENTS.ROOM_DELETE);
        if (deletedRoom) {
          setRooms(currentRooms =>
            currentRooms.filter(room => room.id !== deletedRoom.id),
          );
        }
      });
    };

    // 초기 SSE 연결 시도
    connectSSE();

    // 클린업 함수
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [handleEventData, initialRooms.length, pageSize]);

  // props로 전달된 rooms가 변경될 경우, SSE가 연결되지 않았다면 상태 업데이트
  useEffect(() => {
    if (!sseConnected) {
      setRooms(initialRooms);
      setCurrentPage(initialCurrentPage);
      setTotalPages(initialTotalPages);
    }
  }, [initialRooms, sseConnected, initialCurrentPage, initialTotalPages]);

  // 페이지네이션 관련 상수
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
          {/* SSE 연결 상태 표시 */}
          {!sseConnected && initialRooms.length > 0 && (
            <Alert className='mb-4 border-amber-200 bg-amber-50'>
              <AlertDescription className='text-sm text-amber-700'>
                ⚠️ 실시간 연결이 불가능합니다. 샘플 데이터를 표시합니다.
              </AlertDescription>
            </Alert>
          )}

          {/* 그리드 구조: 화면 크기에 따라 열 개수 조정 */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {rooms.map(room => (
              <RoomItem key={room.id} room={room} />
            ))}
          </div>

          {/* 페이지네이션 UI */}
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
