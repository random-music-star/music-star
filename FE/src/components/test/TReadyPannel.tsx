import { useState } from 'react';

import { motion } from 'framer-motion';
import { Crown, PlayCircle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { useWebSocketStore } from '@/stores/websocket/useWebsocketStore';

import { Button } from '../ui/button';

interface ReadyPanelProps {
  currentUserId: string;
  handleStartGame: () => void;
  roomId: string;
}

const TReadyPannel = ({
  currentUserId,
  handleStartGame,
  roomId,
}: ReadyPanelProps) => {
  const { participantInfo, isAllReady, hostNickname } =
    useParticipantInfoStore();
  const { gameRoomInfo } = useGameInfoStore();

  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [direction, setDirection] = useState<boolean>(false);
  const { sendMessage } = useWebSocketStore();

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

      setTimeout(() => {
        setTransitioning(null);
      }, 300);
    }, 300);
  };

  if (!gameRoomInfo) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: 'beforeChildren', staggerChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      className='flex h-screen w-full flex-col justify-between p-8'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      exit='exit'
    >
      <div className='grid h-2/3 grid-cols-5 gap-4'>
        {participantInfo.map(user => {
          const isCurrentUser = user.userName === currentUserId;
          const isUserHost = user.userName === hostNickname;
          const isTransitioning = transitioning === user.userName;

          return (
            <motion.div
              key={user.userName}
              className={cn(
                'relative flex h-[270px] w-full flex-col items-center justify-between overflow-hidden rounded-2xl border-3 border-cyan-300 bg-black/80 p-2 shadow-[0_0_8px_cyan-400]',
              )}
              layout
              layoutId={`user-${user.userName}`}
            >
              {isUserHost && (
                <div className='absolute top-2 left-2 z-10'>
                  <Crown
                    size={24}
                    className='fill-yellow-400 text-yellow-400'
                  />
                </div>
              )}
              <motion.div
                className='flex w-full flex-1 items-center justify-center opacity-100'
                animate={
                  isTransitioning
                    ? { y: direction ? 15 : -15, opacity: 0.5 }
                    : { y: 0, opacity: 1 }
                }
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <div className='flex h-35 w-30 items-center justify-center'>
                  <object
                    data='/yellow.svg'
                    type='image/svg+xml'
                    className='h-full w-full'
                  ></object>
                </div>
              </motion.div>

              <p
                className={cn(
                  user.isReady && 'text-cyan-300',
                  !user.isReady && 'text-white',
                  isUserHost && 'text-yellow-300',
                  isCurrentUser && 'text-purple-300',
                  'text-center text-xs font-medium',
                )}
              >
                {user.userName} {isUserHost && !isCurrentUser && ' (방장)'}
                {isCurrentUser && ' (나)'}
              </p>
              <motion.div
                className={cn(
                  user.isReady && 'bg-cyan-300 text-black/50',
                  !user.isReady && 'bg-gray-700 text-black/50',
                  'text-md tracking-super-wide mt-2 w-full rounded-lg px-2 py-1 text-center font-semibold',
                )}
              >
                READY
              </motion.div>
            </motion.div>
          );
        })}

        {Array.from(
          { length: gameRoomInfo.maxPlayer - participantInfo.length },
          (_, i: number) => (
            <motion.div
              key={i}
              className='h-[270px] w-full rounded-2xl bg-black opacity-50'
            ></motion.div>
          ),
        )}
      </div>

      <motion.div className='flex gap-4 self-end'>
        <Button
          onClick={handleToggleReady}
          className={cn(
            !participantInfo.find(user => user.userName === currentUserId)
              ?.isReady && 'bg-cyan-500 text-black/50 hover:bg-cyan-600',
            participantInfo.find(user => user.userName === currentUserId)
              ?.isReady && 'bg-gray-600 text-black/50 hover:bg-gray-700',
            'tracking-super-wide rounded-3xl px-10 py-[25px] text-xl font-semibold',
          )}
        >
          {participantInfo.find(user => user.userName === currentUserId)
            ?.isReady
            ? '준비취소'
            : '준비하기'}
        </Button>

        {isAllReady && currentUserId === hostNickname && (
          <Button
            onClick={handleStartGame}
            className='rounded-3xl bg-purple-400 px-10 py-[25px] text-xl hover:bg-purple-500'
          >
            <PlayCircle size={16} />
            <span>게임 시작</span>
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TReadyPannel;
