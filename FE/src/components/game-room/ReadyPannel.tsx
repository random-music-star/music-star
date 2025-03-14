import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';

interface ReadyPanelProps {
  currentUserId: string;
  handleStartGame: () => void;
}

export default function ReadyPanel({
  currentUserId,
  handleStartGame,
}: ReadyPanelProps) {
  const { participantInfo, setParticipantInfo } = useParticipantInfoStore();

  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [direction, setDirection] = useState<boolean>(false);

  const currentUserInfo = participantInfo.find(
    user => user.userName === currentUserId,
  );
  const isCurrentUserReady = currentUserInfo?.isReady || false;

  const readyPlayers = participantInfo.filter(user => user.isReady);
  const notReadyPlayers = participantInfo.filter(user => !user.isReady);

  const allPlayersReady =
    participantInfo.length > 0 && participantInfo.every(user => user.isReady);

  const handleToggleReady = (userName: string) => {
    if (transitioning) return;

    const currentPlayer = participantInfo.find(
      user => user.userName === userName,
    );
    if (!currentPlayer) return;

    const isReady = currentPlayer.isReady;
    setTransitioning(userName);
    setDirection(isReady);

    setTimeout(() => {
      const updatedParticipants = participantInfo.map(user =>
        user.userName === userName ? { ...user, isReady: !user.isReady } : user,
      );
      setParticipantInfo(updatedParticipants);

      setTimeout(() => {
        setTransitioning(null);
      }, 300);
    }, 300);
  };

  return (
    <div className='p-4 h-full flex flex-col'>
      <div className='flex justify-between items-center mb-5'>
        <h2 className='text-xl font-bold text-gray-800'>플레이어 준비 상태</h2>
        <div className='bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium'>
          {readyPlayers.length}/{participantInfo.length} 준비 완료
        </div>
      </div>

      <div className='flex flex-1 gap-4 relative'>
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
              const isCurrentUser = user.userName === currentUserId;

              const isUserHost = user.userName === currentUserId;

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
                  className='flex items-center p-2 bg-white rounded-md border border-green-200 hover:bg-green-100 transition-colors'
                >
                  <div className='relative'>
                    <div className='w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white'>
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                    {isUserHost && (
                      <div className='absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5'>
                        <Crown size={10} className='text-yellow-800' />
                      </div>
                    )}
                  </div>

                  <div className='ml-2 flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {user.userName}
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
                      onClick={() => handleToggleReady(user.userName)}
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
              const isCurrentUser = user.userName === currentUserId;
              const isUserHost = user.userName === currentUserId;
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
                  className='flex items-center p-2 bg-white rounded-md border border-gray-200 hover:bg-gray-100 transition-colors'
                >
                  <div className='relative'>
                    <div className='w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white'>
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                    {isUserHost && (
                      <div className='absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5'>
                        <Crown size={10} className='text-yellow-800' />
                      </div>
                    )}
                  </div>

                  <div className='ml-2 flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {user.userName}
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
                      onClick={() => handleToggleReady(user.userName)}
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

      <div className='mt-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <div className='relative'>
              <div
                className={`w-10 h-10 rounded-full ${isCurrentUserReady ? 'bg-green-600' : 'bg-gray-400'} flex items-center justify-center text-white transition-colors duration-300`}
              >
                {currentUserId.charAt(0).toUpperCase()}
              </div>
              {/* {isHost && (
                <div className='absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5'>
                  <Crown size={12} className='text-yellow-800' />
                </div>
              )} */}
            </div>
            <div className='ml-3'>
              <p className='font-medium text-gray-800'>{currentUserId}</p>
              <p className='text-xs text-gray-500'>
                {isCurrentUserReady
                  ? '준비 완료 상태입니다'
                  : '아직 준비하지 않았습니다'}
                {/* {isHost && ' (방장)'} */}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              onClick={() => handleToggleReady(currentUserId)}
              className={`${
                isCurrentUserReady
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white transition-colors duration-300`}
            >
              {isCurrentUserReady ? '준비 취소' : '준비 완료'}
            </Button>

            {allPlayersReady && (
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

      {!allPlayersReady && (
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
