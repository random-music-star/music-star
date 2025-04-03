import React from 'react';

import { motion } from 'framer-motion';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useRoundHintStore } from '@/stores/websocket/useRoundHintStore';

export interface GameHint {
  title: string;
  singer: string;
  title2: string;
  singer2: string;
}

const RoundPlayContent = () => {
  const { roundHint } = useRoundHintStore();
  const { roundInfo } = useGameRoundInfoStore();

  const { mode } = roundInfo;
  const isDualMode = mode === 'DUAL';

  return (
    <div className='flex h-full w-full items-center justify-center px-4 text-lg'>
      <motion.div
        className='w-full'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {isDualMode ? (
          // 더 컴팩트한 DUAL 모드 UI
          <div className='space-y-6 text-xl'>
            {/* 첫 번째 노래 정보 (한 줄에 표시) */}
            <div className='flex items-center'>
              <div className='mr-4 h-4 w-4 rounded-full bg-pink-400'></div>
              <span className='mr-4 font-bold text-pink-300'>첫곡</span>
              <span className='font-bold text-white'>
                {roundHint && roundHint.singer
                  ? roundHint.singer
                  : '잠시 후 공개'}
              </span>
              <span className='mx-2 font-bold text-cyan-400'>•</span>
              <span className='overflow-hidden font-bold overflow-ellipsis whitespace-nowrap text-white'>
                {roundHint && roundHint.title
                  ? roundHint.title
                  : '잠시 후 공개'}
              </span>
            </div>

            {/* 두 번째 노래 정보 (한 줄에 표시) */}
            <div className='flex items-center'>
              <div className='mr-4 h-4 w-4 rounded-full bg-blue-400'></div>
              <span className='mr-4 font-bold text-blue-300'>둘째곡</span>
              <span className='font-bold text-white'>
                {roundHint && roundHint.singer2
                  ? roundHint.singer2
                  : '잠시 후 공개'}
              </span>
              <span className='mx-2 font-bold text-cyan-400'>•</span>
              <span className='overflow-hidden font-bold overflow-ellipsis whitespace-nowrap text-white'>
                {roundHint && roundHint.title2
                  ? roundHint.title2
                  : '잠시 후 공개'}
              </span>
            </div>
          </div>
        ) : (
          // 일반 모드 UI
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-bold text-cyan-200'>
                <span className='mr-2 inline-block text-xs'>♪</span>
                가수
              </span>
              <div className='overflow-hidden rounded-full border-2 border-purple-500/30 px-5 py-1.5 shadow-inner shadow-cyan-900/10'>
                <span className='text-lg font-bold text-white'>
                  {roundHint && roundHint.singer
                    ? roundHint.singer
                    : '잠시 후 공개'}
                </span>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-lg font-bold text-cyan-200'>
                <span className='mr-2 inline-block text-xs'>♫</span>
                제목
              </span>
              <div className='overflow-hidden rounded-full border-2 border-purple-500/30 px-5 py-1.5 shadow-inner shadow-purple-900/10'>
                <span className='text-lg font-bold text-white'>
                  {roundHint && roundHint.title
                    ? roundHint.title
                    : '잠시 후 공개'}
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RoundPlayContent;
