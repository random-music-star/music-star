// pages/game-room/index.tsx
import { useEffect, useState } from 'react';
import ChatBox from '../../components/game-room/ChatBox';
import RoomInfo from '../../components/game-room/RoomInfo';
import { roomData, userData } from '../../_data/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import GameBoard from '../../components/game-room/GameBoard';
import ReadyPanel from '../../components/game-room/ReadyPannel';
import SocketLayout from '@/components/layouts/SocketLayout';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

export default function GameRoom() {
  const { isConnected, updateSubscription } = useWebSocketStore();

  const currentUserId = 'user1';
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [readyStatus, setReadyStatus] = useState<{ [key: string]: boolean }>(
    () => {
      const initialStatus: { [key: string]: boolean } = {};
      userData.forEach(user => {
        initialStatus[user.id] = user.isReady || false;
      });
      return initialStatus;
    },
  );

  const isHost =
    userData.find(user => user.id === currentUserId)?.role === 'host';

  const allPlayersReady = Object.values(readyStatus).every(
    status => status === true,
  );

  const toggleReady = (userId: string) => {
    setReadyStatus(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  useEffect(() => {
    if (isConnected) {
      updateSubscription('game-room');
    }
  }, [isConnected]);

  const handleStartGame = () => {
    setIsGameStarted(true);
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
                    users={userData}
                    readyStatus={readyStatus}
                    currentUserId={currentUserId}
                    toggleReady={toggleReady}
                    isHost={isHost}
                    handleStartGame={handleStartGame}
                    allPlayersReady={allPlayersReady}
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
          <RoomInfo room={roomData} />
        </div>
      </div>
    </SocketLayout>
  );
}
