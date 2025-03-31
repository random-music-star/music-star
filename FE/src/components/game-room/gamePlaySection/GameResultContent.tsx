import React from 'react';

import { useGameWinnerStore } from '@/stores/websocket/useGameWinnerStore';

const GameResultContent = () => {
  const { winner } = useGameWinnerStore();

  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <div className='flex flex-col items-center space-y-6'>
        <div className='flex flex-col items-center'>
          <span className='mb-2 rounded-4xl bg-cyan-400 p-4 py-[1px] text-lg font-medium text-white'>
            WINNER
          </span>
          <span className='animate-pulse px-8 py-4 text-2xl font-bold text-white'>
            {winner}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameResultContent;
