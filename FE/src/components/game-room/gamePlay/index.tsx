import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { useGameChatStore } from '@/stores/websocket/useGameChatStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';
import { useGameWinnerStore } from '@/stores/websocket/useGameWinnerStore';
import { Chatting } from '@/types/websocket';

import GamePlayPanel from '../GameBoard/GamePlayPanel';
import SpeechBubble from './SpeechBubble';

const GamePlay = () => {
  const { participantInfo } = useParticipantInfoStore();
  const { gameRoomInfo } = useGameInfoStore();
  const { gameChattings } = useGameChatStore();
  const { gameState } = useGameStateStore();
  const { winner } = useGameWinnerStore();

  const [chattingMap, setChattingMap] = useState<
    Record<string, { message: string; timestamp: number }>
  >({});
  const [shakingMap, setShakingMap] = useState<Record<string, boolean>>({});
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleSpeech = (chat: Chatting) => {
    const now = Date.now();

    setChattingMap(prev => ({
      ...prev,
      [chat.sender]: { message: chat.message, timestamp: now },
    }));

    if (participantInfo.find(p => p.userName === chat.sender)) {
      setShakingMap(prev => ({
        ...prev,
        [chat.sender]: true,
      }));

      setTimeout(() => {
        setShakingMap(prev => {
          const updated = { ...prev };
          delete updated[chat.sender];
          return updated;
        });
      }, 1000);
    }

    setTimeout(() => {
      setChattingMap(prev => {
        const current = prev[chat.sender];
        if (current?.timestamp !== now) return prev;

        const updated = { ...prev };
        delete updated[chat.sender];
        return updated;
      });
    }, 2000);
  };

  useEffect(() => {
    if (
      gameChattings.at(-1) &&
      gameChattings.at(-1)?.messageType === 'default'
    ) {
      handleSpeech(gameChattings.at(-1)!);
    }
  }, [gameChattings]);

  if (!gameRoomInfo) return null;

  const getStaffPosition = (index: number) => {
    const basePositions = [
      { x: 15, y: 25 },
      { x: 30, y: 125 },
      { x: 45, y: 45 },
      { x: 60, y: 65 },
      { x: 73, y: 145 },
      { x: 82, y: 17 },
    ];

    return {
      left: `${basePositions[index % basePositions.length].x}%`,
      top: `${basePositions[index % basePositions.length].y}px`,
      bottom: undefined,
    };
  };

  const shakeAnimation = {
    rotate: [0, -5, 5, -5, 5, -3, 3, -2, 2, 0],
    transition: {
      duration: 1,
      ease: 'easeInOut',
      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
      repeatType: 'loop' as const,
      repeat: 0,
    },
  };

  return (
    <div className='relative h-screen w-full overflow-hidden'>
      {animationStarted && (
        <motion.div
          className='h-[40%] w-full'
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 200, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className='flex items-center justify-center p-8'>
            <GamePlayPanel />
          </div>
        </motion.div>
      )}

      <motion.div
        className='relative mt-[100px] h-[40%] w-full'
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 20,
          delay: 0.5,
        }}
      >
        <Image
          src='/staff.png'
          alt='Musical Staff'
          fill
          className='object-cover'
          priority
        />

        <motion.div
          className='absolute -left-40 h-[300px] w-[300px] -translate-y-8 overflow-hidden rounded-full lg:-left-38 lg:-translate-y-12'
          animate={{ rotate: 360, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        >
          <div className='h-full w-full rounded-full'>
            <Image src='/lp.svg' alt='lp' fill className='object-cover' />
          </div>
        </motion.div>

        {participantInfo.map((participant, index) => {
          const position = getStaffPosition(index);
          const isShaking = shakingMap[participant.userName];

          return (
            <motion.div
              key={participant.userName}
              className='absolute'
              style={{ left: position.left, top: position.top }}
              transition={{
                type: 'spring',
                stiffness: 180,
                damping: 20,
                delay: animationStarted ? 0.7 + index * 0.1 : 0,
              }}
            >
              <div className='relative flex flex-col items-center'>
                <div className='absolute bottom-23 left-20 mb-2 w-max max-w-[200px]'>
                  {chattingMap[participant.userName]?.message && (
                    <SpeechBubble
                      text={chattingMap[participant.userName].message}
                      isInProgress={true}
                    />
                  )}
                </div>
                <motion.div
                  className={cn(
                    gameState === 'GAME_END' && participant.userName === winner
                      ? 'h-28 w-24 md:h-32 md:w-28'
                      : 'h-20 w-16 md:h-24 md:w-20',
                    'relative',
                  )}
                  animate={isShaking ? shakeAnimation : {}}
                >
                  <Image
                    src={participant.character}
                    alt={`${participant.userName}'s character`}
                    fill
                    className='object-contain'
                  />
                </motion.div>
                <div className='mt-1'>
                  <span className='text-sm text-white'>
                    {participant.userName}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default GamePlay;
