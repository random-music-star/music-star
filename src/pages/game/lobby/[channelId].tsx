import { useCallback, useEffect, useRef, useState } from 'react';

import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

import { ApiContext } from '@/api/core';
import { Member, getChannelUsersAPI, userNicknameAPI } from '@/api/member';
import { getRoomsAPI } from '@/api/room';
import SEO from '@/components/SEO';
import BackgroundMusic from '@/components/common/BackgroundMusic';
import ChannelMemberList from '@/components/lobby/ChannelMemberList';
import ChatBox from '@/components/lobby/ChatBox';
import CreateRoomButton from '@/components/lobby/CreateRoomButton';
import Header from '@/components/lobby/Header';
import RoomList from '@/components/lobby/RoomList';
import RoomSearchDialog from '@/components/lobby/RoomSearchDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { useChannelStore } from '@/stores/lobby/useChannelStore';

const SSE_EVENTS = {
  CONNECT: 'CONNECT',
  ROOM_UPDATED: 'ROOM_UPDATED',
  USER_JOINED_CHANNEL: 'USER_JOINED_CHANNEL',
  USER_LEFT_CHANNEL: 'USER_LEFT_CHANNEL',
  MEMBER_LOCATION_UPDATED: 'MEMBER_LOCATION_UPDATED',
} as const;

// 액션 타입 상수 추가
const ACTION_TYPES = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  FINISHED: 'FINISHED',
} as const;

const PAGE_SIZE = 6;

export type Room = {
  id: string;
  title: string;
  hostName?: string;
  format?: 'BOARD' | 'GENERAL';
  maxPlayer?: number;
  currentPlayers?: number;
  maxGameRound?: number;
  playTime?: number;
  status: string;
  hasPassword: boolean;
  gameModes?: string[] | null;
  years?: number[];
  roomNumber?: number;
  disabled?: boolean;
};

export type ChannelMember = {
  username: string;
  memberType: 'GUEST' | 'USER';
  inLobby: boolean;
  roomStatus: 'WAITING' | 'IN_PROGRESS' | null;
};

export type MemberLocationUpdateData = {
  username: string;
  location: 'LOBBY' | 'WAITING_ROOM' | 'IN_PROGRESS_ROOM';
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const { channelId } = params as { channelId: string };
  const ctx: ApiContext = {
    req: req as NextApiRequest,
    res: res as NextApiResponse,
  };

  const { success, data } = await userNicknameAPI(ctx);

  if (!success || !data) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  if (
    !channelId ||
    !/^\d+$/.test(channelId) ||
    parseInt(channelId) <= 0 ||
    parseInt(channelId) > 6
  ) {
    return { notFound: true };
  }

  return {
    props: {
      userNickname: data.username,
      channelId,
    },
  };
};

interface LobbyServerProps {
  userNickname: string;
  channelId: string;
}

const LobbyPage = ({ userNickname, channelId }: LobbyServerProps) => {
  const { setNickname } = useNicknameStore();
  const { setCurrentChannelId } = useChannelStore();
  const router = useRouter();

  // 방 관련 상태
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [members, setMembers] = useState<ChannelMember[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState<boolean>(true);

  const currentPageRef = useRef<number>(0);
  const roomsRef = useRef<Room[]>([]);

  const SSE_ENDPOINT = `${process.env.NEXT_PUBLIC_SSE_URL}/${channelId}`;

  const [activeTab, setActiveTab] = useState('chat');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  useEffect(() => {
    setNickname(userNickname);
    setCurrentChannelId(Number(channelId));
  }, [userNickname, channelId, setNickname, setCurrentChannelId]);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const { page } = router.query;
    if (page && !isNaN(Number(page))) {
      const pageNum = Number(page);
      if (pageNum !== currentPage) {
        setCurrentPage(pageNum);
      }
    }
  }, [router.query, currentPage]);

  useEffect(() => {
    setIsLoading(true);

    const fetchInitialData = async () => {
      const { data, success } = await getRoomsAPI(channelId, 0);

      if (!success || !data) {
        setIsLoading(false);
        return;
      }

      setRooms(data.content || []);
      setCurrentPage(data.number || 0);
      setTotalPages(data.totalPages || 1);
      setIsLoading(false);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchChannelMembers = async () => {
      setIsMembersLoading(true);

      const { success, data } = await getChannelUsersAPI(channelId);

      const membersData: ChannelMember[] = [];

      if (success) {
        data.userList.forEach((user: Member) => {
          membersData.push({
            username: user.username,
            memberType: user.memberType,
            inLobby: user.inLobby,
            roomStatus: user.roomStatus,
          });
        });
      }

      const isCurrentUserInList = membersData.some(
        (member: ChannelMember) => member.username === userNickname,
      );

      if (!isCurrentUserInList) {
        membersData.push({
          username: userNickname,
          memberType: 'GUEST',
          inLobby: true,
          roomStatus: null,
        });
      }

      setMembers(membersData);
      setIsMembersLoading(false);
    };

    fetchChannelMembers();
  }, [channelId, userNickname]);

  const handlePageChange = async (newPage: number) => {
    router.push(
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

    const { data, success } = await getRoomsAPI(channelId, newPage);

    if (!success || !data) {
      setIsLoading(false);
      return;
    }

    setRooms(data.content || []);
    setCurrentPage(data.number || newPage);
    setTotalPages(data.totalPages || 1);
  };

  const handleEventData = useCallback(
    (event: MessageEvent, eventName: string) => {
      let data;

      if (eventName === SSE_EVENTS.CONNECT) {
        data = event.data;
        return data;
      }

      data = JSON.parse(event.data);
      return data;
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
            const { data, success } = await getRoomsAPI(channelId, pageNow);

            if (!success || !data) {
              toast.error('방 목록 가져오기 오류');
              setIsLoading(false);
              return;
            }

            const newRoomsData = data.content || [];

            setRooms(currentRooms => {
              const finishedRoomIndex = currentRooms.findIndex(
                (room: Room) => room.id === roomId,
              );

              if (finishedRoomIndex === -1) {
                return currentRooms;
              }

              const remainingRooms = currentRooms.filter(
                (room: Room) => room.id !== roomId,
              );

              if (newRoomsData.length === currentRooms.length) {
                const newRoom = newRoomsData.find(
                  (room: Room) =>
                    !currentRooms.some(
                      (existingRoom: Room) => existingRoom.id === room.id,
                    ),
                );

                if (newRoom) {
                  const result = [...remainingRooms];
                  result.splice(finishedRoomIndex, 0, newRoom);
                  return result;
                }

                return currentRooms;
              } else if (newRoomsData.length < currentRooms.length) {
                return remainingRooms;
              } else {
                const remainingRooms = currentRooms.filter(
                  (room: Room) => room.id !== roomId,
                );

                const newRooms = newRoomsData.filter(
                  (room: Room) =>
                    !currentRooms.some(
                      (existingRoom: Room) => existingRoom.id === room.id,
                    ),
                );

                const result = [...remainingRooms];
                if (newRooms.length > 0) {
                  result.splice(finishedRoomIndex, 0, newRooms[0]);

                  if (newRooms.length > 1) {
                    result.push(...newRooms.slice(1));
                  }
                }

                return result.slice(0, PAGE_SIZE);
              }
            });
          };

          fetchUpdatedRooms();
          return;
        }

        if (
          (data.actionType === ACTION_TYPES.CREATED ||
            data.actionType === ACTION_TYPES.UPDATED) &&
          data.room
        ) {
          const updatedRoom = data.room;

          if (data.actionType === ACTION_TYPES.CREATED) {
            if (pageNow === 0) {
              setRooms(currentRooms => {
                const roomIndex = currentRooms.findIndex(
                  (room: Room) => room.id === updatedRoom.id,
                );

                if (roomIndex !== -1) {
                  const newRooms = [...currentRooms];
                  newRooms[roomIndex] = updatedRoom;
                  return newRooms;
                } else {
                  const newRooms = [updatedRoom, ...currentRooms];
                  if (newRooms.length > PAGE_SIZE) {
                    return newRooms.slice(0, PAGE_SIZE);
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

      // 채널 멤버 관련 이벤트 처리
      // 사용자 입장 이벤트
      eventSource.addEventListener(SSE_EVENTS.USER_JOINED_CHANNEL, event => {
        const data = handleEventData(event, SSE_EVENTS.USER_JOINED_CHANNEL);
        if (!data) return;

        setMembers(current => {
          // 이미 목록에 있는 사용자인지 확인
          const existingIndex = current.findIndex(
            member => member.username === data.username,
          );

          if (existingIndex !== -1) {
            // 사용자가 이미 존재하면 정보 업데이트
            const updatedMembers = [...current];
            updatedMembers[existingIndex] = data;
            return updatedMembers;
          } else {
            // 새 사용자 추가
            return [...current, data];
          }
        });
      });

      // 사용자 퇴장 이벤트
      eventSource.addEventListener(SSE_EVENTS.USER_LEFT_CHANNEL, event => {
        const data = handleEventData(event, SSE_EVENTS.USER_LEFT_CHANNEL);
        if (!data || !data.username) return;

        setMembers(current =>
          current.filter(member => member.username !== data.username),
        );
      });

      // 사용자 위치 업데이트 이벤트
      eventSource.addEventListener(
        SSE_EVENTS.MEMBER_LOCATION_UPDATED,
        event => {
          const data = handleEventData(
            event,
            SSE_EVENTS.MEMBER_LOCATION_UPDATED,
          ) as MemberLocationUpdateData;
          if (!data || !data.username || !data.location) return;

          setMembers(current => {
            return current.map(member => {
              if (member.username === data.username) {
                // 위치에 따른 멤버 상태 업데이트
                switch (data.location) {
                  case 'LOBBY':
                    return { ...member, inLobby: true, roomStatus: null };
                  case 'WAITING_ROOM':
                    return { ...member, inLobby: false, roomStatus: 'WAITING' };
                  case 'IN_PROGRESS_ROOM':
                    return {
                      ...member,
                      inLobby: false,
                      roomStatus: 'IN_PROGRESS',
                    };
                  default:
                    return member;
                }
              }
              return member;
            });
          });

          // 위치 업데이트 발생 시 내 정보가 목록에 없는 경우를 확인
          if (data.username === userNickname) {
            setMembers(current => {
              const isCurrentUserInList = current.some(
                member => member.username === userNickname,
              );

              if (!isCurrentUserInList) {
                // 내 정보를 적절한 상태로 추가
                let myStatus: 'WAITING' | 'IN_PROGRESS' | null = null;
                let inLobby = false;

                switch (data.location) {
                  case 'LOBBY':
                    inLobby = true;
                    myStatus = null;
                    break;
                  case 'WAITING_ROOM':
                    myStatus = 'WAITING';
                    break;
                  case 'IN_PROGRESS_ROOM':
                    myStatus = 'IN_PROGRESS';
                    break;
                }

                return [
                  ...current,
                  {
                    username: userNickname,
                    memberType: 'USER',
                    inLobby,
                    roomStatus: myStatus,
                  },
                ];
              }

              return current;
            });
          }
        },
      );
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [handleEventData, PAGE_SIZE, SSE_ENDPOINT, channelId]);

  // SSE 연결 끊겼을 때 처리
  useEffect(() => {
    if (!sseConnected) {
      setCurrentPage(0);
      setTotalPages(1);
    }
  }, [sseConnected]);

  // 페이지 언로드 시 연결 해제 처리
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(`${process.env.NEXT_PUBLIC_SSE_URL}/disconnect`);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return (
    <div className='flex h-screen flex-col bg-[url(/background.svg)] bg-cover bg-center'>
      <SEO title='로비' />
      <BackgroundMusic pageType='lobby' />
      <Header channelId={channelId} />
      <main className='flex flex-1 overflow-hidden'>
        <section className='m-10 flex flex-1 flex-col rounded-2xl bg-gradient-to-r from-[#4F719C]/80 to-[#5F4EA0]/80 p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <div className='text-2xl font-bold text-white'>게임 방 목록</div>
            <div className='mt-2 text-center text-sm font-medium text-white'>
              {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : '0 / 0'}
            </div>
            <div>
              <RoomSearchDialog />
              <CreateRoomButton />
            </div>
          </div>
          <div className='neon-scrollbar flex-1 items-center overflow-y-auto'>
            <RoomList
              rooms={rooms}
              isLoading={isLoading}
              sseConnected={sseConnected}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
        <section className='flex w-1/5 flex-col pt-3 text-white'>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className='flex h-full flex-col gap-0'
          >
            <TabsList className='flex flex-row space-x-1 bg-transparent p-0'>
              <TabsTrigger
                className='h-[45px] w-[120px] rounded-lg rounded-br-none rounded-bl-none bg-black/70 text-lg font-bold text-[#30FFFF] data-[state=active]:bg-[#1C8C9A] data-[state=active]:text-white data-[state=inactive]:bg-black/10 data-[state=inactive]:text-[#30FFFF] data-[state=inactive]:hover:cursor-pointer'
                value='chat'
              >
                채팅
              </TabsTrigger>
              <TabsTrigger
                className='h-[45px] w-[120px] rounded-lg rounded-br-none rounded-bl-none bg-black/70 text-lg font-bold text-[#30FFFF] data-[state=active]:bg-[#1C8C9A] data-[state=active]:text-white data-[state=inactive]:bg-black/10 data-[state=inactive]:text-[#30FFFF] data-[state=inactive]:hover:cursor-pointer'
                value='members'
              >
                멤버 목록
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value='chat'
              className='flex-grow overflow-hidden border-t-5 border-[#1C8C9A] bg-black/50'
            >
              <ChatBox channelId={channelId} />
            </TabsContent>

            <TabsContent
              value='members'
              className='flex-grow overflow-hidden border-t-5 border-[#1C8C9A] bg-black/50'
            >
              <ChannelMemberList
                members={members}
                isLoading={isMembersLoading}
                sseConnected={sseConnected}
              />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
};

export default LobbyPage;
