import React, { useState } from 'react';

import { useGameRoundInfoStore } from '@/stores/websocket/useGameRoundInfoStore';
import { useGameRoundResultStore } from '@/stores/websocket/useGameRoundResultStore';
import { useGameScreenStore } from '@/stores/websocket/useGameScreenStore';

import YoutubePlayer from './YoutubePlayer';

// 분리된 플레이어 컴포넌트 임포트

interface MusicPlayerProps {
  gameState: 'GAME_RESULT' | 'QUIZ_OPEN';
}

const GameMusicPlayer = ({ gameState }: MusicPlayerProps) => {
  const [playerError, setPlayerError] = useState<string | null>(null);

  const { songUrl, gameHint } = useGameScreenStore();
  const { roundInfo } = useGameRoundInfoStore();
  const { gameRoundResult } = useGameRoundResultStore();

  const handleError = (error: unknown) => {
    console.error('플레이어 오류:', error);
    setPlayerError('플레이어를 로드하는 중 오류가 발생했습니다.');
  };

  if (!roundInfo) return null;
  if (!songUrl) return <div></div>;

  const { round: currentRound } = roundInfo;

  return (
    <div className='w-full max-w-full'>
      {/* 분리된 플레이어 컴포넌트 */}
      {songUrl && <YoutubePlayer url={songUrl} onError={handleError} />}

      {/* 헤더 */}
      <div className='mb-4 text-center'>
        <h2 className='text-xl font-bold text-fuchsia-300'>
          라운드 {currentRound}
        </h2>
      </div>

      {/* 메인 컨텐츠 */}
      {gameState === 'QUIZ_OPEN' && (
        <div className='flex w-full flex-col text-purple-100'>
          {/* 음악 아이콘 애니메이션 */}
          <div className='mb-4 flex justify-center'>
            <div className='flex items-end space-x-2'>
              {[1, 2, 3, 4].map(bar => (
                <div
                  key={bar}
                  className='w-3 animate-pulse bg-fuchsia-500/70'
                  style={{
                    height: `${16 + bar * 8}px`,
                    animationDelay: `${bar * 0.2}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* 플레이어 오류 표시 */}
          {playerError && (
            <div className='mb-2 text-sm text-red-400'>{playerError}</div>
          )}

          {/* 힌트 정보 */}
          <div className='w-full space-y-4 text-base'>
            <div className='flex justify-between gap-12'>
              <span className='min-w-[40px] font-medium text-purple-200'>
                가수
              </span>
              <span className='font-bold text-fuchsia-200'>
                {!gameHint
                  ? '잠시 후 공개'
                  : gameHint.singer
                    ? gameHint.singer
                    : '잠시 후 공개'}
              </span>
            </div>

            <div className='flex justify-between gap-12'>
              <span className='min-w-[40px] font-medium text-purple-200'>
                제목
              </span>
              <span className='font-bold text-fuchsia-200'>
                {!gameHint
                  ? '잠시 후 공개'
                  : gameHint.title
                    ? gameHint.title
                    : '잠시 후 공개'}
              </span>
            </div>
          </div>

          {/* 안내 텍스트 */}
          <div className='mt-6 flex flex-col items-center text-sm text-purple-200'>
            <span className='text-fuchsia-300'>채팅창에 정답을 입력하세요</span>
            <span className='text-fuchsia-300'> (스킵: .)</span>
          </div>
        </div>
      )}

      {gameState === 'GAME_RESULT' && gameRoundResult && (
        <div className='flex w-full flex-col items-center px-4'>
          <div className='mb-8 text-center'>
            <h3 className='text-xl font-bold text-fuchsia-300'>정답 공개!</h3>
          </div>

          <div className='space-y-4 text-base text-purple-100'>
            {/* 우승자 정보 */}
            {gameRoundResult.winner && (
              <div className='mb-5 flex items-center justify-center'>
                <span className='mb-1 block text-sm font-medium text-purple-200'>
                  정답자
                </span>
                <span className='text-lg font-bold text-yellow-300'>
                  {gameRoundResult.winner}
                </span>
              </div>
            )}

            <div className='flex w-full max-w-full items-center gap-4'>
              <span className='min-w-[40px] font-medium text-purple-200'>
                가수
              </span>
              <span className='min-w-0 overflow-hidden font-bold break-words text-fuchsia-200'>
                {gameRoundResult.singer || '정보 없음'}
              </span>
            </div>

            <div className='flex w-full max-w-full items-center gap-4'>
              <span className='min-w-[40px] font-medium text-purple-200'>
                제목
              </span>
              <span className='min-w-0 overflow-hidden font-bold break-words text-fuchsia-200'>
                {gameRoundResult.songTitle || '정보 없음'}
              </span>
            </div>
          </div>

          <div className='mt-6 text-center text-sm text-fuchsia-200'>
            노래는 재생 중...
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMusicPlayer;
