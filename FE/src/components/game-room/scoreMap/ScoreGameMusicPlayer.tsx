import React from 'react';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';

import ScoreRoundPlayContent from './ScoreRoundPlayContent';
import ScoreRoundResultContent from './ScoreRoundResultContent';

interface MusicPlayerProps {
  gameState: 'GAME_RESULT' | 'ROUND_START' | 'SCORE_UPDATE';
}

const ScoreGameMusicPlayer = ({ gameState }: MusicPlayerProps) => {
  const { roundInfo } = useGameRoundInfoStore();
  if (!roundInfo) return null;
  const { round: currentRound } = roundInfo;

  return (
    <div className='flex h-full w-full flex-col p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <span className='rounded-md bg-white/10 px-3 py-1 text-xl font-bold text-white'>
            라운드 {currentRound}
          </span>
        </div>

        <div className='text-sm font-medium text-cyan-200'>
          {gameState === 'GAME_RESULT' ? (
            <span>{"다음 문제: '.' 입력"}</span>
          ) : (
            <span>{"정답/스킵: '.' 입력"}</span>
          )}
        </div>
      </div>

      <div className='grow rounded-md bg-white/5 p-3'>
        {gameState === 'ROUND_START' ? (
          <ScoreRoundPlayContent />
        ) : (
          <ScoreRoundResultContent />
        )}
      </div>
    </div>
  );
};

export default ScoreGameMusicPlayer;
