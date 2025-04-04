import { getCookie } from 'cookies-next';
import { GetServerSideProps } from 'next';

import SEO from '@/components/SEO';
import GameRoomContainer from '@/components/room/RoomContainer';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const userNickname = (await getCookie('userNickname', { req, res })) || '';
  const { roomId, channelId } = params as { roomId: string; channelId: string };

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
      roomId,
      channelId,
    },
  };
};

export interface GameRoomServerProps {
  userNickname: string;
  roomId: string;
  channelId: string;
}

const GameRoom = ({ userNickname, roomId, channelId }: GameRoomServerProps) => {
  return (
    <>
      <SEO title='게임' />
      <GameRoomContainer
        userNickname={userNickname}
        roomId={roomId}
        channelId={channelId}
      />
    </>
  );
};

export default GameRoom;
