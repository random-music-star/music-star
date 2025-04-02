import React from 'react';

import { motion } from 'framer-motion';

import { useGameRoundResultStore } from '@/stores/websocket/useGameRoundResultStore';

const ScoreRoundResultContent = () => {
  const { gameRoundResult } = useGameRoundResultStore();

  if (!gameRoundResult) return null;

  return (
    <div className='flex h-full w-full items-center justify-center px-4'>
      <motion.div
        className='w-full'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {gameRoundResult.winner && (
          <div className='mb-5 flex justify-center'>
            <div className='rounded-full border-2 border-cyan-400/30 bg-purple-800/50 px-5 py-1.5'>
              <span className='text-base font-bold text-cyan-300'>
                {gameRoundResult.winner}
              </span>
              <span className='ml-2 text-xl font-extrabold text-white'>
                정답!
              </span>
            </div>
          </div>
        )}

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-base font-bold text-cyan-200'>가수</span>
            <div className='overflow-hidden rounded-md border border-purple-400/30 px-4 py-1'>
              <span className='text-xl font-bold break-words text-white'>
                {gameRoundResult.singer || '정보 없음'}
              </span>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-base font-bold text-cyan-200'>제목</span>
            <div className='overflow-hidden rounded-md border border-cyan-400/30 px-4 py-1'>
              <span className='text-xl font-bold break-words text-white'>
                {gameRoundResult.songTitle || '정보 없음'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreRoundResultContent;
