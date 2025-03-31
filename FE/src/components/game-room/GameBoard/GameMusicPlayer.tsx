import React from 'react';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';

import RoundPlayContent from './RoundPlayContent';
import RoundResultContent from './RoundResultContent';

interface MusicPlayerProps {
  gameState: 'GAME_RESULT' | 'ROUND_START';
}

const GameMusicPlayer = ({ gameState }: MusicPlayerProps) => {
  const { roundInfo } = useGameRoundInfoStore();

  if (!roundInfo) return null;

  const { round: currentRound } = roundInfo;

  return (
    <div className='w-full max-w-full'>
      <div className='mb-2 flex items-center justify-between text-center'>
        <h2 className='text-xl font-bold text-fuchsia-300'>
          라운드 {currentRound}
        </h2>
        <div className='flex flex-col items-center text-sm text-purple-200'>
          {gameState === 'GAME_RESULT' ? (
            <span className='text-fuchsia-300'>
              다음 문제를 풀고싶다면 . 을 눌러주세요!
            </span>
          ) : (
            <span className='text-fuchsia-300'>
              채팅창에 정답을 입력하세요! (스킵: .)
            </span>
          )}
        </div>
      </div>

      {gameState === 'ROUND_START' ? (
        <RoundPlayContent />
      ) : (
        <RoundResultContent />
      )}
    </div>
  );
};

export default GameMusicPlayer;
