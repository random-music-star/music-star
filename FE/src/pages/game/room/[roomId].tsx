import { useEffect } from 'react';

import { getCookie } from 'cookies-next';
import { AnimatePresence } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import ChatBox from '@/components/game-room/ChatBox';
import GameBoard from '@/components/game-room/GameBoard';
import GameExit from '@/components/game-room/GameExit';
import GamePlay from '@/components/game-room/gamePlay';
import RoomPannel from '@/components/game-room/gameRoomInfo/RoomPannel';
import ReadyPanel from '@/components/game-room/gameWait/ReadyPanel';
import { cn } from '@/lib/utils';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  const userNickname = (await getCookie('userNickname', { req, res })) || '';
  const { roomId } = params as { roomId: string };

  if (!userNickname) {
    return {
      redirect: {
        destination: '/game/lobby',
        permanent: false,
      },
    };
  }

  return {
    props: {
      userNickname,
      roomId,
    },
  };
};

interface GameRoomServerProps {
  userNickname: string;
  roomId: string;
}

export default function GameRoom({
  userNickname,
  roomId,
}: GameRoomServerProps) {
  const router = useRouter();

  const { setNickname, nickname } = useNicknameStore();
  const { isConnected, updateSubscription, sendMessage } = useWebSocketStore();
  const { gameRoomInfo } = useGameInfoStore();
  const { gameState } = useGameStateStore();

  useEffect(() => {
    setNickname(userNickname);
  }, [userNickname]);

  useEffect(() => {
    if (isConnected) {
      updateSubscription('game-room', roomId);
    }
  }, [isConnected]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleStartGame = () => {
    sendMessage(`/app/channel/1/room/${roomId}/start`, {
      type: 'gameStart',
      request: null,
    });
  };

  if (gameState === 'REFUSED') {
    router.push('/game/lobby');
  }

  return (
    <div className='flex flex-1 justify-between bg-[url(/background.svg)] bg-cover bg-center'>
      <AnimatePresence mode='wait'>
        <div className='relative w-full'>
          {gameRoomInfo === null || gameRoomInfo.status === 'WAITING' ? (
            <ReadyPanel
              currentUserId={nickname}
              handleStartGame={handleStartGame}
              roomId={roomId}
            />
          ) : (
            <div className='relative h-screen w-full overflow-hidden'>
              <div
                className={cn(
                  gameState === 'SCORE_UPDATE'
                    ? '-translate-y-full'
                    : 'translate-y-0',
                  'duration-700 ease-in-out',
                )}
              >
                <GamePlay />
              </div>
              <div
                className={cn(
                  'absolute top-0 left-0 h-full w-full transition-transform duration-700 ease-in-out',
                  gameState === 'SCORE_UPDATE'
                    ? 'translate-y-0'
                    : 'translate-y-full',
                )}
              >
                <GameBoard />
              </div>
            </div>
          )}
          <div className='absolute right-0 bottom-0 p-6 text-end'>
            <GameExit />
          </div>
        </div>
      </AnimatePresence>
      <div className='flex max-h-screen min-h-screen w-[480px] max-w-[480px] flex-col flex-wrap items-center gap-5 bg-black/50 text-white'>
        {gameRoomInfo?.status === 'WAITING' && <RoomPannel />}
        <div className='w-full flex-1 overflow-hidden'>
          <ChatBox currentUserId={nickname} roomId={roomId} />
        </div>
      </div>
    </div>
  );
}
