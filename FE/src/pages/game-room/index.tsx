// pages/game-room/index.tsx
import { useState } from 'react';
import Head from 'next/head';
import ChatBox from './_components/ChatBox';
import RoomInfo from './_components/RoomInfo';
import { Button } from '@/components/ui/button';
import { roomData, userData } from './_data/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import GameBoard from './_components/GameBoard';
import ReadyPanel from './_components/ReadyPannel';
import SocketLayout from '@/components/layouts/SocketLayout';

export default function GameRoom() {
  const currentUserId = 'user1'; // 현재 접속한 사용자 ID
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

  // 현재 사용자가 방장인지 확인
  const isHost =
    userData.find(user => user.id === currentUserId)?.role === 'host';

  // 모든 사용자가 준비 완료 상태인지 확인
  const allPlayersReady = Object.values(readyStatus).every(
    status => status === true,
  );

  const toggleReady = (userId: string) => {
    setReadyStatus(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  const handleEndGame = () => {
    setIsGameStarted(false);
  };

  return (
    <SocketLayout>
      <div className='flex flex-col h-screen bg-indigo-600'>
        <Head>
          <title>{roomData.name} | 게임 대기실</title>
        </Head>

        {/* 헤더 - 게임 이름 */}
        <header className='bg-indigo-700 text-white py-3 px-6 shadow-md'>
          <h1 className='text-2xl font-bold'>{roomData.name}</h1>
        </header>

        {/* 메인 콘텐츠 */}
        <div className='flex flex-1 overflow-hidden p-4 gap-4'>
          {/* 왼쪽 영역 - 준비 패널/게임 보드 */}
          <div className='flex-1 flex flex-col bg-white rounded-xl shadow-lg overflow-hidden'>
            {/* 플레이어 준비 상태 또는 게임 보드 */}
            <div className='flex-1 overflow-hidden'>
              <AnimatePresence mode='wait'>
                {!isGameStarted ? (
                  // 준비 화면
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
                  // 게임 보드
                  <motion.div
                    key='game-board'
                    className='h-full'
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <GameBoard />

                    {isHost && (
                      <div className='absolute bottom-8 right-8'>
                        <Button
                          className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 font-bold'
                          onClick={handleEndGame}
                        >
                          게임 종료
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 채팅 영역 - 높이 증가 */}
            <div className='h-2/5 border-t-2 border-gray-200'>
              <ChatBox currentUserId={currentUserId} />
            </div>
          </div>

          {/* 오른쪽 - 방 정보 */}
          <div className='w-1/4 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col'>
            <div className='p-4 bg-indigo-600 text-white font-bold'>
              <h2>방 정보</h2>
            </div>
            <RoomInfo room={roomData} />
          </div>
        </div>
      </div>
    </SocketLayout>
  );
}
