import React from 'react';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';

import RoundPlayContent from './RoundPlayContent';
import RoundResultContent from './RoundResultContent';

interface MusicPlayerProps {
  gameState: 'GAME_RESULT' | 'ROUND_START' | 'SCORE_UPDATE';
}

const GameMusicPlayer = ({ gameState }: MusicPlayerProps) => {
  const { roundInfo } = useGameRoundInfoStore();
  if (!roundInfo) return null;
  const { round: currentRound, mode } = roundInfo;
  const isDualMode = mode === 'DUAL';

  return (
    <div className='flex h-full w-full flex-col p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <span className='rounded-md bg-white/10 px-3 py-1 text-xl font-bold text-white'>
            라운드 {currentRound}
          </span>
        </div>

        {gameState === 'ROUND_START' && (
          <div className='text-sm text-white'>
            {isDualMode ? (
              <span className='rounded-md bg-black/30 px-2 py-1'>
                정답방법 :
                <span className='ml-4 font-bold text-cyan-200'>
                  첫번째곡제목 [띄어쓰기] 두번째곡제목
                </span>
              </span>
            ) : (
              <span className='rounded-md bg-black/30 px-2 py-1'>
                정답방법 :
                <span className='ml-4 font-bold text-cyan-200'>
                  노래제목을 입력하세요!
                </span>
              </span>
            )}
          </div>
        )}

        <div className='text-sm font-medium text-cyan-200'>
          {gameState === 'GAME_RESULT' ? (
            <span>{"다음 문제: '.' 입력"}</span>
          ) : (
            <span>{'채팅창에 . 입력시 SKIP'}</span>
          )}
        </div>
      </div>

      <div className='grow rounded-md bg-white/5 p-3'>
        {gameState === 'ROUND_START' ? (
          <RoundPlayContent />
        ) : (
          <RoundResultContent />
        )}
      </div>
      <span className='mt-4 text-center text-cyan-200'>
        {'과반수 이상 스킵할 경우 다음라운드로 넘어갑니다.'}
      </span>
    </div>
  );
};

export default GameMusicPlayer;
