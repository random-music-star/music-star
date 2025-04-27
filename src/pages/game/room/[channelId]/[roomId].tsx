import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';

import { ApiContext } from '@/api/core';
import { userNicknameAPI } from '@/api/member';
import SEO from '@/components/SEO';
import GameRoomContainer from '@/components/room/RoomContainer';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const ctx: ApiContext = {
    req: req as NextApiRequest,
    res: res as NextApiResponse,
  };

  const result = await userNicknameAPI(ctx);

  const userNickname = result.data?.username || '';

  const { roomId, channelId } = params as { roomId: string; channelId: string };

  if (!result.data?.username) {
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
