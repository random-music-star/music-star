// pages/game-room/_components/ReadyPanel.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { User } from '../_types/game';
import { motion } from 'framer-motion';

interface ReadyPanelProps {
  users: User[];
  readyStatus: { [key: string]: boolean };
  currentUserId: string;
  toggleReady: (userId: string) => void;
  isHost: boolean;
  handleStartGame: () => void;
  allPlayersReady: boolean;
}

export default function ReadyPanel({
  users,
  readyStatus,
  currentUserId,
  toggleReady,
  isHost,
  handleStartGame,
  allPlayersReady,
}: ReadyPanelProps) {
  // 준비 상태 전환 중인 사용자 ID (애니메이션용)
  const [transitioning, setTransitioning] = useState<string | null>(null);
  // 전환 방향 (true: 준비 → 대기, false: 대기 → 준비)
  const [direction, setDirection] = useState<boolean>(false);

  // 현재 사용자
  const currentUser = users.find(user => user.id === currentUserId);

  // 준비된 플레이어와 준비되지 않은 플레이어로 분류
  const readyPlayers = users.filter(user => readyStatus[user.id]);
  const notReadyPlayers = users.filter(user => !readyStatus[user.id]);

  // 준비 완료 수 계산
  const readyCount = readyPlayers.length;
  const totalCount = users.length;

  // 준비 상태 토글 및 애니메이션 처리
  const handleToggleReady = (userId: string) => {
    // 현재 전환 중이면 무시
    if (transitioning) return;

    const isReady = readyStatus[userId];
    setTransitioning(userId);
    setDirection(isReady); // true: 준비 → 대기, false: 대기 → 준비

    // 애니메이션 후 상태 변경
    setTimeout(() => {
      toggleReady(userId);
      // 애니메이션 종료 후 전환 상태 초기화
      setTimeout(() => {
        setTransitioning(null);
      }, 300);
    }, 300);
  };

  return (
    <div className='p-4 h-full flex flex-col'>
      {/* 상단 헤더 */}
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-xl font-bold text-gray-800'>플레이어 준비 상태</h2>
        <div className='bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium'>
          {readyCount}/{totalCount} 준비 완료
        </div>
      </div>

      <div className='flex flex-1 gap-4 relative'>
        {/* 준비 완료 섹션 */}
        <div className='flex-1 border border-green-200 rounded-lg p-3 bg-green-50'>
          <div className='flex items-center mb-3'>
            <CheckCircle size={16} className='text-green-600 mr-2' />
            <h3 className='text-green-700 font-medium'>준비 완료</h3>
            <span className='ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full'>
              {readyPlayers.length}명
            </span>
          </div>

          <div className='grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1'>
            {readyPlayers.map(user => {
              const isCurrentUser = user.id === currentUserId;
              const isUserHost = user.role === 'host';
              const isTransitioning = transitioning === user.id && direction;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: isTransitioning ? 0 : 1,
                    x: isTransitioning ? -30 : 0,
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className='flex items-center p-2 bg-white rounded-md border border-green-200 hover:bg-green-100 transition-colors'
                >
                  <div className='relative'>
                    <div className='w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white'>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {isUserHost && (
                      <div className='absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5'>
                        <Crown size={10} className='text-yellow-800' />
                      </div>
                    )}
                  </div>

                  <div className='ml-2 flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {user.name}
                      {isCurrentUser && (
                        <span className='text-indigo-600 text-xs ml-1'>
                          (나)
                        </span>
                      )}
                    </p>
                  </div>

                  {isCurrentUser && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleToggleReady(user.id)}
                      className='ml-auto text-xs p-1.5 h-auto text-red-600 hover:text-red-700 hover:bg-red-100'
                    >
                      취소
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 대기 중 섹션 */}
        <div className='flex-1 border border-gray-200 rounded-lg p-3 bg-gray-50'>
          <div className='flex items-center mb-3'>
            <Clock size={16} className='text-gray-500 mr-2' />
            <h3 className='text-gray-700 font-medium'>대기 중</h3>
            <span className='ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full'>
              {notReadyPlayers.length}명
            </span>
          </div>

          <div className='grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1'>
            {notReadyPlayers.map(user => {
              const isCurrentUser = user.id === currentUserId;
              const isUserHost = user.role === 'host';
              const isTransitioning = transitioning === user.id && !direction;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: isTransitioning ? 0 : 1,
                    x: isTransitioning ? 30 : 0,
                  }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className='flex items-center p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-100 transition-colors'
                >
                  <div className='relative'>
                    <div className='w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white'>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {isUserHost && (
                      <div className='absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5'>
                        <Crown size={10} className='text-yellow-800' />
                      </div>
                    )}
                  </div>

                  <div className='ml-2 flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {user.name}
                      {isCurrentUser && (
                        <span className='text-indigo-600 text-xs ml-1'>
                          (나)
                        </span>
                      )}
                    </p>
                  </div>

                  {isCurrentUser && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleToggleReady(user.id)}
                      className='ml-auto text-xs p-1.5 h-auto text-green-600 hover:text-green-700 hover:bg-green-100'
                    >
                      준비
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 내 준비 상태 */}
      <div className='mt-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <div className='relative'>
              <div
                className={`w-10 h-10 rounded-full ${readyStatus[currentUserId] ? 'bg-green-600' : 'bg-gray-400'} flex items-center justify-center text-white transition-colors duration-300`}
              >
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              {currentUser?.role === 'host' && (
                <div className='absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5'>
                  <Crown size={12} className='text-yellow-800' />
                </div>
              )}
            </div>
            <div className='ml-3'>
              <p className='font-medium text-gray-800'>{currentUser?.name}</p>
              <p className='text-xs text-gray-500'>
                {readyStatus[currentUserId]
                  ? '준비 완료 상태입니다'
                  : '아직 준비하지 않았습니다'}
                {currentUser?.role === 'host' && ' (방장)'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              onClick={() => handleToggleReady(currentUserId)}
              className={`${
                readyStatus[currentUserId]
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white transition-colors duration-300`}
            >
              {readyStatus[currentUserId] ? '준비 취소' : '준비 완료'}
            </Button>

            {/* 방장이고 모든 사용자가 준비되었을 때 게임 시작 버튼 표시 */}
            {isHost && allPlayersReady && (
              <Button
                onClick={handleStartGame}
                className='bg-yellow-500 hover:bg-yellow-600 text-white ml-2 flex items-center gap-1'
              >
                <PlayCircle size={16} />
                <span>게임 시작</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 방장의 게임 시작 버튼 (준비가 안 된 경우만 표시) */}
      {isHost && !allPlayersReady && (
        <div className='mt-4'>
          <Button
            className='w-full bg-gray-400 text-white font-bold py-2 cursor-not-allowed'
            disabled={true}
          >
            모든 플레이어가 준비해야 합니다
          </Button>
        </div>
      )}
    </div>
  );
}
