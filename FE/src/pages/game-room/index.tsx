import { useEffect, useState } from 'react';
import ChatBox from '../../components/game-room/ChatBox';
import RoomInfo from '../../components/game-room/RoomInfo';
import { motion, AnimatePresence } from 'framer-motion';
import GameBoard from '../../components/game-room/GameBoard';
import ReadyPanel from '../../components/game-room/ReadyPannel';
import SocketLayout from '@/components/layouts/SocketLayout';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';
import { useRouter } from 'next/router';
import usePrompt from '@/hooks/useNavigationBlocker';
import NavigationDialog from '@/components/game-room/NavigationDialog';
import { useGameChatStore } from '@/stores/websocket/useGameChatStore';

export default function GameRoom() {
  const router = useRouter();

  const { isConnected, updateSubscription, sendMessage } = useWebSocketStore();
  const { isBlocked, handleProceed, handleCancel } = usePrompt();

  const [currentUserId, setCurrentUserId] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    const userName = localStorage.getItem('userNickname') as string;
    if (userName) {
      setCurrentUserId(userName);
    }
  }, []);

  const { setGameChattings } = useGameChatStore();

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

    setGameChattings({
      sender: 'system',
      messageType: 'notice',
      message: `곧 다음 라운드가 시작됩니다. `,
    });
  };

  return (
    <SocketLayout>
      <div className='flex flex-1 overflow-hidden p-4 gap-4'>
        <div className='flex-1 flex flex-col bg-white rounded-xl shadow-lg overflow-hidden'>
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
                    currentUserId={currentUserId}
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
            <ChatBox currentUserId={currentUserId} />
          </div>
        </div>
        <div className='w-1/4 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col'>
          <div className='p-4 bg-indigo-600 text-white font-bold'>
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
