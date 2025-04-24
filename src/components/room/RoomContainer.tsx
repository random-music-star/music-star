import { useEffect } from 'react';

import { useRouter } from 'next/router';

import BackgroundMusic from '@/components/common/BackgroundMusic';
import ChatBox from '@/components/game-room/ChatBox';
import GameExitButton from '@/components/game-room/GameExitButton';
import BoardMap from '@/components/game-room/boardMap';
import RoomPannel from '@/components/game-room/gameRoomInfo/RoomPannel';
import ReadyPanel from '@/components/game-room/gameWait/ReadyPanel';
import ScoreMap from '@/components/game-room/scoreMap';
import WaitingRoom from '@/components/game-room/scoreMap/ScoreWaiting';
import { cn } from '@/lib/utils';
import { GameRoomServerProps } from '@/pages/game/room/[channelId]/[roomId]';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

export default function GameRoomContainer({
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
    router.push(`/game/lobby/${channelId}`);
  }

  const isBoardFormat = gameRoomInfo?.format === 'BOARD';
  const isWaiting = gameRoomInfo?.status === 'WAITING';

  // BOARD 포맷
  if (isBoardFormat) {
    if (isWaiting) {
      return (
        <div className='flex flex-1 justify-between bg-[url(/background.svg)] bg-cover bg-center'>
          <BackgroundMusic pageType='waitingRoom' />
          <div className='relative w-full'>
            <ReadyPanel
              currentUserId={nickname}
              handleStartGame={handleStartGame}
              roomId={roomId}
              channelId={channelId}
            />
            <GameExitButton />
          </div>

          <div className='flex max-h-screen min-h-screen w-[480px] grid-rows-[1fr_4fr] flex-col flex-wrap items-center'>
            <RoomPannel />
            <ChatBox
              currentUserId={nickname}
              roomId={roomId}
              channelId={channelId}
            />
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

        <div className='flex max-h-screen min-h-screen w-[480px] max-w-[480px] flex-col flex-wrap items-center gap-5'>
          <ChatBox
            currentUserId={nickname}
            roomId={roomId}
            channelId={channelId}
          />
        </div>
      </div>
    );
  }

  if (gameRoomInfo?.format === 'GENERAL') {
    return (
      <div className='flex flex-1 justify-between bg-[url(/background.svg)] bg-cover bg-center'>
        <div className='relative w-full'>
          <div className='relative h-screen w-full overflow-hidden'>
            <div
              className={cn(
                isWaiting ? 'translate-y-0' : '-translate-y-full',
                'transition-transform duration-700 ease-in-out',
              )}
            >
              <BackgroundMusic pageType='waitingRoom' />
              <WaitingRoom
                currentUserId={nickname}
                handleStartGame={handleStartGame}
                roomId={roomId}
                channelId={channelId}
              />
            </div>

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
