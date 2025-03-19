import { useEffect } from 'react';

import { getCookie } from 'cookies-next';
import { AnimatePresence } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import ChatBox from '@/components/game-room/ChatBox';
import GameBoard from '@/components/game-room/GameBoard';
import NavigationDialog from '@/components/game-room/NavigationDialog';
import ReadyPanel from '@/components/game-room/ReadyPannel';
import RoomInfo from '@/components/game-room/RoomInfo';
import usePrompt from '@/hooks/useNavigationBlocker';
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
        destination: 'game/lobby',
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
  const { isConnected, updateSubscription, sendMessage, checkSubscription } =
    useWebSocketStore();
  const { isBlocked, handleProceed, handleCancel } = usePrompt();
  const { gameRoomInfo } = useGameInfoStore();

  const { gameState } = useGameStateStore();

  useEffect(() => {
    setNickname(userNickname);
  }, [userNickname]);

  useEffect(() => {
    if (isConnected && !checkSubscription('game-room')) {
      updateSubscription('game-room', roomId);
    }
  }, [isConnected]);

  const handleGameProceed = () => {
    router.push('/');
    handleProceed();
  };

  const handleStartGame = () => {
    sendMessage(`/app/channel/1/room/${roomId}/start`, {
      type: 'gameStart',
      request: null,
    });
  };

  if (gameState === 'REFUSED') {
    // refused 상태라면, 로비로 라우팅
    // 테스트 필요
    router.push('game/lobby');
  }

  return (
    <div className='flex flex-1 gap-4 overflow-hidden p-4'>
      <div className='flex flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-lg'>
        <div className='flex-1 overflow-hidden'>
          <AnimatePresence mode='wait'>
            {gameRoomInfo === null || gameRoomInfo.status === 'WAITING' ? (
              <ReadyPanel
                currentUserId={nickname}
                handleStartGame={handleStartGame}
                roomId={roomId}
              />
            ) : (
              <GameBoard />
            )}
          </AnimatePresence>
        </div>
        <ChatBox currentUserId={nickname} roomId={roomId} />
      </div>
      <RoomInfo />
      <NavigationDialog
        isOpen={isBlocked}
        onProceed={handleGameProceed}
        onCancel={handleCancel}
        title='게임을 종료하시겠습니까?'
        description='기권 처리 된 후, 로비로 이동합니다.'
      />
    </div>
  );
}
