import React from 'react';

import { motion } from 'framer-motion';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useGameRoundResultStore } from '@/stores/websocket/useGameRoundResultStore';

const RoundResultContent = () => {
  const { gameRoundResult } = useGameRoundResultStore();
  const { roundInfo } = useGameRoundInfoStore();
  const { mode } = roundInfo;
  const isDualMode = mode === 'DUAL';

  if (!gameRoundResult) return null;

  return (
    <div className='flex h-full w-full items-center justify-center px-2'>
      <motion.div
        className='w-full'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {gameRoundResult.winner && (
          <div className='mb-4 flex justify-center'>
            <div className='rounded-full border-2 border-cyan-400/30 bg-purple-800/50 px-4 py-1.5'>
              <span className='text-base font-bold text-cyan-300'>
                {gameRoundResult.winner}
              </span>
              <span className='ml-2 text-lg font-extrabold text-white'>
                정답!
              </span>
            </div>
          </div>
        )}

        {isDualMode ? (
          // 극도로 컴팩트한 DUAL 모드 UI
          <div className='space-y-4 text-base'>
            {/* 첫 번째 노래: 행 형태로 표시 */}
            <div className='flex items-center text-lg'>
              <div className='mr-3 h-4 w-4 rounded-full bg-pink-400'></div>
              <span className='mr-3 font-bold text-pink-300'>첫곡:</span>
              <span className='mr-3 font-bold text-cyan-200'>
                {gameRoundResult.singer || '?'} -
              </span>
              <span className='overflow-hidden font-bold overflow-ellipsis whitespace-nowrap text-white'>
                {gameRoundResult.songTitle || '정보 없음'}
              </span>
            </div>

            {/* 두 번째 노래: 행 형태로 표시 */}
            <div className='flex items-center text-lg'>
              <div className='mr-3 h-4 w-4 rounded-full bg-blue-400'></div>
              <span className='mr-3 font-bold text-blue-300'>둘째곡:</span>
              <span className='mr-3 font-bold text-cyan-200'>
                {gameRoundResult.singer2 || '?'} -
              </span>
              <span className='overflow-hidden font-bold overflow-ellipsis whitespace-nowrap text-white'>
                {gameRoundResult.songTitle2 || '정보 없음'}
              </span>
            </div>
          </div>
        ) : (
          // 기존 단일 모드 UI
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='mr-2 text-lg font-bold text-cyan-200'>가수</span>
              <div className='overflow-hidden rounded-md border-2 border-purple-400/30 px-4 py-1.5'>
                <span className='text-lg font-bold break-words text-white'>
                  {gameRoundResult.singer || '정보 없음'}
                </span>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <span className='mr-2 text-lg font-bold text-cyan-200'>제목</span>
              <div className='overflow-hidden rounded-md border-2 border-cyan-400/30 px-4 py-1.5'>
                <span className='text-lg font-bold break-words text-white'>
                  {gameRoundResult.songTitle || '정보 없음'}
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RoundResultContent;
