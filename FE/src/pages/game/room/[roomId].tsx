import { useEffect } from 'react';

import { getCookie } from 'cookies-next';
import { AnimatePresence } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import ChatBox from '@/components/game-room/ChatBox';
import GameExitButton from '@/components/game-room/GameExitButton';
import GameBoardMap from '@/components/game-room/boardMap';
import GamePlaySection from '@/components/game-room/gamePlaySection';
import RoomPannel from '@/components/game-room/gameRoomInfo/RoomPannel';
import ReadyPanel from '@/components/game-room/gameWait/ReadyPanel';
import ScoreMap from '@/components/game-room/scoreMap';
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
        destination: '/',
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

  // roomInfo가 Board 형식인지 확인
  const isBoardFormat = gameRoomInfo?.format === 'BOARD';

  // 게임 대기 중인지 확인
  const isWaiting = gameRoomInfo === null || gameRoomInfo.status === 'WAITING';

  return (
    <div className='flex flex-1 justify-between bg-[url(/background.svg)] bg-cover bg-center'>
      <AnimatePresence mode='wait'>
        {isWaiting ? (
          // 대기 화면
          <div className='relative w-full'>
            <ReadyPanel
              currentUserId={nickname}
              handleStartGame={handleStartGame}
              roomId={roomId}
            />
            <GameExitButton />
          </div>
        ) : isBoardFormat ? (
          // Board 형식 게임
          <div className='relative w-full'>
            <div className='relative h-screen w-full overflow-hidden'>
              <div
                className={cn(
                  gameState === 'SCORE_UPDATE'
                    ? '-translate-y-full'
                    : 'translate-y-0',
                  'transition-transform duration-700 ease-in-out',
                )}
              >
                <GamePlaySection />
              </div>
              <div
                className={cn(
                  'absolute top-0 left-0 h-full w-full transition-transform duration-700 ease-in-out',
                  gameState === 'SCORE_UPDATE'
                    ? 'translate-y-0'
                    : 'translate-y-full',
                )}
              >
                <GameBoardMap />
              </div>
            </div>
            <GameExitButton />
          </div>
        ) : (
          <ScoreMap roomId={roomId} nickname={nickname} />
        )}
      </AnimatePresence>

      {/* 오른쪽 사이드바 - Board 형식이거나 대기 중일 때만 표시 */}
      {(isBoardFormat || isWaiting) && (
        <div className='flex max-h-screen min-h-screen w-[480px] max-w-[480px] flex-col flex-wrap items-center gap-5 bg-black/50 text-white'>
          {gameRoomInfo?.status === 'WAITING' && <RoomPannel />}
          <div className='w-full flex-1 overflow-hidden'>
            <ChatBox currentUserId={nickname} roomId={roomId} />
          </div>
        </div>
      )}
    </div>
  );
}
