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

        {/* 중앙에 안내 문구 추가 */}
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
            <span>{"정답/스킵: '.' 입력"}</span>
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
    </div>
  );
};

export default GameMusicPlayer;
