import { useEffect, useState } from 'react';

import { getCookie } from 'cookies-next';
import { AnimatePresence, motion } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import NavigationDialog from '@/components/game-room/NavigationDialog';
import SocketLayout from '@/components/layouts/SocketLayout';
import usePrompt from '@/hooks/useNavigationBlocker';
import { useNicknameStore } from '@/stores/auth/useNicknameStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

import ChatBox from '../../components/game-room/ChatBox';
import GameBoard from '../../components/game-room/GameBoard';
import ReadyPanel from '../../components/game-room/ReadyPannel';
import RoomInfo from '../../components/game-room/RoomInfo';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const userNickname = (await getCookie('userNickname', { req, res })) || '';

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
    },
  };
};

export default function GameRoom({ userNickname }: { userNickname: string }) {
  const router = useRouter();

  const { setNickname, nickname } = useNicknameStore();
  const { isConnected, updateSubscription, sendMessage } = useWebSocketStore();
  const { isBlocked, handleProceed, handleCancel } = usePrompt();

  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    setNickname(userNickname);
  }, [userNickname]);

  useEffect(() => {
    if (isConnected) {
      updateSubscription('game-room');
    }
  }, [isConnected]);

  const handleGameProceed = () => {
    router.push('/');
    handleProceed();
  };

  const handleStartGame = () => {
    sendMessage(`/app/channel/1/room/1/start`, {
      type: 'gameStart',
      request: null,
    });

    setIsGameStarted(true);
  };

  return (
    <SocketLayout>
      <div className='flex flex-1 gap-4 overflow-hidden p-4'>
        <div className='flex flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-lg'>
          <div className='flex-1 overflow-hidden'>
            <AnimatePresence mode='wait'>
              {!isGameStarted ? (
                <motion.div
                  key='ready-panel'
                  className='h-full'
                  initial={{ opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ReadyPanel
                    currentUserId={nickname}
                    handleStartGame={handleStartGame}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key='game-board'
                  className='h-full'
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <GameBoard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className='h-2/5 border-t-2 border-gray-200'>
            <ChatBox currentUserId={nickname} />
          </div>
        </div>
        <div className='flex w-1/4 flex-col overflow-hidden rounded-xl bg-white shadow-lg'>
          <div className='bg-indigo-600 p-4 font-bold text-white'>
            <h2>방 정보</h2>
          </div>
          <RoomInfo />
        </div>

        {/* 리팩토링 필요 NavigationDialog 컴포넌트 + usePrompt 훅 */}
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
