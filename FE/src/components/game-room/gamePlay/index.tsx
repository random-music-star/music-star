import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { useGameChatStore } from '@/stores/websocket/useGameChatStore';
import { useParticipantInfoStore } from '@/stores/websocket/useGameParticipantStore';
import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import { Chatting } from '@/types/websocket';

import GamePlayPanel from '../GameBoard/GamePlayPanel';
import SpeechBubble from './SpeechBubble';

const GamePlay = () => {
  const { participantInfo } = useParticipantInfoStore();
  const { gameRoomInfo } = useGameInfoStore();
  const { gameChattings } = useGameChatStore();

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
      { x: 15, y: 20 },
      { x: 30, y: 120 },
      { x: 45, y: 40 },
      { x: 60, y: 60 },
      { x: 73, y: 140 },
      { x: 82, y: 12 },
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
    <div className='relative h-full w-full overflow-hidden'>
      {animationStarted && (
        <motion.div
          className='h-[300px] w-full'
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
        className='relative mt-[100px] h-[300px] w-full'
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 20,
          delay: 0.5,
        }}
      >
        <Image
          src='/staff.svg'
          alt='Musical Staff'
          fill
          className='object-cover'
        />

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
                  className='relative h-20 w-16 md:h-24 md:w-20'
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
