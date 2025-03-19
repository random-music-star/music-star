import { useEffect } from 'react';

import { getCookie } from 'cookies-next';
import { AnimatePresence } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import GameBoard from '@/components/game-room/GameBoard';
import NavigationDialog from '@/components/game-room/NavigationDialog';
import SocketLayout from '@/components/layouts/SocketLayout';
import TChatBox from '@/components/test/TChatBox';
import TReadyPannel from '@/components/test/TReadyPannel';
import TRoomPannel from '@/components/test/TRoomPannel';
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
        destination: '/lobby',
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
  const { isBlocked, handleProceed, handleCancel } = usePrompt();
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
    router.push('/lobby');
  }

  return (
    <SocketLayout>
      <div className='flex flex-1 bg-[url(/background.svg)] bg-cover bg-center'>
        <AnimatePresence mode='wait'>
          {gameRoomInfo === null || gameRoomInfo.status === 'WAITING' ? (
            <TReadyPannel
              currentUserId={nickname}
              handleStartGame={handleStartGame}
              roomId={roomId}
            />
          ) : (
            // 게임
            <GameBoard />
          )}
        </AnimatePresence>
        <div className='flex max-h-screen min-h-screen w-[480px] flex-grow flex-col items-center gap-5 bg-black/50 text-white'>
          <TRoomPannel />
          <TChatBox currentUserId={nickname} roomId={roomId} />
        </div>
        <NavigationDialog
          isOpen={isBlocked}
          onProceed={handleGameProceed}
          onCancel={handleCancel}
          title='게임을 종료하시겠습니까?'
          description='기권 처리 된 후, 로비로 이동합니다.'
        />
      </div>
    </SocketLayout>
  );
}
