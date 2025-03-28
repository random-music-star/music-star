import { useEffect } from 'react';

import { getCookie } from 'cookies-next';
import { GetServerSideProps } from 'next';

import ChatBox from '@/components/lobby/ChatBox';
import CreateRoomButton from '@/components/lobby/CreateRoomButton';
import Header from '@/components/lobby/Header';
import RoomList from '@/components/lobby/RoomList';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';

export type Room = {
  id: number;
  title: string;
  hostName: string;
  format: 'BOARD' | 'GENERAL';
  maxPlayer: number;
  currentPlayers: number;
  maxGameRound: number;
  playTime: number;
  status: string;
  hasPassword: boolean;
  gameModes: string[] | null;
  selectedYears: number[];
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const userNickname = (await getCookie('userNickname', { req, res })) || '';

  return {
    props: {
      userNickname,
    },
  };
};

const LobbyPage = ({ userNickname }: { userNickname: string }) => {
  const { setNickname } = useNicknameStore();

  useEffect(() => {
    setNickname(userNickname);
  }, [userNickname, setNickname]);

  return (
    <div className='flex h-screen flex-col bg-[url(/background.svg)] bg-cover bg-center'>
      <div className='flex flex-1 overflow-hidden'>
        <Header />
        <div className='flex flex-1 flex-col p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-gray-900'>게임 방 목록</h1>
            <CreateRoomButton />
          </div>

          <div className='flex-1 overflow-y-auto'>
            <RoomList />
          </div>
        </div>

        <div className='w-80 bg-black/50 text-white'>
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
