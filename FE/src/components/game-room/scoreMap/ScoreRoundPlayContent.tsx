import React from 'react';

import { motion } from 'framer-motion';

import { useRoundHintStore } from '@/stores/websocket/useRoundHintStore';

const ScoreRoundPlayContent = () => {
  const { roundHint } = useRoundHintStore();

  return (
    <div className='flex h-full w-full items-center justify-center px-4'>
      <motion.div
        className='w-full space-y-6'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 가수 정보 */}
        <div className='flex items-center justify-between'>
          <span className='text-lg font-bold text-cyan-200'>
            <span className='mr-2 inline-block text-xs'>♪</span>
            가수
          </span>
          <div className='overflow-hidden rounded-full border-2 border-purple-500/30 px-5 py-1.5 shadow-inner shadow-cyan-900/10'>
            <span className='text-xl font-bold text-white'>
              {roundHint && roundHint.singer
                ? roundHint.singer
                : '잠시 후 공개'}
            </span>
          </div>
        </div>

        {/* 제목 정보 */}
        <div className='flex items-center justify-between'>
          <span className='text-lg font-bold text-cyan-200'>
            <span className='mr-2 inline-block text-xs'>♫</span>
            제목
          </span>
          <div className='overflow-hidden rounded-full border-2 border-purple-500/30 px-5 py-1.5 shadow-inner shadow-purple-900/10'>
            <span className='text-xl font-bold text-white'>
              {roundHint && roundHint.title ? roundHint.title : '잠시 후 공개'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreRoundPlayContent;
