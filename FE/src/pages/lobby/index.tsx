import SocketLayout from '@/components/layouts/SocketLayout';

import Header from '@/components/lobby/Header';
import RoomList from '@/components/lobby/RoomList';
import ChatBox from '@/components/lobby/ChatBox';
import CreateRoomButton from '@/components/lobby/CreateRoomButton';
import { GetServerSideProps } from 'next';
import { getCookie } from 'cookies-next';
import { useEffect } from 'react';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

export type Room = {
  id: number;
  title: string;
  hostName: string;
  format: string;
  maxPlayer: number;
  currentPlayers: number;
  maxGameRound: number;
  playTime: number;
  status: string;
  hasPassword: boolean;
  gameModes: string[] | null;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const userNickname = (await getCookie('userNickname', { req, res })) || '';

  if (!userNickname) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userNickname,
    },
  };
};

const LobbyPage = ({ userNickname }: { userNickname: string }) => {
  const { setNickname, nickname } = useNicknameStore();

  useEffect(() => {
    setNickname(userNickname);
  }, [userNickname]);

  const initialRooms: Room[] = [
    // 1. 일반 열린 방
    {
      id: 1234,
      title: '즐거운 노래방',
      hostName: 'user_abc123',
      format: 'GENERAL',
      maxPlayer: 8,
      currentPlayers: 3,
      maxGameRound: 20,
      playTime: 0,
      status: 'WAITING',
      hasPassword: false,
      gameModes: ['전곡 모드'],
    },
    // 2. 잠금방 (입장 가능)
    {
      id: 2345,
      title: '비밀 노래방 파티',
      hostName: 'user_def456',
      format: 'GENERAL',
      maxPlayer: 6,
      currentPlayers: 2,
      maxGameRound: 15,
      playTime: 0,
      status: 'WAITING',
      hasPassword: true,
      gameModes: ['전곡 모드', '1초 모드'],
    },
    // 3. 인원이 모두 찬 방
    {
      id: 3456,
      title: '인기 폭발 노래방',
      hostName: 'user_ghi789',
      format: 'GENERAL',
      maxPlayer: 8,
      currentPlayers: 8,
      maxGameRound: 25,
      playTime: 0,
      status: 'WAITING',
      hasPassword: false,
      gameModes: ['전곡 모드', '1초 모드', 'AI 모드'],
    },
    // 4. 잠금방이면서 인원이 모두 찬 방
    {
      id: 4567,
      title: 'VIP 클럽 노래방',
      hostName: 'user_jkl012',
      format: 'PREMIUM',
      maxPlayer: 4,
      currentPlayers: 4,
      maxGameRound: 30,
      playTime: 0,
      status: 'WAITING',
      hasPassword: true,
      gameModes: ['전곡 모드', '1초 모드', 'AI 모드'],
    },
    // 5. 긴 이름을 가진 방 (UI 테스트용)
    {
      id: 8901,
      title:
        '매우매우매우매우매우매우매우매우매우매우매우매우매우매우매우 긴 이름의 노래방',
      hostName: 'user_mno345',
      format: 'GENERAL',
      maxPlayer: 6,
      currentPlayers: 3,
      maxGameRound: 20,
      playTime: 0,
      status: 'WAITING',
      hasPassword: true,
      gameModes: ['전곡 모드', '1초 모드', 'AI 모드'],
    },
    // 6. 새로운 샘플 - 게임 모드가 null인 경우
    {
      id: 5678,
      title: '신규 노래방',
      hostName: 'user_pqr678',
      format: 'GENERAL',
      maxPlayer: 10,
      currentPlayers: 1,
      maxGameRound: 20,
      playTime: 0,
      status: 'WAITING',
      hasPassword: false,
      gameModes: null,
    },
  ];

  return (
    <SocketLayout>
      <div className='flex flex-col h-screen bg-gray-100'>
        <Header nickname={nickname} />
        <div className='flex flex-1 overflow-hidden'>
          <div className='flex-1 p-6 flex flex-col'>
            <div className='flex justify-between items-center mb-6'>
              <h1 className='text-2xl font-bold text-gray-900'>게임 방 목록</h1>
              <CreateRoomButton />
            </div>

            <div className='flex-1 overflow-y-auto'>
              <RoomList rooms={initialRooms} />
            </div>
          </div>

          <div className='w-80 border-l border-gray-300 bg-white'>
            <ChatBox />
          </div>
        </div>
      </div>
    </SocketLayout>
  );
};

export default LobbyPage;
