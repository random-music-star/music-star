import React from 'react';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';

import ScoreRoundPlayContent from './ScoreRoundPlayContent';
import ScoreRoundResultContent from './ScoreRoundResultContent';

interface MusicPlayerProps {
  gameState: 'GAME_RESULT' | 'ROUND_START';
}

const ScoreGameMusicPlayer = ({ gameState }: MusicPlayerProps) => {
  const { roundInfo } = useGameRoundInfoStore();
  if (!roundInfo) return null;
  const { round: currentRound } = roundInfo;
  return (
    <div className='flex h-full w-full flex-col rounded-md border border-purple-200 bg-purple-50 p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-purple-800'>
          라운드 {currentRound}
        </h2>
        <div className='text-base font-medium text-purple-700'>
          {gameState === 'GAME_RESULT' ? (
            <span>{"다음 문제를 풀려면 채팅에 '.' 입력"}</span>
          ) : (
            <span>{"정답 입력: 채팅창에 '.' 입력 (스킵: .)"}</span>
          )}
        </div>
      </div>
      <div className='grow'>
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
