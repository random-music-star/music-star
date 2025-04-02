import { useEffect } from 'react';

import { getCookie } from 'cookies-next';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import ChatBox from '@/components/game-room/ChatBox';
import GameExitButton from '@/components/game-room/GameExitButton';
import BoardMap from '@/components/game-room/boardMap';
import RoomPannel from '@/components/game-room/gameRoomInfo/RoomPannel';
import ReadyPanel from '@/components/game-room/gameWait/ReadyPanel';
import ScoreMap from '@/components/game-room/scoreMap';
import WaitingRoom from '@/components/game-room/scoreMap/ScoreWaiting';
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

interface GameRoomServerProps {
  userNickname: string;
  roomId: string;
  channelId: string;
}

export default function GameRoom({
  userNickname,
  roomId,
  channelId,
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
      updateSubscription('game-room', channelId, roomId);
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
    sendMessage(`/app/channel/${channelId}/room/${roomId}/start`, {
      type: 'gameStart',
      request: null,
    });
  };

  if (gameState === 'REFUSED') {
    router.push('/game/lobby');
  }

  const isBoardFormat = gameRoomInfo?.format === 'BOARD';
  const isWaiting = gameRoomInfo === null || gameRoomInfo.status === 'WAITING';

  // BOARD 포맷
  if (isBoardFormat) {
    if (isWaiting) {
      return (
        <div className='flex flex-1 justify-between bg-[url(/background.svg)] bg-cover bg-center'>
          <div className='relative w-full'>
            <ReadyPanel
              currentUserId={nickname}
              handleStartGame={handleStartGame}
              roomId={roomId}
              channelId={channelId}
            />
            <GameExitButton />
          </div>

          <div className='flex max-h-screen min-h-screen w-[480px] max-w-[480px] flex-col flex-wrap items-center gap-5 bg-black/50 text-white'>
            <RoomPannel />
            <div className='w-full flex-1 overflow-hidden'>
              <ChatBox
                currentUserId={nickname}
                roomId={roomId}
                channelId={channelId}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='flex flex-1 justify-between bg-[url(/background.svg)] bg-cover bg-center'>
        <div className='relative w-full'>
          <BoardMap />
          <GameExitButton />
        </div>

        <div className='flex max-h-screen min-h-screen w-[480px] max-w-[480px] flex-col flex-wrap items-center gap-5 bg-black/50 text-white'>
          <div className='w-full flex-1 overflow-hidden'>
            <ChatBox
              currentUserId={nickname}
              roomId={roomId}
              channelId={channelId}
            />
          </div>
        </div>
      </div>
    );
  }

  // GENERAL 또는 SCORE 포맷
  if (gameRoomInfo?.format === 'GENERAL') {
    return (
      <div className='flex flex-1 justify-between bg-[url(/background.svg)] bg-cover bg-center'>
        <div className='relative w-full'>
          <div className='relative h-screen w-full overflow-hidden'>
            {/* 대기 화면 (WaitingRoom) */}
            <div
              className={cn(
                isWaiting ? 'translate-y-0' : '-translate-y-full',
                'transition-transform duration-700 ease-in-out',
              )}
            >
              <WaitingRoom
                currentUserId={nickname}
                handleStartGame={handleStartGame}
                roomId={roomId}
                channelId={channelId}
              />
            </div>

            {/* 게임 화면 (ScoreMap) */}
            <div
              className={cn(
                'absolute top-0 left-0 h-full w-full transition-transform duration-700 ease-in-out',
                isWaiting ? 'translate-y-full' : 'translate-y-0',
              )}
            >
              <ScoreMap
                roomId={roomId}
                nickname={nickname}
                channelId={channelId}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
