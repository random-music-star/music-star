import { useEffect } from 'react';

import { getCookie } from 'cookies-next';
import { GetServerSideProps } from 'next';

import ChatBox from '@/components/lobby/ChatBox';
import CreateRoomButton from '@/components/lobby/CreateRoomButton';
import Header from '@/components/lobby/Footer';
import RoomList from '@/components/lobby/RoomList';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { useChannelStore } from '@/stores/lobby/useChannelStore';

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
  years: number[];
  roomNumber: number;
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const userNickname = (await getCookie('userNickname', { req, res })) || '';
  const { channelId } = params as { channelId: string };

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

  useEffect(() => {
    setNickname(userNickname);
    setCurrentChannelId(Number(channelId));
  }, [userNickname, channelId, setNickname, setCurrentChannelId]);

  return (
    <div className='flex h-screen flex-col bg-[url(/background.svg)] bg-cover bg-center'>
      <main className='flex flex-1 overflow-hidden'>
        <section className='m-10 flex flex-1 flex-col bg-gradient-to-r from-[#4F719C]/80 to-[#5F4EA0]/80 p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-white'>게임 방 목록</h1>
            <CreateRoomButton />
          </div>
          <RoomList channelId={channelId} />
        </section>
        <section className='w-2/10 bg-black/50 text-white'>
          <ChatBox />
        </section>
      </main>
      <Header channelId={channelId} />
    </div>
  );
};

export default LobbyPage;
