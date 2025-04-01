import React from 'react';

import { motion } from 'framer-motion';

import { useGameWinnerStore } from '@/stores/websocket/useGameWinnerStore';

const ScoreGameResultContent = () => {
  const { winner } = useGameWinnerStore();

  return (
    <div className='flex w-full flex-col items-center justify-center py-6'>
      <div className='relative w-full max-w-md rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-600/40 to-purple-700/40 p-6 shadow-lg backdrop-blur-sm'>
        {/* 빛나는 효과 배경 */}
        <div className='absolute inset-0 rounded-lg bg-purple-600/10 blur-xl'></div>

        {/* 컨텐츠 */}
        <div className='relative z-10 flex flex-col items-center'>
          <motion.div
            className='mb-2 text-lg font-bold text-purple-200'
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            축하합니다!
          </motion.div>

          <div className='mb-6 text-xl font-extrabold text-purple-100'>
            WINNER
          </div>

          <motion.div
            animate={{
              textShadow: [
                '0 0 4px #E9D5FF',
                '0 0 8px #E9D5FF',
                '0 0 12px #a855f7',
                '0 0 15px #a855f7',
                '0 0 8px #E9D5FF',
                '0 0 4px #E9D5FF',
              ],
              color: ['#E9D5FF', '#ffffff', '#ffffff', '#ffffff', '#E9D5FF'],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className='text-5xl font-black tracking-tight text-white'
          >
            {winner}
          </motion.div>

          {/* 장식 효과 */}
          <div className='mt-6 flex space-x-4'>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className='h-3 w-3 rounded-full bg-purple-400'
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreGameResultContent;
