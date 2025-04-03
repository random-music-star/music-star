import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useGameInfoStore } from '@/stores/websocket/useGameRoomInfoStore';
import {
  MODE_DICT,
  useGameRoundInfoStore,
} from '@/stores/websocket/useGameRoundInfoStore';
import { useGameStateStore } from '@/stores/websocket/useGameStateStore';

const RoundRolling = () => {
  const { gameRoomInfo } = useGameInfoStore();
  const { gameState } = useGameStateStore();
  const { roundInfo } = useGameRoundInfoStore();
  const [isRolling, setIsRolling] = useState(true);

  useEffect(() => {
    if (gameState === 'ROUND_OPEN') {
      setIsRolling(false);
    } else if (gameState === 'ROUND_INFO') {
      setIsRolling(true);
    }
  }, [gameState]);

  if (!gameRoomInfo || !roundInfo) return null;

  return (
    <div className='flex flex-col items-center justify-center py-6'>
      <h3 className='mb-4 text-xl font-bold text-purple-200'>게임 모드 선택</h3>
      <div className='relative h-20 w-full max-w-xs overflow-hidden rounded-lg border border-purple-500/30 bg-purple-700/50 shadow-inner backdrop-blur-sm'>
        <div className='absolute top-0 z-10 h-8 w-full bg-gradient-to-b from-purple-900 to-transparent'></div>
        <div className='absolute bottom-0 z-10 h-8 w-full bg-gradient-to-t from-purple-900 to-transparent'></div>
        <div className='absolute top-1/2 right-0 left-0 z-0 h-10 -translate-y-1/2 border-y border-purple-400/30 bg-purple-500/20'></div>
        <div className='absolute top-0 right-0 left-0 z-0 h-20 overflow-hidden'>
          <AnimatePresence mode='wait'>
            {isRolling ? (
              <motion.div
                key='rolling'
                className='relative h-60'
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              >
                <motion.div
                  animate={{ y: [0, -300] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'linear',
                    repeatType: 'loop',
                  }}
                >
                  {[...Array(10)].map((_, i) =>
                    gameRoomInfo.mode.map((mode, modeIndex) => (
                      <div
                        key={`${i}-${modeIndex}`}
                        className='flex h-10 items-center justify-center text-xl font-bold text-purple-200'
                      >
                        {MODE_DICT[mode]}
                      </div>
                    )),
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key='selected'
                className='flex h-20 items-center justify-center'
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.3 },
                }}
              >
                <motion.div
                  animate={{
                    color: ['#E9D5FF', '#ffffff', '#E9D5FF'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className='text-2xl font-extrabold'
                >
                  {MODE_DICT[roundInfo.mode]}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className='mt-4 text-sm font-medium text-purple-300'>
        {isRolling ? '모드 선택 중...' : '선택된 모드'}
      </p>
    </div>
  );
};

export default RoundRolling;
