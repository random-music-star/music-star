import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, Crown, PlayCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

interface ReadyPanelProps {
  currentUserId: string;
  handleStartGame: () => void;
  roomId: string;
}

export default function ReadyPanel({
  currentUserId,
  handleStartGame,
  roomId,
}: ReadyPanelProps) {
  const {
    participantInfo,
    readyPlayers,
    notReadyPlayers,
    isAllReady,
    hostNickname,
  } = useParticipantInfoStore();

  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [direction, setDirection] = useState<boolean>(false);
  const [isCurrentReady, setIsCurrentReady] = useState<boolean>(false);
  const { sendMessage } = useWebSocketStore();

  useEffect(() => {
    if (!participantInfo || !currentUserId) return;

    const currentUser = participantInfo.find(
      user => user.userName === currentUserId,
    );

    setIsCurrentReady(currentUser ? currentUser.isReady : false);
  }, [participantInfo]);

  const handleToggleReady = () => {
    if (transitioning) return;

    const currentPlayer = participantInfo.find(
      user => user.userName === currentUserId,
    );

    if (!currentPlayer) return;

    const isReady = currentPlayer.isReady;
    setTransitioning(currentUserId);
    setDirection(isReady);

    setTimeout(() => {
      sendMessage(`/app/channel/1/room/${roomId}/ready`, {
        type: 'ready',
        username: currentUserId,
      });

      setIsCurrentReady(!isReady);

      setTimeout(() => {
        setTransitioning(null);
      }, 300);
    }, 300);
  };

  return (
    <motion.div
      className='h-full'
      initial={{ opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex h-full flex-col p-4'>
        <div className='mb-5 flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-800'>
            플레이어 준비 상태
          </h2>
          <div className='rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700'>
            {readyPlayers.length}/{participantInfo.length} 준비 완료
          </div>
        </div>

        <div className='relative flex flex-1 gap-4'>
          <div className='flex-1 rounded-lg border border-green-200 bg-green-50 p-3'>
            <div className='mb-3 flex items-center'>
              <CheckCircle size={16} className='mr-2 text-green-600' />
              <h3 className='font-medium text-green-700'>준비 완료</h3>
              <span className='ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700'>
                {readyPlayers.length}명
              </span>
            </div>

            <div className='grid max-h-[220px] grid-cols-3 gap-2 overflow-y-auto pr-1'>
              {readyPlayers.map(user => {
                const isCurrentUser = user.userName === currentUserId;

                const isUserHost = user.userName === hostNickname;

                const isTransitioning =
                  transitioning === user.userName && direction;

                return (
                  <motion.div
                    key={user.userName}
                    initial={{ opacity: 1 }}
                    animate={{
                      opacity: isTransitioning ? 0 : 1,
                      x: isTransitioning ? -30 : 0,
                    }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className='flex items-center rounded-md border border-green-200 bg-white p-2 transition-colors hover:bg-green-100'
                  >
                    <div className='relative'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white'>
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      {isUserHost && (
                        <div className='absolute -top-1 -right-1 rounded-full bg-yellow-400 p-0.5'>
                          <Crown size={10} className='text-yellow-800' />
                        </div>
                      )}
                    </div>

                    <div className='ml-2 min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {user.userName}
                        {isCurrentUser && (
                          <span className='ml-1 text-xs text-indigo-600'>
                            (나)
                          </span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className='flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3'>
            <div className='mb-3 flex items-center'>
              <Clock size={16} className='mr-2 text-gray-500' />
              <h3 className='font-medium text-gray-700'>대기 중</h3>
              <span className='ml-auto rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700'>
                {notReadyPlayers.length}명
              </span>
            </div>

            <div className='grid max-h-[220px] grid-cols-3 gap-2 overflow-y-auto pr-1'>
              {notReadyPlayers.map(user => {
                const isCurrentUser = user.userName === currentUserId;
                const isUserHost = user.userName === hostNickname;
                const isTransitioning =
                  transitioning === user.userName && !direction;

                return (
                  <motion.div
                    key={user.userName}
                    initial={{ opacity: 1 }}
                    animate={{
                      opacity: isTransitioning ? 0 : 1,
                      x: isTransitioning ? 30 : 0,
                    }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className='flex items-center rounded-md border border-gray-200 bg-white p-2 transition-colors hover:bg-gray-100'
                  >
                    <div className='relative'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-white'>
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      {isUserHost && (
                        <div className='absolute -top-1 -right-1 rounded-full bg-yellow-400 p-0.5'>
                          <Crown size={10} className='text-yellow-800' />
                        </div>
                      )}
                    </div>

                    <div className='ml-2 min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {user.userName}
                        {isCurrentUser && (
                          <span className='ml-1 text-xs text-indigo-600'>
                            (나)
                          </span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className='mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='relative'>
                <div
                  className={`h-10 w-10 rounded-full ${isCurrentReady ? 'bg-green-600' : 'bg-gray-400'} flex items-center justify-center text-white transition-colors duration-300`}
                >
                  {currentUserId.charAt(0).toUpperCase()}
                </div>
                {currentUserId === hostNickname && (
                  <div className='absolute -top-1 -right-1 rounded-full bg-yellow-400 p-0.5'>
                    <Crown size={12} className='text-yellow-800' />
                  </div>
                )}
              </div>
              <div className='ml-3'>
                <p className='font-medium text-gray-800'>
                  {currentUserId}
                  {currentUserId === hostNickname && <span>(방장)</span>}
                </p>
                <p className='text-xs text-gray-500'>
                  {isCurrentReady
                    ? '준비 완료 상태입니다'
                    : '아직 준비하지 않았습니다'}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                onClick={handleToggleReady}
                className={`${
                  isCurrentReady
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-500 hover:bg-gray-600'
                } text-white transition-colors duration-300`}
              >
                READY
              </Button>

              {isAllReady && currentUserId === hostNickname && (
                <Button
                  onClick={handleStartGame}
                  className='ml-2 flex items-center gap-1 bg-yellow-500 text-white hover:bg-yellow-600'
                >
                  <PlayCircle size={16} />
                  <span>게임 시작</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {!isAllReady && (
          <div className='mt-4'>
            <Button
              className='w-full cursor-not-allowed bg-gray-400 py-2 font-bold text-white'
              disabled={true}
            >
              모든 플레이어가 준비해야 합니다
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
